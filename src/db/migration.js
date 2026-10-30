import {
  createCashboxStore,
  createDebtStore,
  createExchangeStore,
  createPartyStore,
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
  if(oldVersion < 3) {
    createPartyStore(db)
    createDebtStore(db)
  }
}
