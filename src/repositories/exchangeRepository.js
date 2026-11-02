import { indexesName } from "../db/schema";
import { requestToPromise } from "../shared/utilsDB";

const EXCHANGE_OBJECT_STORE = "exchanges";

// ========================================
// دوال العمليات الأساسية
// ========================================

export async function getAllExchanges(tx) {
  const store = tx.objectStore(EXCHANGE_OBJECT_STORE);

  return await requestToPromise(store.getAll());
}

async function getExchangeById(transaction, id) {
  const store = transaction.objectStore(EXCHANGE_OBJECT_STORE);

  return await requestToPromise(store.get(id));
}

async function addExchange(transaction, newExchange) {
  const store = transaction.objectStore(EXCHANGE_OBJECT_STORE);

  return await requestToPromise(store.add(newExchange));
}

async function updateExchange(transaction, updatedExchange) {
  const store = transaction.objectStore(EXCHANGE_OBJECT_STORE);

  await requestToPromise(store.put(updatedExchange));

  return updatedExchange;
}

async function deleteExchange(transaction, id) {
  const store = transaction.objectStore(EXCHANGE_OBJECT_STORE);

  return await requestToPromise(store.delete(id));
}

// ==========================================
// دالة الاستعلام حسب نطاق التاريخ
// ==========================================
function buildDateRange(filters) {
  const { dateFromTimestamp, dateToExclusiveTimestamp } = filters;

  const hasFromDate = dateFromTimestamp != null;
  const hasToDate = dateToExclusiveTimestamp != null;

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

// ========================================
// التحقق من مطابقة الحركة للفلاتر
// ========================================

function matchesExchangeFilters(exchange, filters) {
  const { fromCurrency, toCurrency, note } = filters;

  // فلترة عملة المصدر
  if (fromCurrency && exchange.fromCurrency !== fromCurrency) {
    return false;
  }

  // فلترة عملة الوجهة
  if (toCurrency && exchange.toCurrency !== toCurrency) {
    return false;
  }

  // فلترة الملاحظات
  if (note) {
    const exchangeNote = String(exchange.note ?? "").toLowerCase();

    const searchNote = note.trim().toLowerCase();

    if (!exchangeNote.includes(searchNote)) {
      return false;
    }
  }

  return true;
}

// ========================================
// دالة الاستعلام الاساسية
// ========================================

export function queryExchanges(transaction, filters = {}, pagination = {}) {
  // استخراج معلومات Pagination
  const { offset = 0, limit = 10 } = pagination;

  // قيم احتياطية صحيحة
  const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;

  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;

  // تجهيز الفلاتر النصية
  const normalizedFilters = {
    fromCurrency:
      typeof filters.fromCurrency === "string"
        ? filters.fromCurrency.trim().toUpperCase()
        : "",

    toCurrency:
      typeof filters.toCurrency === "string"
        ? filters.toCurrency.trim().toUpperCase()
        : "",

    note:
      typeof filters.note === "string" ? filters.note.trim().toLowerCase() : "",
  };

  // تحديد النطاق الزمني
  const dateRange = buildDateRange(filters);

  // الوصول إلى مخزن الحركات وفهرس التاريخ
  const store = transaction.objectStore(EXCHANGE_OBJECT_STORE);

  const dateIndex = store.index(indexesName.date);

  // فتح Cursor بترتيب تنازلي حسب التاريخ
  const request = dateIndex.openCursor(dateRange);

  // تخزين عناصر الصفحة فقط
  const items = [];

  // عدد جميع الحركات المطابقة
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

      const exchange = cursor.value;

      const isMatch = matchesExchangeFilters(exchange, normalizedFilters);

      if (isMatch) {
        // التحقق من الوصول للصفخة المطلوبة
        if (totalItems >= safeOffset && items.length < safeLimit) {
          items.push(exchange);
        }

        // زيادة عدد النتائج المطابقة
        totalItems++;
      }

      // الانتقال إلى السجل التالي
      cursor.continue();
    };

    request.onerror = () => {
      reject(request.error || new Error("فشل جلب حركات الصرف."));
    };
  });
}

const exchangeRpository = {
  queryExchanges,
  getExchangeById,
  addExchange,
  updateExchange,
  deleteExchange,
};

export default exchangeRpository;
