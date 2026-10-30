import { requestToPromise } from "../shared/utilsDB";

const DEBTS_STORE = "debts";

// التحقق من وجود قيمة Timestamp صالحة
function hasTimestamp(value) {
  return typeof value === "number" && Number.isFinite(value);
}

// التحقق من وجود فلتر فعلي
function hasFilterValue(value) {
  return (
    value !== undefined && value !== null && value !== "" && value !== "all"
  );
}

// جلب جميع حركات الدين الخاصة بجهة معينة
export function getAllDebts(partyId, tx) {
  const store = tx.objectStore(DEBTS_STORE);

  return requestToPromise(store.index("partyIdIndex").getAll(partyId));
}

// جلب حركة دين باستخدام id
export function getDebtById(id, tx) {
  const store = tx.objectStore(DEBTS_STORE);

  return requestToPromise(store.get(id));
}

// إضافة حركة دين
export function addDebt(debt, tx) {
  const store = tx.objectStore(DEBTS_STORE);

  return requestToPromise(store.add(debt));
}

// تعديل حركة دين
export function updateDebt(debt, tx) {
  const store = tx.objectStore(DEBTS_STORE);

  return requestToPromise(store.put(debt));
}

// حذف حركة دين
export function deleteDebt(id, tx) {
  const store = tx.objectStore(DEBTS_STORE);

  return requestToPromise(store.delete(id));
}

// جلب حركات الدين ضمن نطاق تاريخي
export async function getDebtsByDateRange(
  tx,
  dateFromTimestamp,
  dateToExclusiveTimestamp
) {
  const store = tx.objectStore(DEBTS_STORE);
  const index = store.index("dateIndex");

  const hasDateFrom = hasTimestamp(dateFromTimestamp);
  const hasDateTo = hasTimestamp(dateToExclusiveTimestamp);

  let dateRange;

  if (hasDateFrom && hasDateTo) {
    dateRange = IDBKeyRange.bound(
      dateFromTimestamp,
      dateToExclusiveTimestamp,
      false,
      true
    );
  } else if (hasDateFrom) {
    dateRange = IDBKeyRange.lowerBound(dateFromTimestamp);
  } else if (hasDateTo) {
    dateRange = IDBKeyRange.upperBound(dateToExclusiveTimestamp, true);
  } else {
    return requestToPromise(store.getAll());
  }

  return requestToPromise(index.getAll(dateRange));
}

// جلب حركات الدين حسب العملة
async function getDebtsByCurrency(tx, currency) {
  const store = tx.objectStore(DEBTS_STORE);
  const index = store.index("currencyIndex");

  return requestToPromise(index.getAll(currency));
}

// جلب حركات الدين حسب الاتجاه
async function getDebtsByDirection(tx, direction) {
  const store = tx.objectStore(DEBTS_STORE);
  const index = store.index("directionIndex");

  return requestToPromise(index.getAll(direction));
}

// اختيار الفلتر الأساسي الذي سيستخدمه IndexedDB
export function choosePrimaryQuery(filters = {}) {
  const {
    dateFromTimestamp,
    dateToExclusiveTimestamp,
    currency,
    direction,
    partyId,
  } = filters;

  const hasDateFrom = hasTimestamp(dateFromTimestamp);
  const hasDateTo = hasTimestamp(dateToExclusiveTimestamp);

  const hasCurrency = hasFilterValue(currency);
  const hasDirection = hasFilterValue(direction);
  const hasPartyId = hasFilterValue(partyId);

  if (hasDateFrom && hasDateTo) {
    return "dateRange";
  } else if (hasCurrency) {
    return "currency";
  } else if (hasDirection) {
    return "direction";
  } else if (hasPartyId) {
    return "partyId";
  } else if (hasDateFrom || hasDateTo) {
    return "dateRange";
  } else {
    return "all";
  }
}

// تطبيق بقية الفلاتر على النتائج
export function applyRemainingDebtFilters(
  debts,
  filters = {},
  primaryQuery = "all"
) {
  const {
    partyId,
    currency,
    direction,
    dateFromTimestamp,
    dateToExclusiveTimestamp,
    note,
  } = filters;

  const noteQuery =
    typeof note === "string" ? note.trim().toLocaleLowerCase() : "";

  const hasDateFrom = hasTimestamp(dateFromTimestamp);
  const hasDateTo = hasTimestamp(dateToExclusiveTimestamp);

  return debts.filter((debt) => {
    // فلتر الجهة
    if (
      primaryQuery !== "partyId" &&
      hasFilterValue(partyId) &&
      debt.partyId !== partyId
    ) {
      return false;
    }

    // فلتر التاريخ إذا لم يكن هو الفلتر الأساسي
    if (primaryQuery !== "dateRange") {
      if (hasDateFrom && debt.date < dateFromTimestamp) {
        return false;
      }

      if (hasDateTo && debt.date >= dateToExclusiveTimestamp) {
        return false;
      }
    }

    // فلتر العملة إذا لم يكن هو الفلتر الأساسي
    if (
      primaryQuery !== "currency" &&
      hasFilterValue(currency) &&
      debt.currency !== currency
    ) {
      return false;
    }

    // فلتر الاتجاه إذا لم يكن هو الفلتر الأساسي
    if (
      primaryQuery !== "direction" &&
      hasFilterValue(direction) &&
      debt.direction !== direction
    ) {
      return false;
    }

    // البحث ضمن الملاحظة
    if (
      noteQuery &&
      !(
        typeof debt.note === "string" &&
        debt.note.toLocaleLowerCase().includes(noteQuery)
      )
    ) {
      return false;
    }

    return true;
  });
}

// الاستعلام العام
export async function queryDebts(filters = {}, tx) {
  const primaryQuery = choosePrimaryQuery(filters);

  let debts;

  switch (primaryQuery) {
    case "dateRange":
      debts = await getDebtsByDateRange(
        tx,
        filters.dateFromTimestamp,
        filters.dateToExclusiveTimestamp
      );
      break;

    case "currency":
      debts = await getDebtsByCurrency(tx, filters.currency);
      break;

    case "direction":
      debts = await getDebtsByDirection(tx, filters.direction);
      break;

    case "partyId":
      debts = await getAllDebts(filters.partyId, tx);
      break;

    default:
      debts = await requestToPromise(tx.objectStore(DEBTS_STORE).getAll());
  }

  return applyRemainingDebtFilters(debts, filters, primaryQuery);
}

const debtRepository = {
    getAllDebts,
    getDebtById,
    addDebt,
    updateDebt,
    deleteDebt,
    queryDebts
}
export default debtRepository