import openDatabase from "./database";

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

  // =============== دالة ادارة اكتمال المعاملات =========== //
  export async function runInTransaction(storeNames, mode, operation) {
    const db = await openDatabase();
  
    const tx = db.transaction(storeNames, mode);
  
    // نراقب اكتمال المعاملة فور إنشائها.
    const completion = waitForTransactionCompletion(tx);
  
    /* في المسار الرئيسي await completion نتجنب رفضًا غير معالج إذا أُجهضت المعاملة قبل الوصول إلى */
    completion.catch(() => {});
  
    try {
      const result = await operation(tx);
  
      // ننتظر اكتمال المعاملة بأكملها.
      await completion;
  
      return result;
    } catch (error) {
      // قد تكون المعاملة أُجهضت بالفعل.
      // لذلك نحاول إجهاضها مع تجاهل خطأ abort إن كانت قد انتهت.
      try {
        tx.abort();
      } catch {
        // لا حاجة لتنفيذ شيء هنا
      }
  
      // ننتظر انتهاء المعاملة قبل تمرير الخطأ
      await completion.catch(() => {});
  
      throw error;
    }
  }