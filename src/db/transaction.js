export function createTransaction(db,objectStories,mode = "readonly") {
    return db.transaction(objectStories,mode)
}

export function waitForTransactionCompletion(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
  
      tx.onerror = () => {
        reject(tx.error);
      };
  
      tx.onabort = () => {
        reject(
          tx.error ||
          new Error("Transaction aborted")
        );
      };
    });
  }