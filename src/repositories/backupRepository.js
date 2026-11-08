import { requestToPromise } from "../shared/utilsDB";

export const BACKUP_STORE_NAMES = [
  "cashboxes",
  "exchanges",
  "transfers",
  "parties",
  "debts",
];

// جلب جميع بيانات قاعدة البيانات
export async function getBackupData(tx) {
  const requests = BACKUP_STORE_NAMES.map((storeName) => {
    const store = tx.objectStore(storeName);

    return {
      storeName,
      request: requestToPromise(store.getAll()),
    };
  });

  const results = await Promise.all(
    requests.map(async ({ storeName, request }) => ({
      storeName,
      records: await request,
    }))
  );

  const backupData = {};

  for (const { storeName, records } of results) {
    backupData[storeName] = records;
  }

  return backupData;
}

// مسح جميع السجلات من مخازن النسخة الاحتياطية
export async function clearBackupStores(tx) {
  const requests = BACKUP_STORE_NAMES.map((storeName) => {
    const store = tx.objectStore(storeName);

    return requestToPromise(store.clear());
  });

  await Promise.all(requests);
}

// استعادة البيانات إلى مخازن قاعدة البيانات

export async function restoreBackupData(data, tx) {
  const requests = [];

  // أولًا: جدولة مسح جميع المخازن
  for (const storeName of BACKUP_STORE_NAMES) {
    const store = tx.objectStore(storeName);

    requests.push(requestToPromise(store.clear()));
  }

  // ثانيًا: جدولة إضافة جميع السجلات
  for (const storeName of BACKUP_STORE_NAMES) {
    const store = tx.objectStore(storeName);

    for (const record of data[storeName]) {
      requests.push(requestToPromise(store.add(record)));
    }
  }

  // انتظار اكتمال جميع الطلبات
  await Promise.all(requests);
}
