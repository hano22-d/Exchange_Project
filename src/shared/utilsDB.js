export function requestToPromise(request) {

    return new Promise((resolve,reject) => {

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

// جلب أحدث عدد محدد من السجلات باستخدام فهرس IndexedDB
export function getLatestRecordsByIndex(
    store,
    indexName,
    limit = 5
  ) {
    if (!Number.isSafeInteger(limit) || limit < 0) {
      throw new RangeError("Limit must be a non-negative integer.");
    }
  
    if (limit === 0) {
      return Promise.resolve([]);
    }
  
    const index = store.index(indexName);
  
    // البدء من أحدث سجل
    const request = index.openCursor(null, "prev");
  
    const records = [];
  
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cursor = request.result;
  
        // لا توجد سجلات أخرى
        if (!cursor) {
          resolve(records);
          return;
        }
  
        records.push(cursor.value);
  
        // التوقف بعد اكتمال العدد المطلوب
        if (records.length >= limit) {
          resolve(records);
          return;
        }
  
        cursor.continue();
      };
  
      request.onerror = () => {
        reject(
          request.error ||
            new Error(`Failed to read index: ${indexName}`)
        );
      };
    });
  }