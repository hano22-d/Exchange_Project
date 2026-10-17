import openDatabase from "../db/database";
import { waitForTransactionCompletion } from "../db/transaction";
import cashboxRepository from "../repositories/cashboxrepository";

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
    balance: Number(dataForm.balance),
    opiningBalance: Number(dataForm.balance),
    date: Date.now(),
    updatedAt: Date.now(),
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

/* =======================================
    دوال العمليات الاساسية على الصناديق
    ====================================== */

// ========== دالة قراءة الصناديق =========== //
async function getAllCashboxesService() {
  const db = await openDatabase();
  const transaction = db.transaction(["cashboxes"], "readonly");

  return await cashboxRepository.getAllCashboxes(transaction);
}

// ========== دالة قراءة صندوق حسب العملة ========== //
async function getCashboxByCurrencyService(currency) {
  const db = await openDatabase();
  const transaction = db.transaction(["cashboxes"], "readonly");

  return await cashboxRepository.getCashboxByCurrency(transaction, currency);
}

// ========= دالة إضافة صندوق ======== //
async function addCashboxService(newCashbox) {
  const db = await openDatabase();
  const transaction = db.transaction(["cashboxes"], "readwrite");

  const normalizedCashbox = normalizedCashboxForm(newCashbox);
  validatCashboxForm(normalizedCashbox);

  await cashboxRepository.addCashbox(transaction, normalizedCashbox);

  await waitForTransactionCompletion(transaction);

  return normalizedCashbox
}

// ============ دالة تعطيل / تفعيل صندوق ========== //
async function setCashboxActiveService(currency, active) {
  const db = await openDatabase();
  const transaction = db.transaction(["cashboxes"], "readwrite");

  if (typeof active !== "boolean") {
  throw new Error("قيمة التفعيل غير صالحة");
}

  await cashboxRepository.setCashboxActive(transaction, currency, active);

  await waitForTransactionCompletion(transaction);
}

const cashboxService = {
  getAllCashboxesService,
  getCashboxByCurrencyService,
  addCashboxService,
  setCashboxActiveService,
};
export default cashboxService;
