import { runInTransaction } from "../db/transaction.js";

import {
  buildTimestampDateRange,
  getTimestampFromDateTimeLocal,
} from "../shared/utilsDate.js";

import electronicWalletRepository from "../repositories/electronicWalletRepository.js";
import electronicWalletBalanceRepository from "../repositories/electronicWalletBalanceRepository.js";
import electronicWalletOperationRepository from "../repositories/electronicWalletOperationRepository.js";
import cashboxRepository from "../repositories/cashboxrepository.js";

import { markBackupDirty } from "./backupSchedulerService.js";

// ============================================================
// إعدادات الخدمة وأسماء مخازن IndexedDB
// ============================================================

const WALLETS_STORE = "electronicWallets";
const WALLET_BALANCES_STORE = "electronicWalletBalances";
const WALLET_OPERATIONS_STORE = "electronicWalletOperations";
const CASHBOXES_STORE = "cashboxes";

const WALLET_OPERATION_TYPES = new Set([
  "opening_balance",
  "withdrawal",
  "deposit",
  "external_in",
  "external_out",
  "adjustment",
]);

const CASHBOX_OPERATION_TYPES = new Set(["withdrawal", "deposit"]);
const FEE_OPERATION_TYPES = new Set(["withdrawal", "deposit"]);

// هامش صغير لمعالجة فروق IEEE-754 الناتجة عن العمليات العشرية.
// لا نستخدمه للسماح برصيد سالب حقيقي.
const MONEY_EPSILON = 1e-9;

// ============================================================
// أدوات عامة للتطبيع والتحقق
// ============================================================

// تحويل المعرّف النصي القادم غالبًا من React Router إلى رقم.
function normalizeId(id) {
  if (
    typeof id === "string" &&
    id.trim() !== "" &&
    Number.isFinite(Number(id))
  ) {
    return Number(id);
  }

  return id;
}

function hasTimestamp(value) {
  return typeof value === "number" && Number.isSafeInteger(value);
}

function normalizeCurrency(currency) {
  return typeof currency === "string" ? currency.trim().toUpperCase() : "";
}

function normalizeNote(note) {
  if (note === undefined || note === null) {
    return "";
  }

  if (typeof note !== "string") {
    throw new TypeError("يجب أن تكون الملاحظة نصاً.");
  }

  return note.trim();
}

// يدعم تاريخ datetime-local القادم من الواجهة، أو Timestamp رقمي.
// عند عدم إرسال التاريخ في التعديل نحافظ على تاريخ الحركة القديمة.
function normalizeOperationDate(value, fallbackDate = Date.now()) {
  if (value === undefined || value === null || value === "") {
    return fallbackDate;
  }

  if (typeof value === "number") {
    if (!hasTimestamp(value)) {
      throw new RangeError("تاريخ العملية غير صالح.");
    }

    return value;
  }

  if (typeof value === "string") {
    return getTimestampFromDateTimeLocal(value);
  }

  throw new TypeError("صيغة تاريخ العملية غير مدعومة.");
}

function assertValidWalletId(walletId) {
  const normalizedId = normalizeId(walletId);

  // مخزن المحافظ يستخدم id من نوع autoIncrement، لذلك نتوقع رقمًا صحيحًا موجبًا.
  if (
    typeof normalizedId !== "number" ||
    !Number.isSafeInteger(normalizedId) ||
    normalizedId <= 0
  ) {
    throw new RangeError("معرّف المحفظة غير صالح.");
  }
}

function assertValidOperationId(operationId) {
  const normalizedId = normalizeId(operationId);

  if (
    typeof normalizedId !== "number" ||
    !Number.isSafeInteger(normalizedId) ||
    normalizedId <= 0
  ) {
    throw new RangeError("معرّف العملية غير صالح.");
  }

  return normalizedId;
}

// ============================================================
// تطبيع بيانات المحفظة والتحقق منها
// ============================================================

function normalizeWalletData(data, currentWallet = null) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new TypeError("بيانات المحفظة غير صالحة.");
  }

  const nameValue = data.name ?? currentWallet?.name;
  const providerValue = data.provider ?? currentWallet?.provider;

  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const provider =
    typeof providerValue === "string" ? providerValue.trim() : "";

  const logoWasProvided = Object.prototype.hasOwnProperty.call(data, "logo");
  const logo = logoWasProvided ? data.logo : currentWallet?.logo ?? null;

  if (
    logo !== null &&
    (typeof Blob === "undefined" || !(logo instanceof Blob))
  ) {
    throw new TypeError("شعار المحفظة يجب أن يكون Blob أو null.");
  }

  return {
    name,
    provider,
    logo,
    note: normalizeNote(data.note ?? currentWallet?.note ?? ""),
    createdAt: currentWallet?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };
}

function validateWalletData(wallet) {
  if (!wallet.name) {
    throw new Error("اسم المحفظة مطلوب.");
  }

  if (!wallet.provider) {
    throw new Error("مزود المحفظة مطلوب.");
  }

  if (typeof wallet.note !== "string") {
    throw new TypeError("ملاحظة المحفظة غير صالحة.");
  }
}

// نسمح بتكرار مزود الخدمة، لكن لا نسمح بحدوثه بصمت.
// عند وجود تكرار نعيد خطأً يحمل code واضحًا لتستطيع الواجهة إظهار تأكيد للمستخدم.
async function assertProviderDuplicateConfirmed(
  tx,
  provider,
  confirmDuplicateProvider,
  excludedWalletId = null
) {
  const wallets = await electronicWalletRepository.getWalletsByProvider(
    tx,
    provider
  );

  const duplicates = wallets.filter((wallet) => wallet.id !== excludedWalletId);

  if (duplicates.length > 0 && confirmDuplicateProvider !== true) {
    const error = new Error(
      "توجد محفظة أخرى مرتبطة بمزود الخدمة نفسه. يرجى تأكيد إنشاء محفظة إضافية."
    );

    error.code = "DUPLICATE_WALLET_PROVIDER";
    error.duplicateWallets = duplicates.map(({ id, name, provider }) => ({
      id,
      name,
      provider,
    }));

    throw error;
  }
}

// ============================================================
// تطبيع بيانات عمليات المحافظ
// ============================================================

function normalizeWalletOperationData(
  data,
  walletId,
  currentOperation = null,
  forcedOperationType = null
) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new TypeError("بيانات عملية المحفظة غير صالحة.");
  }

  const operationType =
    forcedOperationType ??
    data.operationType ??
    currentOperation?.operationType;

  const currency = normalizeCurrency(
    data.currency ?? currentOperation?.currency
  );

  const amount = Number(data.amount ?? currentOperation?.amount);

  const isFeeOperation = FEE_OPERATION_TYPES.has(operationType);

  const feeAmount = isFeeOperation
    ? Number(data.feeAmount ?? currentOperation?.feeAmount ?? 0)
    : 0;

  const feeMode = isFeeOperation
    ? data.feeMode ?? currentOperation?.feeMode ?? "separate"
    : null;

  const date = normalizeOperationDate(
    data.date,
    currentOperation?.date ?? Date.now()
  );

  return {
    walletId: currentOperation?.walletId ?? normalizeId(walletId),
    currency,
    operationType,
    amount,
    feeAmount,
    feeMode,
    date,
    note: normalizeNote(data.note ?? currentOperation?.note ?? ""),
    updatedAt: Date.now(),
  };
}

function validateWalletOperation(
  operation,
  currentOperation = null,
  { allowOpeningBalance = false } = {}
) {
  if (!WALLET_OPERATION_TYPES.has(operation.operationType)) {
    throw new Error("نوع عملية المحفظة غير مدعوم.");
  }

  // opening_balance مخصص لإنشاء رصيد عملة داخل المحفظة.
  // نسمح بتعديل عملية افتتاحية موجودة، لكن لا نسمح بتحويل عملية عادية إليه.
  if (
    operation.operationType === "opening_balance" &&
    currentOperation?.operationType !== "opening_balance" &&
    !allowOpeningBalance
  ) {
    throw new Error(
      "لا يمكن إنشاء رصيد افتتاحي من شاشة العمليات؛ أضف العملة إلى المحفظة أولاً."
    );
  }

  if (!operation.currency) {
    throw new Error("يجب تحديد عملة العملية.");
  }

  if (!hasTimestamp(operation.date)) {
    throw new Error("تاريخ العملية غير صالح.");
  }

  if (operation.operationType === "adjustment") {
    // في التسوية تكون amount موقعة:
    // موجب = زيادة رصيد المحفظة، سالب = إنقاص رصيدها.
    if (!Number.isFinite(operation.amount) || operation.amount === 0) {
      throw new RangeError("مبلغ التسوية يجب أن يكون رقماً غير صفري.");
    }

    if (!operation.note) {
      throw new Error("يجب كتابة سبب واضح لعملية التسوية.");
    }
  } else if (!Number.isFinite(operation.amount) || operation.amount <= 0) {
    throw new RangeError("مبلغ العملية يجب أن يكون أكبر من صفر.");
  }

  if (FEE_OPERATION_TYPES.has(operation.operationType)) {
    if (!Number.isFinite(operation.feeAmount) || operation.feeAmount < 0) {
      throw new RangeError("قيمة العمولة غير صالحة.");
    }

    if (!["separate", "included"].includes(operation.feeMode)) {
      throw new Error("طريقة احتساب العمولة غير صحيحة.");
    }

    if (operation.feeAmount >= operation.amount && operation.feeAmount > 0) {
      throw new RangeError("يجب أن تكون العمولة أقل من مبلغ العملية الأساسي.");
    }
  }

  if (!Number.isFinite(operation.updatedAt)) {
    throw new RangeError("وقت تحديث العملية غير صالح.");
  }
}

// ============================================================
// حساب الأثر المالي للعملية
// ============================================================

/*
  نعيد أثر العملية على جانبين:

  walletDelta:
    التغيير الذي سيطرأ على رصيد المحفظة.

  cashboxDelta:
    التغيير الذي سيطرأ على الصندوق النقدي المقابل.

  factor = +1 يعني تطبيق أثر العملية.
  factor = -1 يعني عكس أثر العملية.
*/
function calculateWalletOperationEffects(operation) {
  const { operationType, amount, feeAmount = 0, feeMode } = operation;

  switch (operationType) {
    case "opening_balance":
      return {
        walletDelta: amount,
        cashboxDelta: 0,
      };

    case "withdrawal":
      return {
        // العميل يحول المبلغ إلى المحفظة، لذلك رصيدها يزيد.
        walletDelta: amount,

        // الصندوق يدفع المبلغ النقدي ويستلم العمولة.
        // سواء دفعت العمولة بشكل منفصل أو خُصمت من النقد المسلم
        // فصافي حركة الصندوق هو -(amount - feeAmount).
        cashboxDelta: -(amount - feeAmount),
      };

    case "deposit":
      if (feeMode === "included") {
        // amount هو النقد الذي استلمه المكتب من العميل.
        // العمولة تُخصم من المبلغ الذي سيخرج إلكترونيًا.
        return {
          walletDelta: -(amount - feeAmount),
          cashboxDelta: amount,
        };
      }

      // separate:
      // المحفظة ترسل amount، والعميل يسلم amount + fee نقدًا.
      return {
        walletDelta: -amount,
        cashboxDelta: amount + feeAmount,
      };

    case "external_in":
      return {
        walletDelta: amount,
        cashboxDelta: 0,
      };

    case "external_out":
      return {
        walletDelta: -amount,
        cashboxDelta: 0,
      };

    case "adjustment":
      // amount موقعة في هذا النوع فقط.
      return {
        walletDelta: amount,
        cashboxDelta: 0,
      };

    default:
      throw new Error("لا يمكن حساب أثر نوع العملية هذا.");
  }
}

function addDeltaToMap(map, key, delta) {
  if (delta === 0) {
    return;
  }

  map.set(key, (map.get(key) ?? 0) + delta);
}

// يحسب صافي الأثر الناتج عن عكس العملية القديمة وتطبيق الجديدة.
// استخدام Map يجمع التغييرات المتكررة للعملة نفسها قبل تطبيقها.
function calculateOperationDeltas({
  oldOperation = null,
  newOperation = null,
}) {
  const walletDeltas = new Map();
  const cashboxDeltas = new Map();

  if (oldOperation) {
    const oldEffects = calculateWalletOperationEffects(oldOperation);

    addDeltaToMap(walletDeltas, oldOperation.currency, -oldEffects.walletDelta);
    addDeltaToMap(
      cashboxDeltas,
      oldOperation.currency,
      -oldEffects.cashboxDelta
    );
  }

  if (newOperation) {
    const newEffects = calculateWalletOperationEffects(newOperation);

    addDeltaToMap(walletDeltas, newOperation.currency, newEffects.walletDelta);
    addDeltaToMap(
      cashboxDeltas,
      newOperation.currency,
      newEffects.cashboxDelta
    );
  }

  return {
    walletDeltas,
    cashboxDeltas,
  };
}

function getCashboxImpactCurrencies(operation) {
  if (!operation || !CASHBOX_OPERATION_TYPES.has(operation.operationType)) {
    return new Set();
  }

  return new Set([operation.currency]);
}

// ============================================================
// التحقق من وجود المحفظة والرصيد والصناديق
// ============================================================

async function getRequiredWallet(tx, walletId) {
  const wallet = await electronicWalletRepository.getWalletById(tx, walletId);

  if (!wallet) {
    throw new Error("المحفظة المطلوبة غير موجودة.");
  }

  return wallet;
}

async function assertWalletIsActive(wallet) {
  if (!wallet.active) {
    throw new Error("هذه المحفظة غير نشطة، ولا يمكن تسجيل عمليات جديدة عليها.");
  }
}

async function getRequiredWalletBalance(tx, walletId, currency) {
  const walletBalance =
    await electronicWalletBalanceRepository.getWalletBalance(
      tx,
      walletId,
      currency
    );

  if (!walletBalance) {
    throw new Error(
      `العملة ${currency} غير مضافة إلى هذه المحفظة. أضف العملة أولاً.`
    );
  }

  const balance = Number(walletBalance.balance);

  if (!Number.isFinite(balance) || balance < 0) {
    throw new Error(
      `رصيد ${currency} في المحفظة غير صالح. يرجى مراجعة بيانات المحفظة.`
    );
  }

  return walletBalance;
}

async function assertWalletCurrenciesExist(tx, walletId, currencies) {
  const uniqueCurrencies = [...new Set(currencies)];

  for (const currency of uniqueCurrencies) {
    await getRequiredWalletBalance(tx, walletId, currency);
  }
}

async function getRequiredCashbox(tx, currency, requireActive = false) {
  const cashbox = await cashboxRepository.getCashboxByCurrency(tx, currency);

  if (!cashbox) {
    throw new Error(`لا يوجد صندوق نقدي للعملة ${currency}.`);
  }

  if (requireActive && !cashbox.active) {
    throw new Error(`الصندوق النقدي للعملة ${currency} غير نشط.`);
  }

  return cashbox;
}

async function assertCashboxesForCreation(tx, operation) {
  if (!CASHBOX_OPERATION_TYPES.has(operation.operationType)) {
    return;
  }

  await getRequiredCashbox(tx, operation.currency, true);
}

async function assertCashboxesForDeletion(tx, oldOperation) {
  const oldCurrencies = [...getCashboxImpactCurrencies(oldOperation)];

  for (const currency of oldCurrencies) {
    // لا نشترط أن يكون الصندوق نشطًا لعكس عملية قديمة أو حذفها.
    await getRequiredCashbox(tx, currency, false);
  }
}

async function assertCashboxesForUpdate(tx, oldOperation, newOperation) {
  const oldCurrencies = getCashboxImpactCurrencies(oldOperation);
  const newCurrencies = getCashboxImpactCurrencies(newOperation);
  const allCurrencies = new Set([...oldCurrencies, ...newCurrencies]);

  const cashboxesByCurrency = new Map();

  for (const currency of allCurrencies) {
    const cashbox = await getRequiredCashbox(tx, currency, false);
    cashboxesByCurrency.set(currency, cashbox);
  }

  // أي صندوق سيبدأ بالتأثر في العملية الجديدة ولم يكن متأثرًا بالقديمة
  // يجب أن يكون نشطًا. أما الصندوق القديم فيكفينا وجوده لعكس الأثر.
  for (const currency of newCurrencies) {
    if (oldCurrencies.has(currency)) {
      continue;
    }

    const cashbox = cashboxesByCurrency.get(currency);

    if (!cashbox.active) {
      throw new Error(`الصندوق النقدي للعملة ${currency} غير نشط.`);
    }
  }
}

// ============================================================
// تطبيق التغييرات على أرصدة المحافظ والصناديق
// ============================================================

async function applyWalletBalanceDeltas(tx, walletId, walletDeltas) {
  for (const [currency, delta] of walletDeltas.entries()) {
    if (delta === 0) {
      continue;
    }

    const walletBalance = await getRequiredWalletBalance(
      tx,
      walletId,
      currency
    );

    const currentBalance = Number(walletBalance.balance);
    const calculatedBalance = currentBalance + delta;

    if (calculatedBalance < -MONEY_EPSILON) {
      throw new Error(
        `لا يمكن تنفيذ العملية؛ رصيد ${currency} في المحفظة لا يكفي. الرصيد الحالي: ${currentBalance}.`
      );
    }

    // إذا نتج رقم سالب أصغر من هامش الخطأ العشري، نصفر الرصيد فعليًا
    // بدل تخزين قيمة مثل -0.0000000001.
    const safeDelta = calculatedBalance < 0 ? -currentBalance : delta;

    await electronicWalletBalanceRepository.adjustWalletBalance(
      tx,
      walletId,
      currency,
      safeDelta
    );
  }
}

async function applyCashboxBalanceDeltas(tx, cashboxDeltas) {
  for (const [currency, delta] of cashboxDeltas.entries()) {
    if (delta === 0) {
      continue;
    }

    // صناديق المكتب تسمح بالرصيد السالب وفق قواعد المشروع الحالية.
    // نحتاج فقط إلى وجود الصندوق حتى نستطيع تطبيق الأثر أو عكسه.
    await getRequiredCashbox(tx, currency, false);

    await cashboxRepository.adjustCashboxBalance(tx, currency, delta);
  }
}

// ============================================================
// خدمات القراءة
// ============================================================

export function getWalletsOverviewService() {
  return runInTransaction(
    [WALLETS_STORE, WALLET_BALANCES_STORE],
    "readonly",
    async (tx) => {
      const wallets = await electronicWalletRepository.getAllWallets(tx);

      return Promise.all(
        wallets.map(async (wallet) => {
          const balances =
            await electronicWalletBalanceRepository.getWalletBalancesByWalletId(
              tx,
              wallet.id
            );

          return {
            ...wallet,
            balances,
          };
        })
      );
    }
  );
}

export function getWalletByIdService(walletId) {
  assertValidWalletId(walletId);

  return runInTransaction([WALLETS_STORE], "readonly", async (tx) => {
    const wallet = await electronicWalletRepository.getWalletById(
      tx,
      normalizeId(walletId)
    );

    return wallet ?? null;
  });
}

export function getWalletDetailsService(walletId) {
  assertValidWalletId(walletId);

  return runInTransaction(
    [WALLETS_STORE, WALLET_BALANCES_STORE],
    "readonly",
    async (tx) => {
      const id = normalizeId(walletId);
      const wallet = await getRequiredWallet(tx, id);

      const balances =
        await electronicWalletBalanceRepository.getWalletBalancesByWalletId(
          tx,
          id
        );

      return {
        wallet,
        balances,
      };
    }
  );
}

export function getWalletsByProviderService(provider) {
  const normalizedProvider =
    typeof provider === "string" ? provider.trim() : "";

  if (!normalizedProvider) {
    throw new Error("يجب تحديد مزود المحفظة.");
  }

  return runInTransaction([WALLETS_STORE], "readonly", (tx) =>
    electronicWalletRepository.getWalletsByProvider(tx, normalizedProvider)
  );
}
// الاستعلام عن عمليات محفظة باستخدام الفلاتر
export function queryWalletOperationsService(walletId, filters = {}) {
    assertValidWalletId(walletId);
  
    // تحويل فلاتر التاريخ القادمة من الواجهة إلى Timestamp
    const dateRange = buildTimestampDateRange({
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    });
  
    const normalizedFilters = {
      ...filters,
  
      walletId: normalizeId(walletId),
  
      ...dateRange,
  
      currency: normalizeCurrency(filters.currency) || undefined,
  
      operationType: filters.operationType || undefined,
  
      note: typeof filters.note === "string" ? filters.note.trim() : "",
    };
  
    return runInTransaction(
      [WALLET_OPERATIONS_STORE],
      "readonly",
      async (tx) => {
        const operations =
          await electronicWalletOperationRepository.queryWalletOperations(
            tx,
            normalizedFilters
          );
  
        // ترتيب العمليات من الأحدث إلى الأقدم
        return [...operations].sort((a, b) => b.date - a.date);
      }
    );
  }

// ============================================================
// خدمات إنشاء وتعديل بيانات المحفظة نفسها
// ============================================================

export async function addWalletService(formData) {
  if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
    throw new TypeError("بيانات المحفظة غير صالحة.");
  }

  const { confirmDuplicateProvider = false, ...walletFormData } = formData;
  const wallet = normalizeWalletData(walletFormData);

  validateWalletData(wallet);

  const createdWallet = await runInTransaction(
    [WALLETS_STORE],
    "readwrite",
    async (tx) => {
      await assertProviderDuplicateConfirmed(
        tx,
        wallet.provider,
        confirmDuplicateProvider
      );

      const id = await electronicWalletRepository.addWallet(tx, {
        ...wallet,
        active: true,
      });

      return {
        ...wallet,
        id,
        active: true,
      };
    }
  );

  markBackupDirty("created-electronic-wallet");

  return createdWallet;
}

export async function updateWalletService(walletId, formData) {
  assertValidWalletId(walletId);

  if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
    throw new TypeError("بيانات المحفظة غير صالحة.");
  }

  const id = normalizeId(walletId);
  const { confirmDuplicateProvider = false, ...walletFormData } = formData;

  const updatedWallet = await runInTransaction(
    [WALLETS_STORE],
    "readwrite",
    async (tx) => {
      const currentWallet = await getRequiredWallet(tx, id);

      const normalizedWallet = normalizeWalletData(
        walletFormData,
        currentWallet
      );

      validateWalletData(normalizedWallet);

      await assertProviderDuplicateConfirmed(
        tx,
        normalizedWallet.provider,
        confirmDuplicateProvider,
        currentWallet.id
      );

      const walletToSave = {
        ...currentWallet,
        ...normalizedWallet,
        id: currentWallet.id,
        active: currentWallet.active,
      };

      await electronicWalletRepository.updateWallet(tx, walletToSave);

      return walletToSave;
    }
  );

  markBackupDirty("updated-electronic-wallet");

  return updatedWallet;
}

export async function setWalletActiveService(walletId, active) {
  assertValidWalletId(walletId);

  if (typeof active !== "boolean") {
    throw new TypeError("قيمة تفعيل المحفظة غير صالحة.");
  }

  const id = normalizeId(walletId);

  const updatedWallet = await runInTransaction(
    [WALLETS_STORE],
    "readwrite",
    async (tx) => {
      const wallet = await getRequiredWallet(tx, id);

      await electronicWalletRepository.setWalletActive(tx, id, active);

      return {
        ...wallet,
        active,
      };
    }
  );

  markBackupDirty(
    active ? "activated-electronic-wallet" : "deactivated-electronic-wallet"
  );

  return updatedWallet;
}

// ============================================================
// إضافة عملة إلى محفظة مع تسجيل الرصيد الافتتاحي
// ============================================================

export async function addWalletCurrencyService(walletId, formData) {
  assertValidWalletId(walletId);

  if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
    throw new TypeError("بيانات العملة غير صالحة.");
  }

  const id = normalizeId(walletId);
  const currency = normalizeCurrency(formData.currency);
  const openingBalance = Number(formData.openingBalance ?? 0);
  const note = normalizeNote(formData.note ?? "");

  if (!currency) {
    throw new Error("يجب اختيار العملة.");
  }

  if (!Number.isFinite(openingBalance) || openingBalance < 0) {
    throw new RangeError("الرصيد الافتتاحي يجب أن يكون صفرًا أو أكبر.");
  }

  const result = await runInTransaction(
    [
      WALLETS_STORE,
      WALLET_BALANCES_STORE,
      WALLET_OPERATIONS_STORE,
      CASHBOXES_STORE,
    ],
    "readwrite",
    async (tx) => {
      const wallet = await getRequiredWallet(tx, id);
      await assertWalletIsActive(wallet);

      // في تصميم المشروع نضيف إلى المحفظة العملات التي لها صندوق مقابل.
      await getRequiredCashbox(tx, currency, true);

      const existingBalance =
        await electronicWalletBalanceRepository.getWalletBalance(
          tx,
          id,
          currency
        );

      if (existingBalance) {
        throw new Error(`العملة ${currency} مضافة إلى هذه المحفظة مسبقًا.`);
      }

      const now = Date.now();

      // ننشئ سجل العملة برصيد صفر أولًا.
      // بعدها يصبح أي ارتفاع في الرصيد ناتجًا عن عملية opening_balance.
      await electronicWalletBalanceRepository.addWalletBalance(tx, {
        walletId: id,
        currency,
        balance: 0,
        updatedAt: now,
      });

      let openingOperation = null;

      // لا ننشئ حركة افتتاحية صفرية؛ لأنها لا تمثل حركة مالية فعلية.
      if (openingBalance > 0) {
        const operation = normalizeWalletOperationData(
          {
            currency,
            operationType: "opening_balance",
            amount: openingBalance,
            date: formData.date,
            note,
          },
          id,
          null,
          "opening_balance"
        );

        validateWalletOperation(operation, null, {
          allowOpeningBalance: true,
        });

        const operationId =
          await electronicWalletOperationRepository.addWalletOperation(
            tx,
            operation
          );

        await applyWalletBalanceDeltas(
          tx,
          id,
          new Map([[currency, openingBalance]])
        );

        openingOperation = {
          ...operation,
          id: operationId,
        };
      }

      return {
        walletId: id,
        currency,
        balance: openingBalance,
        updatedAt: now,
        openingOperation,
      };
    }
  );

  markBackupDirty("created-electronic-wallet-currency");

  return result;
}

// ============================================================
// إنشاء العمليات المالية
// ============================================================

async function createWalletOperationService(
  walletId,
  formData,
  operationType,
  backupReason
) {
  assertValidWalletId(walletId);

  const id = normalizeId(walletId);

  const operation = normalizeWalletOperationData(
    formData,
    id,
    null,
    operationType
  );

  validateWalletOperation(operation, null);

  const createdOperation = await runInTransaction(
    [
      WALLETS_STORE,
      WALLET_BALANCES_STORE,
      WALLET_OPERATIONS_STORE,
      CASHBOXES_STORE,
    ],
    "readwrite",
    async (tx) => {
      const wallet = await getRequiredWallet(tx, id);
      await assertWalletIsActive(wallet);

      await assertWalletCurrenciesExist(tx, id, [operation.currency]);
      await assertCashboxesForCreation(tx, operation);

      const effects = calculateWalletOperationEffects(operation);

      const operationId =
        await electronicWalletOperationRepository.addWalletOperation(
          tx,
          operation
        );

      await applyWalletBalanceDeltas(
        tx,
        id,
        new Map([[operation.currency, effects.walletDelta]])
      );

      await applyCashboxBalanceDeltas(
        tx,
        new Map([[operation.currency, effects.cashboxDelta]])
      );

      return {
        ...operation,
        id: operationId,
      };
    }
  );

  markBackupDirty(backupReason);

  return createdOperation;
}

export function createWithdrawalService(walletId, formData) {
  return createWalletOperationService(
    walletId,
    formData,
    "withdrawal",
    "created-wallet-withdrawal"
  );
}

export function createDepositService(walletId, formData) {
  return createWalletOperationService(
    walletId,
    formData,
    "deposit",
    "created-wallet-deposit"
  );
}

export function createExternalInService(walletId, formData) {
  return createWalletOperationService(
    walletId,
    formData,
    "external_in",
    "created-wallet-external-in"
  );
}

export function createExternalOutService(walletId, formData) {
  return createWalletOperationService(
    walletId,
    formData,
    "external_out",
    "created-wallet-external-out"
  );
}

export function createWalletAdjustmentService(walletId, formData) {
  return createWalletOperationService(
    walletId,
    formData,
    "adjustment",
    "created-wallet-adjustment"
  );
}

// ============================================================
// تعديل عملية قديمة مع عكس أثرها وتطبيق الأثر الجديد
// ============================================================

export async function updateWalletOperationService(
  walletId,
  operationId,
  formData
) {
  assertValidWalletId(walletId);

  const id = normalizeId(walletId);
  const operationID = assertValidOperationId(operationId);

  const updatedOperation = await runInTransaction(
    [
      WALLETS_STORE,
      WALLET_BALANCES_STORE,
      WALLET_OPERATIONS_STORE,
      CASHBOXES_STORE,
    ],
    "readwrite",
    async (tx) => {
      await getRequiredWallet(tx, id);

      const oldOperation =
        await electronicWalletOperationRepository.getWalletOperationById(
          tx,
          operationID
        );

      if (!oldOperation || oldOperation.walletId !== id) {
        throw new Error("العملية غير موجودة ضمن هذه المحفظة.");
      }

      const normalizedOperation = normalizeWalletOperationData(
        formData,
        id,
        oldOperation
      );

      const newOperation = {
        ...normalizedOperation,
        id: oldOperation.id,
        walletId: oldOperation.walletId,
      };

      validateWalletOperation(newOperation, oldOperation);

      // يجب أن تكون عملة العملية القديمة والجديدة مضافة إلى المحفظة.
      // تغيير العملة في عملية قديمة لا ينشئ سجل عملة جديدًا تلقائيًا.
      await assertWalletCurrenciesExist(tx, id, [
        oldOperation.currency,
        newOperation.currency,
      ]);

      // نتحقق من الصناديق القديمة والجديدة، ونطلب النشاط فقط
      // من أي صندوق سيبدأ بالتأثر في العملية المعدلة لأول مرة.
      await assertCashboxesForUpdate(tx, oldOperation, newOperation);

      const { walletDeltas, cashboxDeltas } = calculateOperationDeltas({
        oldOperation,
        newOperation,
      });

      // كل فروق الأرصدة تطبق قبل حفظ السجل، لكن داخل المعاملة نفسها.
      // إذا لم يكف رصيد المحفظة فسيُجهض كل شيء بما فيه تحديث الصندوق والسجل.
      await applyWalletBalanceDeltas(tx, id, walletDeltas);
      await applyCashboxBalanceDeltas(tx, cashboxDeltas);

      await electronicWalletOperationRepository.updateWalletOperation(
        tx,
        newOperation
      );

      return newOperation;
    }
  );

  markBackupDirty("updated-electronic-wallet-operation");

  return updatedOperation;
}

// ============================================================
// حذف عملية مع عكس أثرها المالي
// ============================================================

export async function deleteWalletOperationService(walletId, operationId) {
  assertValidWalletId(walletId);

  const id = normalizeId(walletId);
  const operationID = assertValidOperationId(operationId);

  const deletedOperation = await runInTransaction(
    [
      WALLETS_STORE,
      WALLET_BALANCES_STORE,
      WALLET_OPERATIONS_STORE,
      CASHBOXES_STORE,
    ],
    "readwrite",
    async (tx) => {
      await getRequiredWallet(tx, id);

      const oldOperation =
        await electronicWalletOperationRepository.getWalletOperationById(
          tx,
          operationID
        );

      if (!oldOperation || oldOperation.walletId !== id) {
        throw new Error("العملية غير موجودة ضمن هذه المحفظة.");
      }

      await assertWalletCurrenciesExist(tx, id, [oldOperation.currency]);
      await assertCashboxesForDeletion(tx, oldOperation);

      const { walletDeltas, cashboxDeltas } = calculateOperationDeltas({
        oldOperation,
      });

      // عكس العملية قد يجعل رصيد المحفظة سالبًا،
      // مثل حذف رصيد افتتاحي سبق أن استُخدم في عمليات لاحقة.
      // في هذه الحالة نمنع الحذف حفاظًا على سلامة الأرصدة.
      await applyWalletBalanceDeltas(tx, id, walletDeltas);
      await applyCashboxBalanceDeltas(tx, cashboxDeltas);

      await electronicWalletOperationRepository.deleteWalletOperation(
        tx,
        operationID
      );

      return oldOperation;
    }
  );

  markBackupDirty("deleted-electronic-wallet-operation");

  return deletedOperation;
}

// ============================================================
// الواجهة العامة للخدمة
// ============================================================

const electronicWalletService = {
  // القراءة
  getWalletsOverviewService,
  getWalletByIdService,
  getWalletDetailsService,
  getWalletsByProviderService,
  queryWalletOperationsService,

  // بيانات المحفظة
  addWalletService,
  updateWalletService,
  setWalletActiveService,
  addWalletCurrencyService,

  // العمليات المالية
  createWithdrawalService,
  createDepositService,
  createExternalInService,
  createExternalOutService,
  createWalletAdjustmentService,
  updateWalletOperationService,
  deleteWalletOperationService,
};

export default electronicWalletService;
