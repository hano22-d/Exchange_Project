import openDatabase from "./database";

function waitForTransactionCompletion(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();

    tx.onerror = () => {
      reject(tx.error);
    };

    tx.onabort = () => {
      reject(tx.error || new Error("Transaction aborted"));
    };
  });
}

// ينشئ معاملة مستقلة فوق اتصال قاعدة البيانات المشترك، ثم ينتظر اكتمالها.
export async function runInTransaction(storeNames, mode, operation) {
  const db = await openDatabase();
  const tx = db.transaction(storeNames, mode);

  // نراقب اكتمال المعاملة فور إنشائها.
  const completion = waitForTransactionCompletion(tx);

  // نتجنب رفضاً غير معالج إذا أُجهضت المعاملة قبل الوصول إلى await completion.
  completion.catch(() => {});

  try {
    const result = await operation(tx);

    // لا نعيد النتيجة قبل اكتمال المعاملة بأكملها.
    await completion;

    return result;
  } catch (error) {
    // قد تكون المعاملة أُجهضت بالفعل؛ لذلك نتجاهل خطأ abort إن كانت قد انتهت.
    try {
      tx.abort();
    } catch {
      // لا حاجة لتنفيذ شيء هنا.
    }

    await completion.catch(() => {});
    throw error;
  }
}
