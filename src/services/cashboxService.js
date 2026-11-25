import { runInTransaction } from "../db/transaction";
import cashboxRepository from "../repositories/cashboxrepository";
import { markBackupDirty } from "./backupSchedulerService";

/* =======================================
   دوال تصفية والتحقق من مدخلات الواجهة
   ======================================= */

//============ Normalization ============= //
function normalizedCashboxForm(dataForm) {
  if (!dataForm || typeof dataForm !== "object") {
    throw new TypeError("Invalid box data.");
  }

  const fullData = {
    currency: dataForm.currency?.trim().toUpperCase(),
    currencyNameAr: dataForm.currencyNameAr?.trim().toUpperCase(),
    balance: Number(dataForm.balance),
    opiningBalance: Number(dataForm.balance),
    date: Date.now(),
    updatedAt: Date.now(),
    active: true,
  };

  return fullData;
}

// ========== validation ========== //
function validatCashboxForm(normalizedData) {
  const { currency, balance, opiningBalance } = normalizedData;

  if (!currency || typeof currency !== "string") {
    throw new Error("The currency is invalid");
  }

  if (
    !opiningBalance ||
    typeof opiningBalance !== "number" ||
    !Number.isFinite(opiningBalance)
  ) {
    throw new Error("The entered balance is invalid.");
  }

  if (!balance || typeof balance !== "number" || !Number.isFinite(balance)) {
    throw new Error("The entered balance is invalid.");
  }

  return normalizedData;
}

/* ======================================
    دوال العمليات الاساسية على الصناديق
   ====================================== */

// ========== دالة قراءة الصناديق =========== //
async function getAllCashboxesService() {
  return runInTransaction(["cashboxes"], "readonly", (tx) =>
    cashboxRepository.getAllCashboxes(tx)
  );
}

// ========== دالة قراءة صندوق حسب العملة ========== //
async function getCashboxByCurrencyService(currency) {
  return runInTransaction(["cashboxes"], "readonly", (tx) =>
    cashboxRepository.getCashboxByCurrency(tx, currency)
  );
}

// ========= دالة إضافة صندوق ======== //
async function addCashboxService(newCashbox) {
  // نتحقق من المدخلات قبل فتح Transaction، لأنها لا تحتاج إلى قاعدة البيانات.
  const normalizedCashbox = normalizedCashboxForm(newCashbox);
  validatCashboxForm(normalizedCashbox);

  await runInTransaction(["cashboxes"], "readwrite", async (tx) => {
    await cashboxRepository.addCashbox(tx, normalizedCashbox);
  });

  markBackupDirty("created-cashbox");

  return normalizedCashbox;
}

// ============ دالة تعطيل / تفعيل صندوق ========== //
async function setCashboxActiveService(currency, active) {
  if (typeof active !== "boolean") {
    throw new Error("قيمة التفعيل غير صالحة");
  }

  await runInTransaction(["cashboxes"], "readwrite", (tx) =>
    cashboxRepository.setCashboxActive(tx, currency, active)
  );

  markBackupDirty("Disable-cashbox");
}

const cashboxService = {
  getAllCashboxesService,
  getCashboxByCurrencyService,
  addCashboxService,
  setCashboxActiveService,
};

export default cashboxService;
