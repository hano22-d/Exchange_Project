import {
  createCashboxStore,
  createExchangeStore,
  createTransferStore,
} from "./schema";

export function runMigration(db, transaction, oldVersion) {
  if (oldVersion < 1) {
    createCashboxStore(db);
    createExchangeStore(db);
  }
  if (oldVersion < 2) {
    createTransferStore(db);
  }
}
