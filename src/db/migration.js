import { createCashboxStore, createExchangeStore } from "./schema";

export function runMigration(db, transaction, oldVersion) {
  if (oldVersion < 1) {
    createCashboxStore(db);
    createExchangeStore(db);
  }
}
