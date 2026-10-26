import { runMigration } from "./migration";

const DATABASE_NAME = "ExchangeDB";
const CURRENT_VERSION = 2;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const db = indexedDB.open(DATABASE_NAME, CURRENT_VERSION);

    db.onupgradeneeded = (event) => {
      const db = event.target.result;
      const upgradeTransaction = event.target.transaction;

      runMigration(db, upgradeTransaction, event.oldVersion);
    };

    db.onsuccess = () => resolve(db.result);
    db.onerror = () => reject(db.error);
  });
}

export default openDatabase;
