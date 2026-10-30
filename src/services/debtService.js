import { getPartyById } from "../repositories/partyRepository.js";
import { runInTransaction } from "../db/transaction.js";
import debtRepository from "../repositories/debtRepository.js";
import cashboxRepository from "../repositories/cashboxrepository.js";


const PARTIES_STORE = "parties";
const DEBTS_STORE = "debts";
const CASHBOXES_STORE = "cashboxes";

// تحويل id القادم من React Router إلى نوعه الصحيح
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

// التحقق من وجود قيمة Timestamp صالحة
function hasTimestamp(value) {
  return typeof value === "number" && Number.isFinite(value);
}

// تجهيز بيانات حركة الدين
function normalizeDebtData(data, currentDebt = null) {
  return {
    partyId: currentDebt ? currentDebt.partyId : normalizeId(data.partyId),

    amount: Number(data.amount ?? currentDebt?.amount),

    currency:
      typeof (data.currency ?? currentDebt?.currency) === "string"
        ? (data.currency ?? currentDebt.currency).trim().toUpperCase()
        : data.currency ?? currentDebt?.currency,

    direction: data.direction ?? currentDebt?.direction,

    note:
      typeof (data.note ?? currentDebt?.note ?? "") === "string"
        ? (data.note ?? currentDebt?.note ?? "").trim()
        : data.note ?? currentDebt?.note,

    date: data.date ?? currentDebt?.date ?? Date.now(),

    updatedAt: Date.now(),
  };
}

// التحقق من بيانات حركة الدين
function validateDebtData(debt) {
  if (
    debt.partyId === undefined ||
    debt.partyId === null ||
    debt.partyId === ""
  ) {
    throw new Error("يجب تحديد صاحب حركة الدين");
  }

  if (!Number.isFinite(debt.amount) || debt.amount <= 0) {
    throw new Error("مبلغ الدين يجب أن يكون أكبر من صفر");
  }

  if (typeof debt.currency !== "string" || !debt.currency) {
    throw new Error("يجب تحديد العملة");
  }

  if (!["لنا", "له"].includes(debt.direction)) {
    throw new Error("اتجاه الدين غير صحيح");
  }

  if (!hasTimestamp(debt.date)) {
    throw new Error("تاريخ حركة الدين غير صحيح");
  }

  if (typeof debt.note !== "string") {
    throw new Error("الملاحظة غير صحيحة");
  }
}

// حساب أثر حركة الدين على الصندوق
function calculateDebtCashboxChange(debt) {
  if (debt.direction === "لنا") {
    return -debt.amount;
  }

  if (debt.direction === "له") {
    return debt.amount;
  }

  throw new Error("اتجاه الدين غير صحيح");
}

// جلب صندوق العملة والتحقق من وجوده ونشاطه عند الحاجة
async function getDebtCashbox(tx, currency, requireActive = false) {
  const cashbox = await cashboxRepository.getCashboxByCurrency(tx, currency);

  if (!cashbox) {
    throw new Error(`لا يوجد صندوق للعملة ${currency}`);
  }

  if (requireActive && !cashbox.active) {
    throw new Error(`صندوق العملة ${currency} غير نشط`);
  }

  return cashbox;
}

// تطبيق التغيير على رصيد الصندوق
async function applyCashboxChange(tx, currency, change) {
  if (change === 0) {
    return;
  }

  await cashboxRepository.adjustCashboxBalance(tx, currency, change);
}

// حساب الرصيد النهائي لكل عملة
function calculateDebtBalances(debts) {
  const balances = new Map();

  for (const debt of debts) {
    const currentBalance = balances.get(debt.currency) ?? 0;

    if (debt.direction === "لنا") {
      balances.set(debt.currency, currentBalance + debt.amount);
    } else if (debt.direction === "له") {
      balances.set(debt.currency, currentBalance - debt.amount);
    }
  }

  return Array.from(balances, ([currency, netAmount]) => ({
    currency,
    amount: Math.abs(netAmount),
    direction: netAmount > 0 ? "لنا" : netAmount < 0 ? "له" : "الحساب صفر",
  }));
}

// ترتيب حركات الدين من الأحدث إلى الأقدم
function sortDebtsByDateDesc(debts) {
  return [...debts].sort((a, b) => b.date - a.date);
}

// جلب حساب شخص: بياناته وحركاته وأرصدة عملاته
export function getPartyDebtAccountService(partyId) {
  return runInTransaction(
    [PARTIES_STORE, DEBTS_STORE],
    "readonly",
    async (tx) => {
      const id = normalizeId(partyId);

      const party = await getPartyById(id, tx);

      if (!party) {
        throw new Error("الجهة غير موجودة");
      }

      const debts = await debtRepository.getAllDebts(id, tx);

      return {
        party,
        debts: sortDebtsByDateDesc(debts),
        balances: calculateDebtBalances(debts),
      };
    }
  );
}

// الاستعلام عن حركات الدين باستخدام الفلاتر
export function queryDebtsService(filters = {}) {
  const normalizedFilters = { ...filters };

  if (
    normalizedFilters.partyId !== undefined &&
    normalizedFilters.partyId !== null &&
    normalizedFilters.partyId !== ""
  ) {
    normalizedFilters.partyId = normalizeId(normalizedFilters.partyId);
  }

  return runInTransaction([DEBTS_STORE], "readonly", async (tx) => {
    const debts = await debtRepository.queryDebts(normalizedFilters, tx);

    return sortDebtsByDateDesc(debts);
  });
}

// إضافة حركة دين
export function addDebtService(formData) {
  return runInTransaction(
    [PARTIES_STORE, DEBTS_STORE, CASHBOXES_STORE],
    "readwrite",
    async (tx) => {
      const debt = normalizeDebtData(formData);

      validateDebtData(debt);

      // التحقق من وجود صاحب الحركة
      const party = await getPartyById(debt.partyId, tx);

      if (!party) {
        throw new Error("الجهة المرتبطة بحركة الدين غير موجودة");
      }

      // التحقق من وجود صندوق نشط للعملة
      await getDebtCashbox(tx, debt.currency, true);

      // إضافة حركة الدين
      const id = await debtRepository.addDebt(debt, tx);

      // تحديث رصيد الصندوق
      const cashboxChange = calculateDebtCashboxChange(debt);

      await applyCashboxChange(tx, debt.currency, cashboxChange);

      return {
        id,
        ...debt,
      };
    }
  );
}

// تعديل حركة دين
export function updateDebtService(id, formData) {
  return runInTransaction(
    [PARTIES_STORE, DEBTS_STORE, CASHBOXES_STORE],
    "readwrite",
    async (tx) => {
      const debtId = normalizeId(id);

      // جلب الحركة القديمة
      const currentDebt = await debtRepository.getDebtById(debtId, tx);

      if (!currentDebt) {
        throw new Error("حركة الدين غير موجودة");
      }

      // التأكد من وجود صاحب الحركة
      const party = await getPartyById(currentDebt.partyId, tx);

      if (!party) {
        throw new Error("الجهة المرتبطة بحركة الدين غير موجودة");
      }

      // تجهيز الحركة الجديدة مع الحفاظ على partyId الأصلي
      const updatedDebt = {
        id: currentDebt.id,
        ...normalizeDebtData(formData, currentDebt),
      };

      validateDebtData(updatedDebt);

      // حساب أثر الحركة القديمة والجديدة على الصندوق
      const oldCashboxChange = calculateDebtCashboxChange(currentDebt);

      const newCashboxChange = calculateDebtCashboxChange(updatedDebt);

      if (currentDebt.currency === updatedDebt.currency) {
        // نفس العملة: نعكس الفرق فقط
        await getDebtCashbox(tx, currentDebt.currency);

        await applyCashboxChange(
          tx,
          currentDebt.currency,
          newCashboxChange - oldCashboxChange
        );
      } else {
        // عملة مختلفة: نعكس الحركة القديمة أولًا
        // ثم نطبق أثر الحركة الجديدة

        await getDebtCashbox(tx, currentDebt.currency);

        await getDebtCashbox(tx, updatedDebt.currency, true);

        await applyCashboxChange(tx, currentDebt.currency, -oldCashboxChange);

        await applyCashboxChange(tx, updatedDebt.currency, newCashboxChange);
      }

      // حفظ الحركة المعدلة
      await debtRepository.updateDebt(updatedDebt, tx);

      return updatedDebt;
    }
  );
}

// حذف حركة دين
export function deleteDebtService(id) {
  return runInTransaction(
    [DEBTS_STORE, CASHBOXES_STORE],
    "readwrite",
    async (tx) => {
      const debtId = normalizeId(id);

      // جلب الحركة القديمة
      const currentDebt = await debtRepository.getDebtById(debtId, tx);

      if (!currentDebt) {
        throw new Error("حركة الدين غير موجودة");
      }

      // التأكد من وجود الصندوق الأصلي
      await getDebtCashbox(tx, currentDebt.currency);

      // عكس أثر الحركة القديمة
      const oldCashboxChange = calculateDebtCashboxChange(currentDebt);

      await applyCashboxChange(tx, currentDebt.currency, -oldCashboxChange);

      // حذف الحركة
      await debtRepository.deleteDebt(debtId, tx);

      return currentDebt;
    }
  );
}

const debtService = {
    getPartyDebtAccountService,
    queryDebtsService,
    addDebtService,
    updateDebtService,
    deleteDebtService
}
export default debtService