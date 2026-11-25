import { runMigration } from "./migration";

export const DATABASE_NAME = "ExchangeDB";
export const CURRENT_VERSION = 4;

export const DATABASE_CONNECTION_EVENTS = Object.freeze({
  BLOCKED: "exchange-db:blocked",
  READY: "exchange-db:ready",
  VERSION_CHANGE: "exchange-db:versionchange",
});

// يحتفظ مدير الاتصال باتصال واحد مشترك بين جميع طبقات التطبيق.
let databaseConnection = null;
let databasePromise = null;
let connectionGeneration = 0;
let reloadRequired = false;

function dispatchDatabaseEvent(eventName, detail = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

function createVersionChangeError() {
  const error = new Error(
    "تم تحديث إصدار قاعدة البيانات في تبويب آخر. يرجى تحديث الصفحة لمتابعة العمل."
  );
  error.name = "DatabaseVersionChangeError";
  return error;
}

/**
 * يعيد اتصال قاعدة البيانات المشترك.
 * يفتح الاتصال عند أول طلب فقط، ويعيد استخدامه في الطلبات التالية.
 */
export function openDatabase() {
  if (reloadRequired) {
    return Promise.reject(createVersionChangeError());
  }

  if (databaseConnection) {
    return Promise.resolve(databaseConnection);
  }

  // إذا كان طلب الفتح الأول ما يزال جارياً، نشارك الوعد نفسه.
  if (databasePromise) {
    return databasePromise;
  }

  const currentGeneration = connectionGeneration;

  const openingPromise = new Promise((resolve, reject) => {
    let request;

    try {
      request = indexedDB.open(DATABASE_NAME, CURRENT_VERSION);
    } catch (error) {
      reject(error);
      return;
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const upgradeTransaction = event.target.transaction;

      runMigration(db, upgradeTransaction, event.oldVersion);
    };

    // يحدث عندما تمنع اتصالات قديمة إكمال ترقية قاعدة البيانات.
    request.onblocked = (event) => {
      dispatchDatabaseEvent(DATABASE_CONNECTION_EVENTS.BLOCKED, {
        oldVersion: event.oldVersion,
        newVersion: event.newVersion,
      });
    };

    request.onsuccess = () => {
      const db = request.result;

      // إذا أُغلق المدير يدوياً أثناء انتظار الفتح، فلا نحتفظ بالاتصال الجديد.
      if (currentGeneration !== connectionGeneration || reloadRequired) {
        db.close();
        reject(
          reloadRequired
            ? createVersionChangeError()
            : new Error(
                "Database connection was closed before opening completed."
              )
        );
        return;
      }

      // عند طلب ترقية من تبويب آخر، نغلق الاتصال القديم ونمنع استخدامه مجدداً.
      db.onversionchange = (event) => {
        reloadRequired = true;
        connectionGeneration += 1;

        db.close();

        if (databaseConnection === db) {
          databaseConnection = null;
        }

        if (databasePromise === openingPromise) {
          databasePromise = null;
        }

        dispatchDatabaseEvent(DATABASE_CONNECTION_EVENTS.VERSION_CHANGE, {
          oldVersion: event.oldVersion,
          newVersion: event.newVersion,
        });
      };

      databaseConnection = db;
      dispatchDatabaseEvent(DATABASE_CONNECTION_EVENTS.READY);
      resolve(db);
    };

    request.onerror = () => {
      reject(
        request.error || new Error("Failed to open the IndexedDB database.")
      );
    };
  });

  databasePromise = openingPromise;

  // إزالة الوعد الفاشل من الذاكرة حتى يمكن إعادة محاولة الفتح لاحقاً.
  openingPromise.catch(() => {
    if (databasePromise === openingPromise) {
      databasePromise = null;
    }
  });

  return openingPromise;
}

/**
 * يغلق الاتصال المشترك صراحةً عند الحاجة، ولا يُستدعى بعد كل Transaction.
 * كما يبطل أي طلب فتح جارٍ حتى لا يُعاد الاحتفاظ باتصال بعد الإغلاق.
 */
export function closeDatabase() {
  connectionGeneration += 1;

  const db = databaseConnection;
  databaseConnection = null;
  databasePromise = null;

  if (db) {
    db.close();
  }
}

export default openDatabase;
