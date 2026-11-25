import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const ReconciliationContext = createContext(null);

const STORAGE_KEY = "last_reconciliation";

// قراءة آخر جرد محفوظ
function getInitialReconciliation() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Failed to read reconciliation:", error);
    return null;
  }
}

export function ReconciliationProvider({ children }) {
  const [lastReconciliation, setLastReconciliation] = useState(
    getInitialReconciliation
  );

  // حفظ نتيجة جرد جديدة
  const saveReconciliation = useCallback((result) => {
    const record = {
      date: Date.now(),
      status: result.matched ? "matched" : "mismatched",
      mismatchedCount: result.mismatches.length,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));

      setLastReconciliation(record);

      return record;
    } catch (error) {
      throw new Error(`تعذر حفظ نتيجة الجرد: ${error.message}`);
    }
  }, []);

  // مزامنة الحالة عند تغييرها من تبويب آخر
  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key === STORAGE_KEY) {
        setLastReconciliation(
          event.newValue ? JSON.parse(event.newValue) : null
        );
      }
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const value = useMemo(
    () => ({
      lastReconciliation,
      saveReconciliation,
    }),
    [lastReconciliation, saveReconciliation]
  );

  return (
    <ReconciliationContext.Provider value={value}>
      {children}
    </ReconciliationContext.Provider>
  );
}

export function useReconciliation() {
  const context = useContext(ReconciliationContext);

  if (!context) {
    throw new Error(
      "useReconciliation must be used inside ReconciliationProvider."
    );
  }

  return context;
}
