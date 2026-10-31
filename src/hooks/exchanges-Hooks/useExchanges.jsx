import { useState, useEffect, useCallback, useRef } from "react";
import { queryExchangesService } from "../../services/exchangeService";

function useExchanges() {
  // حالة البيانات
  const [exchanges, setExchanges] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // منع نتائج الطلبات القديمة من الكتابة
  const requestIdRef = useRef(0);

  const refetch = useCallback(async (filters = {}) => {
    // استخراج قيم الفلاتر
    const dateFrom = filters?.dateFrom ?? "";
    const dateTo = filters?.dateTo ?? "";

    const fromCurrency =
      typeof filters?.fromCurrency === "string"
        ? filters.fromCurrency.trim().toUpperCase()
        : "";

    const toCurrency =
      typeof filters?.toCurrency === "string"
        ? filters.toCurrency.trim().toUpperCase()
        : "";

    const note = typeof filters?.note === "string" ? filters.note.trim() : "";

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      console.log("Normalized Filters:", {
        dateFrom,
        dateTo,
        fromCurrency,
        toCurrency,
        note,
      });
      const result = await queryExchangesService({
        dateFrom,
        dateTo,
        fromCurrency,
        toCurrency,
        note,
      });

      console.log("Query Result:", result);

      if (requestId === requestIdRef.current) {
        setExchanges(result);
      }

      return result;
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setError(error);
      }

      throw error;
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // الجلب التلقائي عند فتح الصفحة
  useEffect(() => {

    refetch().catch(() => {
      // نمنع رفض Promise غير المعالج داخل useEffect
    });

    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  return {
    exchanges,
    loading,
    error,
    refetch,
  };
}
export default useExchanges;
