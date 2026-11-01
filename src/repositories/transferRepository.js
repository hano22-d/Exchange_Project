import { requestToPromise } from "../shared/utilsDB";

const TRANSFER_STORE_NAME = "transfers";
const DATE_INDEX_NAME = "dateIndex";

// ==========================================
// دوال العمليات الأساسية
// ==========================================
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
// دالة الاستعلام حسب نطاق التاريخ
// ==========================================
function buildTransferDateRange(filters = {}) {
  const { dateFromTimestamp, dateToExclusiveTimestamp } = filters;

  const hasFromDate = dateFromTimestamp != null;
  const hasToDate = dateToExclusiveTimestamp != null;

  // يوجد تاريخ بداية ونهاية
  if (hasFromDate && hasToDate) {
    return IDBKeyRange.bound(
      dateFromTimestamp,
      dateToExclusiveTimestamp,
      false,
      true
    );
  }

  if (hasFromDate) {
    return IDBKeyRange.lowerBound(dateFromTimestamp, false);
  }

  if (hasToDate) {
    return IDBKeyRange.upperBound(dateToExclusiveTimestamp, true);
  }

  return null;
}

// ==========================================
// مطابقة الحوالة مع بقية الفلاتر
// ==========================================
function matchesTransferFilters(transfer, filters = {}) {
  const { direction, fullname, currency, note, destination } = filters;

  // فلترة الاتجاه
  if (direction && transfer.direction !== direction) {
    return false;
  }

  // فلترة اسم صاحب الحوالة
  if (fullname) {
    const transferFullname = String(
      transfer.fullName ?? transfer.fullname ?? ""
    ).toLocaleLowerCase();
  
    if (!transferFullname.includes(fullname)) {
      return false;
    }
  }

  // فلترة العملة
  if (currency && transfer.currency !== currency) {
    return false;
  }

  // فلترة الملاحظات
  if (note) {
    const transferNote = String(transfer.note ?? "").toLocaleLowerCase();

    if (!transferNote.includes(note)) {
      return false;
    }
  }

  // فلترة الوجهة
  if (destination) {
    const transferDestination = String(
      transfer.destination ?? ""
    ).toLocaleLowerCase();

    if (!transferDestination.includes(destination)) {
      return false;
    }
  }

  return true;
}

// ==========================================
// دالة الاستعلام الاساسية
// ==========================================
export function queryTransfers(tx, filters = {}, pagination = {}) {
  const { offset = 0, limit = 10 } = pagination;

  // إنشاء نطاق التاريخ إن وجد
  const dateRange = buildTransferDateRange(filters);

  const store = tx.objectStore(TRANSFER_STORE_NAME);

  const dateIndex = store.index(DATE_INDEX_NAME);

  const request = dateIndex.openCursor(dateRange, "prev");

  const items = [];

  let totalItems = 0;

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const cursor = request.result;

      // انتهت قراءة السجلات
      if (!cursor) {
        resolve({
          items,
          totalItems,
        });

        return;
      }

      const transfer = cursor.value;

      // فحص بقية الفلاتر
      const isMatch = matchesTransferFilters(transfer, filters);

      if (isMatch) {
        // تجاوز السجلات السابقة للصفحة المطلوبة
        // ثم الاحتفاظ بعناصر الصفحة فقط
        if (totalItems >= offset && items.length < limit) {
          items.push(transfer);
        }

        // زيادة عدد النتائج المطابقة
        totalItems++;
      }

      // الانتقال إلى السجل التالي
      cursor.continue();
    };

    request.onerror = () => {
      reject(request.error || new Error("فشل جلب الحوالات."));
    };
  });
}

const transferRepository = {
  queryTransfers,
  getTransferById,
  addTransfer,
  updateTransfer,
  deleteTransfer,
};

export default transferRepository;
