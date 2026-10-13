import { requestToPromise } from "../shared/utilsDB";

const CASHBOX_Object_STORE = "cashboxes";

/* ========================= 
    دالة جلب جميع الصناديق
   ========================= */
function getAllCshboxes(transaction) {
  const store = transaction.objectStore(CASHBOX_Object_STORE);

  const request = store.getAll();
  return requestToPromise(request);
}

/* =============================
    دالة جلب صندوق حسب العملة
    ============================ */
function getCashboxByCurrency(transaction, currency) {
  const store = transaction.objectStore(CASHBOX_Object_STORE);
  const request = store.get(currency);

  return requestToPromise(request);
}

/* ====================
     دالة إضافة صندوق
    =================== */
function addCashbox(transaction, newCashbox) {
  const store = transaction.objectStore(CASHBOX_Object_STORE);
  const request = store.add(newCashbox);

  return requestToPromise(request);
}

/* ===================================
     دالة تحديث صندوق بعد عملية ذرية
   ================================== */
async function adjustCashboxBalance(transaction, currency, delta) {
  const store = transaction.objectStore(CASHBOX_Object_STORE);
  const request = store.get(currency);

  const cashbox = await requestToPromise(request);

  if (!cashbox) {
    throw new Error(`Cashbox "${currency}" has an invalid balance.`);
  }

  const updatedCashbox = {
    ...cashbox,
    balance: cashbox.balance + delta,
  };
  const putRequest = store.put(updatedCashbox);

  await requestToPromise(putRequest);

  return updatedCashbox;
}

/* ============================-
    دالة تعطيل / تفعيل صندوق
    ============================ */
async function setCashboxActive(transaction, currency, active) {
  const store = transaction.objectStore(CASHBOX_Object_STORE);
  const request = store.get(currency);

  const cashbox = await requestToPromise(request);

  if (!cashbox) {
    throw new Error(`Cashbox "${currency}" has an invalid balance.`);
  }

  const updatedCashbox = {
    ...cashbox,
    active: active,
  };
  const putRequest = store.put(updatedCashbox);

  await requestToPromise(putRequest);

  return updatedCashbox;
}

const cashboxRepository = {
  getAllCshboxes,
  getCashboxByCurrency,
  addCashbox,
  adjustCashboxBalance,
  setCashboxActive,
};

export default cashboxRepository
