import openDatabase from "../db/database.js";

import { waitForTransactionCompletion } from "../db/transaction.js";

import {
  buildTimestampDateRange,
  getTimestampFromDateTimeLocal,
} from "../shared/utils/date.utils.js";

import exchangeRpository from "../repositories/exchangeRepository.js";
import cashboxRepository from "../repositories/cashboxrepository.js";
import { getExchangeCalculationType } from "../shared/currencydata/exchange-pairs.js";

// =========== إعدادات الخدمة ============= //
const EXCHANGES_STORE = "exchanges";
const CASHBOXES_STORE = "cashboxes";

// ============== إدارة المعاملات ============= //
async function runInTransaction(storeNames, mode, operation) {
  const db = await openDatabase();

  const tx = db.transaction(storeNames, mode);

  // نراقب اكتمال المعاملة فور إنشائها.
  const completion = waitForTransactionCompletion(tx);

  /* في المسار الرئيسي await completion نتجنب رفضًا غير معالج إذا أُجهضت المعاملة قبل الوصول إلى */
  completion.catch(() => {});

  try {
    const result = await operation(tx);

    // ننتظر اكتمال المعاملة بأكملها.
    await completion;

    return result;
  } catch (error) {
    // قد تكون المعاملة أُجهضت بالفعل.
    // لذلك نحاول إجهاضها مع تجاهل خطأ abort إن كانت قد انتهت.
    try {
      tx.abort();
    } catch {
      // لا حاجة لتنفيذ شيء هنا
    }

    // ننتظر انتهاء المعاملة قبل تمرير الخطأ
    await completion.catch(() => {});

    throw error;
  }
}

// ============= تطبيع بيانات حركة الصرف ============== //
function normalizeExchangeInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Exchange input must be an object.");
  }

  const fromCurrency =
    typeof input.fromCurrency === "string"
      ? input.fromCurrency.trim().toUpperCase()
      : "";

  const toCurrency =
    typeof input.toCurrency === "string"
      ? input.toCurrency.trim().toUpperCase()
      : "";

  const fromAmount = Number(input.fromAmount);

  const rate = Number(input.rate);

  const note =
    input.note === undefined || input.note === null ? "" : input.note;

  if (typeof note !== "string") {
    throw new TypeError("Exchange note must be a string.");
  }

  // input.date قادم من حقل datetime-local.
  // نحوله إلى Timestamp وفق توقيت دمشق.
  const date = getTimestampFromDateTimeLocal(input.date);

  return {
    date,
    fromCurrency,
    toCurrency,
    fromAmount,
    rate,
    note: note.trim(),
  };
}

// ============= التحقق من بيانات حركة الصرف ============== //
function validateExchangeInput(exchange) {
  if (!Number.isSafeInteger(exchange.date)) {
    throw new RangeError("Exchange date is invalid.");
  }

  if (!exchange.fromCurrency || !exchange.toCurrency) {
    throw new Error("Both currencies are required.");
  }

  if (exchange.fromCurrency === exchange.toCurrency) {
    throw new Error("Source and target currencies must be different.");
  }

  if (!Number.isFinite(exchange.fromAmount) || exchange.fromAmount <= 0) {
    throw new RangeError("Source amount must be a valid positive number.");
  }

  if (!Number.isFinite(exchange.rate) || exchange.rate <= 0) {
    throw new RangeError("Exchange rate must be a valid positive number.");
  }

  if (typeof exchange.note !== "string") {
    throw new TypeError("Exchange note must be a string.");
  }

  const pairKey = `${exchange.fromCurrency}-${exchange.toCurrency}`;

  const calculationType = getExchangeCalculationType(exchange.fromCurrency,exchange.toCurrency)

  if (!calculationType) {
    throw new Error(`Unsupported currency pair: ${pairKey}`);
  }

  return calculationType;
}

// ============ حساب المبلغ الناتج ============ //
export function calculateTargetAmount(fromAmount, rate, calculationType) {
  const amount = Number(fromAmount);
  const exchangeRate = Number(rate);

  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(exchangeRate) ||
    amount <= 0 ||
    exchangeRate <= 0
  ) {
    throw new RangeError("Amount and rate must be valid positive numbers.");
  }

  let result;

  if (calculationType === "multiply") {
    result = amount * exchangeRate;
  } else if (calculationType === "divide") {
    result = amount / exchangeRate;
  } else {
    throw new Error(`Invalid calculation type: ${calculationType}`);
  }

  if (!Number.isFinite(result) || result <= 0) {
    throw new RangeError("Calculated target amount is invalid.");
  }

  const roundedResult = Number(result.toFixed(4));

  if (!Number.isFinite(roundedResult) || roundedResult <= 0) {
    throw new RangeError("Calculated target amount is too small or invalid.");
  }

  return roundedResult;
}

// ============= تجهيز الحركة بعد التطبيع والتحقق ============= //
function prepareExchangeInput(input) {
  const normalized = normalizeExchangeInput(input);

  const calculationType = validateExchangeInput(normalized);

  // toAmount لا نثق بقيمة قادمة من الواجهة.
  // بل نحسبه هنا دائمًا انطلاقًا من المبلغ والسعر.
  const toAmount = calculateTargetAmount(
    normalized.fromAmount,
    normalized.rate,
    calculationType
  );

  return {
    ...normalized,
    toAmount,
  };
}

// =========== حساب الأثر المالي للحركة =========== //
function addCurrencyDelta(deltas, currency, amount) {
  const currentDelta = deltas.get(currency) ?? 0;

  deltas.set(currency, currentDelta + amount);
}

// factor = +1 لتطبيق أثر الحركة.
// factor = -1 لعكس أثر الحركة.
function addExchangeEffect(deltas, exchange, factor) {
  // المكتب يستلم fromAmount.
  addCurrencyDelta(deltas, exchange.fromCurrency, factor * exchange.fromAmount);

  // المكتب يدفع toAmount.
  addCurrencyDelta(deltas, exchange.toCurrency, factor * -exchange.toAmount);
}

// تحسب صافي التغييرات المطلوبة في كل صندوق.
// يمكنها التعامل مع الإضافة أو التعديل أو الحذف.
function calculateCashboxDeltas({ oldExchange = null, newExchange = null }) {
  const deltas = new Map();

  // عند التعديل أو الحذف نعكس أثر الحركة القديمة.
  if (oldExchange) {
    addExchangeEffect(deltas, oldExchange, -1);
  }

  // عند الإضافة أو التعديل نطبق أثر الحركة الجديدة.
  if (newExchange) {
    addExchangeEffect(deltas, newExchange, +1);
  }

  return [...deltas.entries()]
    .map(([currency, delta]) => ({
      currency,
      delta,
    }))
    .filter(({ delta }) => delta !== 0);
}

// =========== التحقق من صناديق العملات =========== //
async function assertCashboxesExistAndActive(tx, currencies) {
  const uniqueCurrencies = [...new Set(currencies)];

  const results = await Promise.all(
    uniqueCurrencies.map(async (currency) => ({
      currency,
      cashbox: await cashboxRepository.getCashboxByCurrency(tx, currency),
    }))
  );

  for (const { currency, cashbox } of results) {
    if (!cashbox) {
      throw new Error(`Cashbox does not exist: ${currency}`);
    }

    if (!cashbox.active) {
      throw new Error(`Cashbox is inactive: ${currency}`);
    }
  }
}

/* نتحقق من وجود جميع الصناديق اللازمة
 الصناديق التي كانت مرتبطة بالحركة القديمة لا يشترط
 أن تكون نشطة حتى نتمكن من عكس أثر الحركة القديمة
 أما أي عملة جديدة في الحركة المعدّلة فيجب أن يكون
 صندوقها موجودًا ونشطًا */
async function assertCashboxesForUpdate(tx, oldExchange, newExchange) {
  const oldCurrencies = new Set([
    oldExchange.fromCurrency,
    oldExchange.toCurrency,
  ]);

  const newCurrencies = new Set([
    newExchange.fromCurrency,
    newExchange.toCurrency,
  ]);

  const allCurrencies = new Set([...oldCurrencies, ...newCurrencies]);

  const results = await Promise.all(
    [...allCurrencies].map(async (currency) => ({
      currency,
      cashbox: await cashboxRepository.getCashboxByCurrency(tx, currency),
    }))
  );

  const cashboxesByCurrency = new Map();

  for (const { currency, cashbox } of results) {
    if (!cashbox) {
      throw new Error(`Required cashbox does not exist: ${currency}`);
    }

    cashboxesByCurrency.set(currency, cashbox);
  }

  for (const currency of newCurrencies) {
    // إن كانت العملة موجودة في الحركة القديمة،
    // نسمح بتصحيح الحركة حتى لو أصبح صندوقها معطّلًا.
    if (oldCurrencies.has(currency)) {
      continue;
    }

    // العملة الجديدة فلا نسمح بإضافتها
    // إلى حركة معدّلة إلا إذا كان صندوقها نشطًا
    const cashbox = cashboxesByCurrency.get(currency);

    if (!cashbox.active) {
      throw new Error(`New currency cashbox is inactive: ${currency}`);
    }
  }
}

// عند الحذف نحتاج إلى وجود الصناديق القديمة فقط.
// لا نشترط أن تكون نشطة
async function assertCashboxesExist(tx, currencies) {
  const uniqueCurrencies = [...new Set(currencies)];

  const results = await Promise.all(
    uniqueCurrencies.map(async (currency) => ({
      currency,
      cashbox: await cashboxRepository.getCashboxByCurrency(tx, currency),
    }))
  );

  for (const { currency, cashbox } of results) {
    if (!cashbox) {
      throw new Error(`Required cashbox does not exist: ${currency}`);
    }
  }
}

// ============ تطبيق التغييرات على الصناديق ============ //
async function applyCashboxDeltas(tx, deltas) {
  for (const { currency, delta } of deltas) {
    if (delta === 0) {
      continue;
    }

    await cashboxRepository.adjustCashboxBalance(tx, currency, delta);
  }
}

// ============  الاستعلام عن الحركات ========== //
export async function queryExchangesService(filters = {}) {
  const dateRange = buildTimestampDateRange({
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });

  const repositoryFilters = {
    ...dateRange,

    fromCurrency:
      typeof filters.fromCurrency === "string" && filters.fromCurrency.trim()
        ? filters.fromCurrency.trim().toUpperCase()
        : undefined,

    toCurrency:
      typeof filters.toCurrency === "string" && filters.toCurrency.trim()
        ? filters.toCurrency.trim().toUpperCase()
        : undefined,

    note: typeof filters.note === "string" ? filters.note.trim() : "",
  };

  return runInTransaction([EXCHANGES_STORE], "readonly", (tx) =>
    exchangeRpository.queryExchanges(tx, repositoryFilters)
  );
}

// =========== جلب حركة واحدة ========== //
export async function getExchangeByIdService(id) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new RangeError("Exchange ID must be a valid positive integer.");
  }

  return runInTransaction([EXCHANGES_STORE], "readonly", async (tx) => {
    const exchange = await exchangeRpository.getExchangeById(tx, id);

    return exchange ?? null;
  });
}

// ============ إضافة حركة صرف ============ //
export async function createExchangeService(formData) {
  // أولًا: تجهيز البيانات والتحقق منها قبل فتح المعاملة.
  const preparedExchange = prepareExchangeInput(formData);

  return runInTransaction(
    [EXCHANGES_STORE, CASHBOXES_STORE],
    "readwrite",
    async (tx) => {
      // نسمح بإضافة حركة جديدة فقط إذا كان
      // الصندوقان موجودين ونشطين.
      await assertCashboxesExistAndActive(tx, [
        preparedExchange.fromCurrency,
        preparedExchange.toCurrency,
      ]);

      const now = Date.now();

      const newExchange = {
        ...preparedExchange,
        updatedAt: now,
      };

      // إضافة سجل الحركة.
      const createdExchange = await exchangeRpository.addExchange(
        tx,
        newExchange
      );

      // حساب أثر الحركة وتطبيقه على الصناديق.
      const deltas = calculateCashboxDeltas({
        newExchange: createdExchange,
      });

      await applyCashboxDeltas(tx, deltas);

      return createdExchange;
    }
  );
}

// ========= تعديل حركة صرف ========= //
export async function updateExchangeService(id, formData) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new RangeError("Exchange ID must be a valid positive integer.");
  }

  // نجهز بيانات الحركة المعدّلة قبل فتح المعاملة.
  const preparedExchange = prepareExchangeInput(formData);

  return runInTransaction(
    [EXCHANGES_STORE, CASHBOXES_STORE],
    "readwrite",
    async (tx) => {
      // نقرأ السجل القديم داخل المعاملة نفسها.
      const oldExchange = await exchangeRpository.getExchangeById(tx, id);

      if (!oldExchange) {
        throw new Error(`Exchange does not exist: ${id}`);
      }

      const updatedExchange = {
        ...preparedExchange,
        id: oldExchange.id,
        updatedAt: Date.now(),
      };

      // نتحقق من وجود كل الصناديق المطلوبة.
      // العملات الجديدة فقط يجب أن تكون نشطة
      await assertCashboxesForUpdate(tx, oldExchange, updatedExchange);

      // عكس أثر الحركة القديمة وتطبيق الأثر الجديد
      // في صورة صافي تغيير لكل عملة
      const deltas = calculateCashboxDeltas({
        oldExchange,
        newExchange: updatedExchange,
      });

      await applyCashboxDeltas(tx, deltas);

      // حفظ السجل المعدل
      const savedExchange = await exchangeRpository.updateExchange(
        tx,
        updatedExchange
      );

      return savedExchange;
    }
  );
}

// =========== حذف حركة صرف ============ //
export async function deleteExchangeService(id) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new RangeError("Exchange ID must be a valid positive integer.");
  }

  return runInTransaction(
    [EXCHANGES_STORE, CASHBOXES_STORE],
    "readwrite",
    async (tx) => {
      // جلب الحركة القديمة لحساب عكس أثرها
      const oldExchange = await exchangeRpository.getExchangeById(tx, id);

      if (!oldExchange) {
        throw new Error(`Exchange does not exist: ${id}`);
      }

      // يجب أن توجد الصناديق المرتبطة بالحركة،
      // لكن لا نشترط أن تكون نشطة
      await assertCashboxesExist(tx, [
        oldExchange.fromCurrency,
        oldExchange.toCurrency,
      ]);

      // عكس أثر الحركة القديمة.
      const deltas = calculateCashboxDeltas({
        oldExchange,
      });

      await applyCashboxDeltas(tx, deltas);

      // حذف سجل الحركة
      await exchangeRpository.deleteExchange(tx, id);

      // نعيد الحركة القديمة بعد اكتمال المعاملة
      // ليستطيع المستدعي معرفة ما الذي حُذف
      return oldExchange;
    }
  );
}
