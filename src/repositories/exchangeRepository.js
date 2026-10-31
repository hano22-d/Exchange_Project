import { indexesName } from "../db/schema";
import { requestToPromise } from "../shared/utilsDB";

const EXCHANGE_OBJECT_STORE = "exchanges";

// ========== دوال العمليات الأساسية ========== //
export async function getAllExchanges(tx) {
  const store = tx.objectStore(EXCHANGE_OBJECT_STORE);

  const result = await requestToPromise(store.getAll());

  return result;
}

async function getExchangeById(transaction, id) {
  const store = transaction.objectStore(EXCHANGE_OBJECT_STORE);
  const request = store.get(id);

  return await requestToPromise(request);
}

async function addExchange(transaction, newExchange) {
  const store = transaction.objectStore(EXCHANGE_OBJECT_STORE);
  const request = store.add(newExchange);

  return await requestToPromise(request);
}

async function updateExchange(transaction, updatedExchange) {
  const store = transaction.objectStore(EXCHANGE_OBJECT_STORE);
  const request = store.put(updatedExchange);

  await requestToPromise(request);

  return updatedExchange;
}

async function deleteExchange(transaction, id) {
  const store = transaction.objectStore(EXCHANGE_OBJECT_STORE);
  const request = store.delete(id);

  return await requestToPromise(request);
}

// ========== دوال الفهرسة ========== //
async function getExchangesByFromCurrency(transaction, currency) {
  const store = transaction.objectStore(EXCHANGE_OBJECT_STORE);
  const index = store.index(indexesName.fromCurrency);
  const request = index.getAll(currency);

  return await requestToPromise(request);
}

async function getExchangesByToCurrency(transaction, currency) {
  const store = transaction.objectStore(EXCHANGE_OBJECT_STORE);
  const index = store.index(indexesName.toCurrency);
  const request = index.getAll(currency);

  return await requestToPromise(request);
}

async function getExchangeByCurrencyPair(
  transaction,
  fromCurrency,
  toCurrency
) {
  const store = transaction.objectStore(EXCHANGE_OBJECT_STORE);
  const index = store.index(indexesName.currencyPair);

  const range = IDBKeyRange.only([fromCurrency, toCurrency]);
  const request = index.getAll(range);

  return await requestToPromise(request);
}

async function getExchangeByDateRange(transaction, fromTimeStamp, toTimeStamp) {
  const store = transaction.objectStore(EXCHANGE_OBJECT_STORE);
  const index = store.index(indexesName.date);

  let range;

  if (fromTimeStamp && toTimeStamp) {
    range = IDBKeyRange.bound(fromTimeStamp, toTimeStamp, false, true);
  } else if (fromTimeStamp) {
    range = IDBKeyRange.lowerBound(fromTimeStamp, false);
  } else {
    range = IDBKeyRange.upperBound(toTimeStamp, true);
  }

  const request = index.getAll(range);

  return await requestToPromise(request);
}

// ========== دالة اختيار الفهرس الاساسي ========== //
export function choosePrimaryQuery(filters) {
  const {
    fromCurrency,
    toCurrency,
    dateFromTimestamp,
    dateToExclusiveTimestamp,
  } = filters;

  const hasFromCurrency = Boolean(fromCurrency);
  const hasToCurrency = Boolean(toCurrency);

  const hasFromDate = dateFromTimestamp != null;
  const hasToDate = dateToExclusiveTimestamp != null;

  if (hasFromCurrency && hasToCurrency) {
    return "currencyPair";
  } else if (hasFromDate && hasToDate) {
    return "dateRange";
  } else if (hasFromCurrency) {
    return "fromCurrency";
  } else if (hasToCurrency) {
    return "toCurrency";
  } else if (hasFromDate || hasToDate) {
    return "dateRange";
  }

  return "all";
}

// ========== دالة تطبيق الفلاتر المتبقية =========== //
export function applyRamainingFilters(exchanges, primaryQuery, filters = {}) {
  const {
    fromCurrency,
    toCurrency,
    dateFromTimestamp,
    dateToExclusiveTimestamp,
    note,
  } = filters;

  return exchanges.filter((exchange) => {
    if (
      fromCurrency &&
      primaryQuery !== "fromCurrency" &&
      exchange.fromCurrency !== fromCurrency
    ) {
      return false;
    }

    if (
      toCurrency &&
      primaryQuery !== "toCurrency" &&
      exchange.toCurrency !== toCurrency
    ) {
      return false;
    }

    if (primaryQuery !== "dateRange") {
      if (dateFromTimestamp != null && exchange.date < dateFromTimestamp) {
        return false;
      }

      if (
        dateToExclusiveTimestamp != null &&
        exchange.date >= dateToExclusiveTimestamp
      ) {
        return false;
      }
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
  });
}

// ======== دالة الاستعلام العامة ======== //
export async function queryExchanges(transaction, filters = {}) {
  const {
    fromCurrency,
    toCurrency,
    dateFromTimestamp,
    dateToExclusiveTimestamp,
  } = filters;

  const primaryQuery = choosePrimaryQuery(filters);

  let exchanges;

  switch (primaryQuery) {
    case "currencyPair": {
      exchanges = await getExchangeByCurrencyPair(
        transaction,
        fromCurrency,
        toCurrency
      );
      break;
    }

    case "dateRange": {
      exchanges = await getExchangeByDateRange(
        transaction,
        dateFromTimestamp,
        dateToExclusiveTimestamp
      );
      break;
    }

    case "fromCurrency": {
      exchanges = await getExchangesByFromCurrency(transaction, fromCurrency);
      break;
    }

    case "toCurrency": {
      exchanges = await getExchangesByToCurrency(transaction, toCurrency);
      break;
    }

    default: {
      exchanges = await getAllExchanges(transaction);
    }
  }

  return applyRamainingFilters(exchanges, primaryQuery, filters);
}

const exchangeRpository = {
  queryExchanges,
  getExchangeById,
  addExchange,
  updateExchange,
  deleteExchange,
};

export default exchangeRpository;
