import cashboxRepository from "../repositories/cashboxrepository.js";
import { runInTransaction } from "../db/transaction.js";
import transferRepository from "../repositories/transferRepository.js";
import { isSupportedCurrency } from "../shared/currencydata/currencies.js";
import {
  buildTimestampDateRange,
  getTimestampFromDateTimeLocal,
} from "../shared/utilsDate.js";

// ======================
// الثوابت
// =======================
const TRANSFER_STORE_NAME = "transfers";
const CASHBOX_STORE_NAME = "cashboxes";

const TRANSFER_DIRECTIONS = {
  OUTGOING: "صادر",
  INCOMING: "وارد",
};

// =========================
//   Normalize
// =========================
function normalizeTransfer(data) {
  const direction =
    typeof data.direction === "string" ? data.direction.trim() : "";

  const rawCurrency =
    typeof data.currency === "string" ? data.currency.toUpperCase().trim() : "";

  const date =
    typeof data.date === "string" && data.date.trim()
      ? getTimestampFromDateTimeLocal(data.date)
      : typeof data.date === "number"
      ? data.date
      : NaN;

  const amount =
    data.amount === "" || data.amount === null || data.amount === undefined
      ? NaN
      : Number(data.amount);

  const enteredWages =
    data.wages === "" || data.wages === null || data.wages === undefined
      ? 0
      : Number(data.wages);

  const isOutgoing = direction === TRANSFER_DIRECTIONS.OUTGOING;

  return {
    fullName: typeof data.fullname === "string" ? data.fullname.trim() : "",

    destination:
      typeof data.destination === "string" ? data.destination.trim() : "",

    currency: rawCurrency,

    amount,

    // الوارد لا يحتوي على أجور
    wages: isOutgoing ? enteredWages : 0,

    // حالة الأجور لا تنطبق على الوارد
    wagesIncluded: isOutgoing && data.wagesIncluded === true,

    direction,

    date,

    updatedAt: Date.now(),

    note: typeof data.note === "string" ? data.note.trim() : "",
  };
}

// ==================================
//    Validate
// ==================================
function validateTransfer(transfer) {
  if (!transfer.fullName) {
    throw new Error("يرجى إدخال الاسم الثلاثي");
  }

  if (!transfer.destination) {
    throw new Error("يرجى تحديد وجهة الحوالة");
  }

  if (!isSupportedCurrency(transfer.currency)) {
    throw new Error("عملة الحوالة غير مدعومة.");
  }

  if (!Number.isFinite(transfer.amount) || transfer.amount <= 0) {
    throw new Error("يجب أن يكون مبلغ الحوالة أكبر من صفر");
  }

  if (
    transfer.direction !== TRANSFER_DIRECTIONS.OUTGOING &&
    transfer.direction !== TRANSFER_DIRECTIONS.INCOMING
  ) {
    throw new Error("اتجاه الحوالة غير صالح");
  }

  if (!Number.isFinite(transfer.wages) || transfer.wages < 0) {
    throw new Error("أجور الحوالة يجب أن تكون صفرًا أو أكثر");
  }

  if (
    transfer.direction === TRANSFER_DIRECTIONS.OUTGOING &&
    transfer.wagesIncluded &&
    transfer.wages >= transfer.amount
  ) {
    throw new Error("الأجور المتضمنة يجب أن تكون أقل من مبلغ الحوالة");
  }

  if (
    typeof transfer.date !== "number" ||
    !Number.isFinite(transfer.date) ||
    transfer.date <= 0
  ) {
    throw new Error("تاريخ الحوالة غير صالح");
  }
}

// ==========================================
//  دالة حساب تأثير الحوالة على الصندوق
// ==========================================
function calculateTransferCashboxChange(transfer) {
  if (transfer.direction === TRANSFER_DIRECTIONS.INCOMING) {
    return -transfer.amount;
  }

  if (transfer.wagesIncluded) {
    return transfer.amount;
  }

  return transfer.amount + transfer.wages;
}

// ==========================================
//   دالات التحقق من وجود ونشاط الصناديق
// ==========================================

// عند الإضافة: يجب أن يكون الصندوق موجودًا ونشطًا
async function ensureCashboxForAdd(currency, tx) {
  const cashbox = await cashboxRepository.getCashboxByCurrency(tx, currency);

  if (!cashbox) {
    throw new Error(`لا يوجد صندوق للعملة ${currency}.`);
  }

  if (!cashbox.active) {
    throw new Error(`صندوق العملة ${currency} غير نشط.`);
  }

  return cashbox;
}

// عند التعديل: نحتاج إلى الصندوق القديم لعكس أثره
// وإذا تغيرت العملة، يجب أن يكون الصندوق الجديد موجودًا ونشطًا
async function ensureCashboxesForUpdate(oldTransfer, newTransfer, tx) {
  const oldCashbox = await cashboxRepository.getCashboxByCurrency(
    tx,
    oldTransfer.currency
  );

  if (!oldCashbox) {
    throw new Error(`صندوق العملة القديمة ${oldTransfer.currency} غير موجود.`);
  }

  if (oldTransfer.currency !== newTransfer.currency) {
    const newCashbox = await cashboxRepository.getCashboxByCurrency(
      tx,
      newTransfer.currency
    );

    if (!newCashbox) {
      throw new Error(`لا يوجد صندوق للعملة ${newTransfer.currency}.`);
    }

    if (!newCashbox.active) {
      throw new Error(`صندوق العملة الجديدة ${newTransfer.currency} غير نشط.`);
    }
  }
}

// عند الحذف: نتحقق من وجود الصندوق فقط
async function ensureCashboxForDelete(transfer, tx) {
  const cashbox = await cashboxRepository.getCashboxByCurrency(
    tx,
    transfer.currency
  );

  if (!cashbox) {
    throw new Error(`صندوق العملة ${transfer.currency} غير موجود.`);
  }

  return cashbox;
}

// ==============================
//   دالة الاستعلام
// ==============================
export async function queryTransferService(filters = {}) {
  const rawDirection =
    typeof filters.direction === "string" ? filters.direction.trim() : "";

  // نجهز حدود التاريخ من مدخلات الواجهة، إن وجدت
  const hasDateInputs =
    (typeof filters.dateFrom === "string" && filters.dateFrom.trim() !== "") ||
    (typeof filters.dateTo === "string" && filters.dateTo.trim() !== "");

  const dateRange = hasDateInputs
    ? buildTimestampDateRange({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      })
    : {};

  const dateFromTimestamp = dateRange.dateFromTimestamp;

  const dateToExclusiveTimestamp = dateRange.dateToExclusiveTimestamp;

  // تطبيع المرشحات والتحقق منها داخل دالة الاستعلام
  const normalizedFilters = {
    dateFromTimestamp,
    dateToExclusiveTimestamp,

    direction: rawDirection,

    fullName: filters.fullName.toString().trim().toLocaleLowerCase(),

    note:
      typeof filters.note === "string"
        ? filters.note.trim().toLocaleLowerCase()
        : "",

    destination:
      typeof filters.destination === "string"
        ? filters.destination.trim().toLocaleLowerCase()
        : "",
  };

  //خطوات التحقق من الفلاتر
  if (
    normalizedFilters.direction &&
    normalizedFilters.direction !== TRANSFER_DIRECTIONS.OUTGOING &&
    normalizedFilters.direction !== TRANSFER_DIRECTIONS.INCOMING
  ) {
    throw new Error("فلتر اتجاه الحوالة غير صالح");
  }

  if (dateFromTimestamp != null && !Number.isFinite(dateFromTimestamp)) {
    throw new Error("تاريخ بداية الفلترة غير صالح");
  }

  if (
    dateToExclusiveTimestamp != null &&
    !Number.isFinite(dateToExclusiveTimestamp)
  ) {
    throw new Error("تاريخ نهاية الفلترة غير صالح");
  }

  if (
    dateFromTimestamp != null &&
    dateToExclusiveTimestamp != null &&
    dateFromTimestamp >= dateToExclusiveTimestamp
  ) {
    throw new Error("نطاق التاريخ غير صالح");
  }

  const transfers = await runInTransaction(
    [TRANSFER_STORE_NAME],
    "readonly",
    (tx) => transferRepository.queryTransfers(normalizedFilters, tx)
  );

  // الترتيب من الاحدث للاقدم
  return transfers.sort((a, b) => b.date - a.date);
}

// =================================
//   دالة جلب حوالة واحدة
// =================================
export async function getTransferByIdService(id) {
  const transferId = typeof id === "string" ? Number(id) : id;

  if (!Number.isFinite(transferId)) {
    throw new Error("معرّف الحوالة غير صالح.");
  }

  return runInTransaction([TRANSFER_STORE_NAME], "readonly", async (tx) => {
    const transfer = await transferRepository.getTransferById(transferId, tx);

    return transfer;
  });
}

// ==========================================
//  دالة إضافة عملية تحويل جديدة
// ==========================================
export async function addTransferService(data) {
  const transfer = normalizeTransfer(data);

  validateTransfer(transfer);

  return runInTransaction(
    [TRANSFER_STORE_NAME, CASHBOX_STORE_NAME],
    "readwrite",
    async (tx) => {
      await ensureCashboxForAdd(transfer.currency, tx);

      const cashboxChange = calculateTransferCashboxChange(transfer);

      // تطبيق الاثر على الصندوق
      await cashboxRepository.adjustCashboxBalance(
        tx,
        transfer.currency,
        cashboxChange
      );

      const id = await transferRepository.addTransfer(transfer, tx);

      return {
        ...transfer,
        id,
      };
    }
  );
}

// ====================================
//   دالة تعديل عملية تحويل
// ====================================
export async function updateTransferService(id, data) {
  const normalizedTransfer = normalizeTransfer(data);

  validateTransfer(normalizedTransfer);

  return runInTransaction(
    [TRANSFER_STORE_NAME, CASHBOX_STORE_NAME],
    "readwrite",
    async (tx) => {
      const oldTransfer = await transferRepository.getTransferById(id, tx);

      if (!oldTransfer) {
        throw new Error("الحوالة المطلوب تعديلها غير موجودة");
      }

      await ensureCashboxesForUpdate(oldTransfer, normalizedTransfer, tx);

      // عكس أثر الحوالة القديمة
      const oldCashboxChange = calculateTransferCashboxChange(oldTransfer);

      await cashboxRepository.adjustCashboxBalance(
        tx,
        oldTransfer.currency,
        -oldCashboxChange
      );

      // تطبيق أثر الحوالة الجديدة
      const newCashboxChange =
        calculateTransferCashboxChange(normalizedTransfer);

      await cashboxRepository.adjustCashboxBalance(
        tx,
        normalizedTransfer.currency,
        newCashboxChange
      );

      const updatedTransfer = {
        ...normalizedTransfer,
        id: oldTransfer.id,
        updatedAt: Date.now(),
      };

      await transferRepository.updateTransfer(updatedTransfer, tx);

      return updatedTransfer;
    }
  );
}

// ===================================
//    حذف عملية تحويل
// ===================================
export async function deleteTransferService(id) {
  return runInTransaction(
    [TRANSFER_STORE_NAME, CASHBOX_STORE_NAME],
    "readwrite",
    async (tx) => {
      const transfer = await transferRepository.getTransferById(id, tx);

      if (!transfer) {
        throw new Error("الحوالة المطلوب حذفها غير موجودة");
      }

      await ensureCashboxForDelete(transfer, tx);

      // عكس الأثر السابق قبل حذف سجل الحوالة
      const cashboxChange = calculateTransferCashboxChange(transfer);

      // تطبيق عكس الاثر على الصندوق
      await cashboxRepository.adjustCashboxBalance(
        tx,
        transfer.currency,
        -cashboxChange
      );

      await transferRepository.deleteTransfer(transfer.id, tx);

      return transfer;
    }
  );
}

const transferService = {
  queryTransferService,
  getTransferByIdService,
  addTransferService,
  updateTransferService,
  deleteTransferService,
};
export default transferService;
