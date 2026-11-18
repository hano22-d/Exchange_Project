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

export function createPartyStore(db) {
  const store = db.createObjectStore("parties", {
    keyPath: "id",
    autoIncrement: true,
  });

  store.createIndex("fullNameIndex", "fullName");
}

export function createDebtStore(db) {
  const store = db.createObjectStore("debts", {
    keyPath: "id",
    autoIncrement: true,
  });

  store.createIndex("partyIdIndex", "partyId");
  store.createIndex("dateIndex", "date");
  store.createIndex("directionIndex", "direction");
  store.createIndex("currencyIndex", "currency");
}

export function createElectronicWalletStore(db) {
  const store = db.createObjectStore("electronicWallets", {
    keyPath: "id",
    autoIncrement: true,
  });

  store.createIndex("providerIndex", "provider");
  store.createIndex("nameIndex", "name");

  return store;
}

export function createElectronicWalletBalanceStore(db) {
  const store = db.createObjectStore("electronicWalletBalances", {
    keyPath: ["walletId", "currency"],
  });

  store.createIndex("walletIdIndex", "walletId");
  store.createIndex("currencyIndex", "currency");

  return store;
}

export function createElectronicWalletOperationStore(db) {
  const store = db.createObjectStore("electronicWalletOperations", {
    keyPath: "id",
    autoIncrement: true,
  });

  store.createIndex("walletIdIndex", "walletId");

  store.createIndex("walletCurrencyIndex", ["walletId", "currency"]);

  store.createIndex("currencyIndex", "currency");
  store.createIndex("operationTypeIndex", "operationType");
  store.createIndex("dateIndex", "date");

  return store;
}
