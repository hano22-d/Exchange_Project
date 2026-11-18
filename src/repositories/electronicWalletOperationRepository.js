import { requestToPromise } from "../shared/utilsDB";

const ELECTRONIC_WALLET_OPERATIONS_STORE = "electronicWalletOperations";

// ========================================
// Helpers
// ========================================

// التحقق من صحة Timestamp
function hasTimestamp(value) {
  return typeof value === "number" && Number.isFinite(value);
}

// التحقق من وجود فلتر فعلي
function hasFilterValue(value) {
  return (
    value !== undefined && value !== null && value !== "" && value !== "all"
  );
}

// ========================================
// العمليات الأساسية
// ========================================

// جلب جميع الحركات
function getAllWalletOperations(tx) {
  const store = tx.objectStore(ELECTRONIC_WALLET_OPERATIONS_STORE);

  return requestToPromise(store.getAll());
}

// جلب حركة واحدة بواسطة id
function getWalletOperationById(tx, id) {
  const store = tx.objectStore(ELECTRONIC_WALLET_OPERATIONS_STORE);

  return requestToPromise(store.get(id));
}

// جلب جميع حركات محفظة معينة
function getWalletOperationsByWalletId(tx, walletId) {
  const store = tx.objectStore(ELECTRONIC_WALLET_OPERATIONS_STORE);

  return requestToPromise(store.index("walletIdIndex").getAll(walletId));
}

// جلب حركات محفظة وعملة محددتين
function getWalletOperationsByWalletCurrency(tx, walletId, currency) {
  const store = tx.objectStore(ELECTRONIC_WALLET_OPERATIONS_STORE);

  return requestToPromise(
    store.index("walletCurrencyIndex").getAll([walletId, currency])
  );
}

// جلب الحركات حسب العملة
function getWalletOperationsByCurrency(tx, currency) {
  const store = tx.objectStore(ELECTRONIC_WALLET_OPERATIONS_STORE);

  return requestToPromise(store.index("currencyIndex").getAll(currency));
}

// جلب الحركات حسب نوع العملية
function getWalletOperationsByType(tx, operationType) {
  const store = tx.objectStore(ELECTRONIC_WALLET_OPERATIONS_STORE);

  return requestToPromise(
    store.index("operationTypeIndex").getAll(operationType)
  );
}

// إضافة حركة جديدة
function addWalletOperation(tx, operation) {
  const store = tx.objectStore(ELECTRONIC_WALLET_OPERATIONS_STORE);

  return requestToPromise(store.add(operation));
}

// تعديل حركة موجودة
async function updateWalletOperation(tx, operation) {
  const store = tx.objectStore(ELECTRONIC_WALLET_OPERATIONS_STORE);

  await requestToPromise(store.put(operation));

  return operation;
}

// حذف حركة
function deleteWalletOperation(tx, id) {
  const store = tx.objectStore(ELECTRONIC_WALLET_OPERATIONS_STORE);

  return requestToPromise(store.delete(id));
}

// ========================================
// الاستعلام حسب نطاق التاريخ
// ========================================

function getWalletOperationsByDateRange(
  tx,
  dateFromTimestamp,
  dateToExclusiveTimestamp
) {
  const store = tx.objectStore(ELECTRONIC_WALLET_OPERATIONS_STORE);

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

// ========================================
// اختيار الاستعلام الأساسي
// ========================================

function choosePrimaryWalletOperationQuery(filters = {}) {
  const {
    walletId,
    currency,
    dateFromTimestamp,
    dateToExclusiveTimestamp,
    operationType,
  } = filters;

  const hasWalletId = hasFilterValue(walletId);
  const hasCurrency = hasFilterValue(currency);

  const hasDateFrom = hasTimestamp(dateFromTimestamp);
  const hasDateTo = hasTimestamp(dateToExclusiveTimestamp);

  const hasOperationType = hasFilterValue(operationType);

  // المحفظة + العملة
  if (hasWalletId && hasCurrency) {
    return "walletCurrency";
  }

  // جميع حركات محفظة محددة
  if (hasWalletId) {
    return "walletId";
  }

  // الحركات ضمن نطاق تاريخي
  if (hasDateFrom || hasDateTo) {
    return "dateRange";
  }

  // الحركات حسب العملة
  if (hasCurrency) {
    return "currency";
  }

  // الحركات حسب النوع
  if (hasOperationType) {
    return "operationType";
  }

  return "all";
}

// ========================================
// تطبيق بقية الفلاتر
// ========================================

function applyRemainingWalletOperationFilters(
  operations,
  filters = {},
  primaryQuery = "all"
) {
  const {
    walletId,
    currency,
    operationType,
    feeMode,
    dateFromTimestamp,
    dateToExclusiveTimestamp,
    note,
  } = filters;

  const noteQuery =
    typeof note === "string" ? note.trim().toLocaleLowerCase() : "";

  const hasDateFrom = hasTimestamp(dateFromTimestamp);
  const hasDateTo = hasTimestamp(dateToExclusiveTimestamp);

  return operations.filter((operation) => {
    // فلتر المحفظة
    if (
      primaryQuery !== "walletId" &&
      primaryQuery !== "walletCurrency" &&
      hasFilterValue(walletId) &&
      operation.walletId !== walletId
    ) {
      return false;
    }

    // فلتر العملة
    if (
      primaryQuery !== "currency" &&
      primaryQuery !== "walletCurrency" &&
      hasFilterValue(currency) &&
      operation.currency !== currency
    ) {
      return false;
    }

    // فلتر نوع الحركة
    if (
      primaryQuery !== "operationType" &&
      hasFilterValue(operationType) &&
      operation.operationType !== operationType
    ) {
      return false;
    }

    // فلتر طريقة تحصيل الأجرة
    if (hasFilterValue(feeMode) && operation.feeMode !== feeMode) {
      return false;
    }

    // فلتر بداية التاريخ
    if (
      primaryQuery !== "dateRange" &&
      hasDateFrom &&
      operation.date < dateFromTimestamp
    ) {
      return false;
    }

    // فلتر نهاية التاريخ
    if (
      primaryQuery !== "dateRange" &&
      hasDateTo &&
      operation.date >= dateToExclusiveTimestamp
    ) {
      return false;
    }

    // البحث في الملاحظات
    if (
      noteQuery &&
      !(
        typeof operation.note === "string" &&
        operation.note.toLocaleLowerCase().includes(noteQuery)
      )
    ) {
      return false;
    }

    return true;
  });
}

// ========================================
// الاستعلام العام
// ========================================

async function queryWalletOperations(tx, filters = {}) {
  const primaryQuery = choosePrimaryWalletOperationQuery(filters);

  let operations;

  switch (primaryQuery) {
    case "walletCurrency":
      operations = await getWalletOperationsByWalletCurrency(
        tx,
        filters.walletId,
        filters.currency
      );
      break;

    case "walletId":
      operations = await getWalletOperationsByWalletId(tx, filters.walletId);
      break;

    case "dateRange":
      operations = await getWalletOperationsByDateRange(
        tx,
        filters.dateFromTimestamp,
        filters.dateToExclusiveTimestamp
      );
      break;

    case "currency":
      operations = await getWalletOperationsByCurrency(tx, filters.currency);
      break;

    case "operationType":
      operations = await getWalletOperationsByType(tx, filters.operationType);
      break;

    default:
      operations = await getAllWalletOperations(tx);
  }

  return applyRemainingWalletOperationFilters(
    operations,
    filters,
    primaryQuery
  );
}

// ========================================
// Repository Object
// ========================================

const electronicWalletOperationRepository = {
  getAllWalletOperations,
  getWalletOperationById,
  getWalletOperationsByWalletId,
  getWalletOperationsByWalletCurrency,
  getWalletOperationsByDateRange,
  addWalletOperation,
  updateWalletOperation,
  deleteWalletOperation,
  queryWalletOperations,
};

export default electronicWalletOperationRepository;
