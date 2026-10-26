export const indexesName = {
  fromCurrency: "fromCurrencyIndex",
  toCurrency: "toCurrencyIndex",
  date: "dateIndex",
  currencyPair: "currencyPairIndex",
};

export function createCashboxStore(db) {
  return db.createObjectStore("cashboxes", { keyPath: "currency" });
}

export function createExchangeStore(db) {
  const store = db.createObjectStore("exchanges", {
    keyPath: "id",
    autoIncrement: true,
  });

  store.createIndex(indexesName.fromCurrency, "fromCurrency");
  store.createIndex(indexesName.toCurrency, "toCurrency");
  store.createIndex(indexesName.date, "date");
  store.createIndex(indexesName.currencyPair, ["fromCurrency", "toCurrency"]);

  return store;
}

export function createTransferStore(db) {
  const store = db.createObjectStore("transfers", {
    keyPath: "id",
    autoIncrement: true,
  });

  store.createIndex("dateIndex", "date");
  store.createIndex("directionIndex", "direction");
}
