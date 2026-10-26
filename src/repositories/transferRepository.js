import { requestToPromise } from "../shared/utilsDB";

const TRANSFER_STORE_NAME = "transfers";
const DATE_INDEX_NAME = "dateIndex";
const DIRECTION_INDEX_NAME = "directionIndex";

// ==========================================
//   دوال العمليات الاساسية
// ==========================================

// جلب جميع الحوالات
export function getAllTransfers(tx) {
  const store = tx.objectStore(TRANSFER_STORE_NAME);

  return requestToPromise(store.getAll());
}

// جلب حوالة واحدة
export function getTransferById(id, tx) {
  const store = tx.objectStore(TRANSFER_STORE_NAME);

  return requestToPromise(store.get(id));
}

// إضافة حوالة
export function addTransfer(transfer, tx) {
  const store = tx.objectStore(TRANSFER_STORE_NAME);

  return requestToPromise(store.add(transfer));
}

// تحديث حوالة
export function updateTransfer(transfer, tx) {
  const store = tx.objectStore(TRANSFER_STORE_NAME);

  return requestToPromise(store.put(transfer));
}

// حذف حوالة
export function deleteTransfer(id, tx) {
  const store = tx.objectStore(TRANSFER_STORE_NAME);

  return requestToPromise(store.delete(id));
}

// ==========================================
//    دوال الاستعلام الفرعية
// ==========================================

// الاستعلام حسب الاتجاه: صادر أو وارد
export function getTransfersByDirection(direction, tx) {
  const store = tx.objectStore(TRANSFER_STORE_NAME);

  const index = store.index(DIRECTION_INDEX_NAME);

  return requestToPromise(index.getAll(direction));
}

// الاستعلام حسب نطاق التاريخ
export function getTransfersByDateRange(
  { dateFromTimestamp, dateToExclusiveTimestamp },
  tx
) {
  const store = tx.objectStore(TRANSFER_STORE_NAME);

  const index = store.index(DATE_INDEX_NAME);

  let range;

  if (dateFromTimestamp != null && dateToExclusiveTimestamp != null) {
    range = IDBKeyRange.bound(
      dateFromTimestamp,
      dateToExclusiveTimestamp,
      false,
      true
    );
  } else if (dateFromTimestamp != null) {
    range = IDBKeyRange.lowerBound(dateFromTimestamp);
  } else {
    range = IDBKeyRange.upperBound(dateToExclusiveTimestamp, true);
  }

  return requestToPromise(index.getAll(range));
}

// ==========================================
//    دوال إدارة الاستعلام
// ==========================================

// تحديد الاستعلام الأساسي حسب الأولوية:
export function choosePrimaryQuery(filters = {}) {
  const hasDateRange =
    filters.dateFromTimestamp != null ||
    filters.dateToExclusiveTimestamp != null;

  if (hasDateRange) {
    return "dateRange";
  }

  if (filters.direction) {
    return "direction";
  }

  return "all";
}

// تطبيق الفلاتر المتبقية التي لم تستخدم في الاستعلام الأساسي
export function applyRemainingTransferFilters(
  transfers,
  filters = {},
  primaryQuery = "all"
) {
  const {
    dateFromTimestamp,
    dateToExclusiveTimestamp,
    direction,
    fullname = "",
    note = "",
    destination = "",
    currency = "",
  } = filters;

  return transfers.filter((transfer) => {
    if (primaryQuery !== "dateRange") {
      if (dateFromTimestamp != null && transfer.date < dateFromTimestamp) {
        return false;
      }

      if (
        dateToExclusiveTimestamp != null &&
        transfer.date >= dateToExclusiveTimestamp
      ) {
        return false;
      }
    }

    if (
      primaryQuery !== "direction" &&
      direction &&
      transfer.direction !== direction
    ) {
      return false;
    }

    if (
      fullname &&
      !(transfer.fullname ?? "").toLocaleLowerCase().includes(fullname)
    ) {
      return false;
    }

    if (note && !(transfer.note ?? "").toLocaleLowerCase().includes(note)) {
      return false;
    }

    if (
      destination &&
      !(transfer.destination ?? "").toLocaleLowerCase().includes(destination)
    ) {
      return false;
    }

    if (currency && transfer.currency !== currency) {
      return false;
    }

    return true;
  });
}

// دالة الاستعلام العامة
export async function queryTransfers(filters = {}, tx) {
  const primaryQuery = choosePrimaryQuery(filters);

  let transfers;

  switch (primaryQuery) {
    case "dateRange":
      transfers = await getTransfersByDateRange(
        {
          dateFromTimestamp: filters.dateFromTimestamp,

          dateToExclusiveTimestamp: filters.dateToExclusiveTimestamp,
        },
        tx
      );
      break;

    case "direction":
      transfers = await getTransfersByDirection(filters.direction, tx);
      break;

    default:
      transfers = await getAllTransfers(tx);
      break;
  }

  return applyRemainingTransferFilters(transfers, filters, primaryQuery);
}

const transferRepository = {
    queryTransfers,
    getTransferById,
    addTransfer,
    updateTransfer,
    deleteTransfer
}
export default transferRepository