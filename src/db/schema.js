export function createCashboxStore(db) {
  return db.createObjectStore("cashboxes", { keyPath: "currency" });
}

export function createExchangeStore(db) {
  const store = db.createObjectStore("exchanges", {
    keyPath: "id",
    autoIncrement: true,
  });

  store.createIndex("fromCurrencyIndex", "fromCurrency");
  store.createIndex("toCurrencyIndex", "toCurrency");
  store.createIndex("dateIndex", "date");
  store.createIndex("currencyPairIndex", ["fromCurrency", "toCurrency"]);

  return store
}
