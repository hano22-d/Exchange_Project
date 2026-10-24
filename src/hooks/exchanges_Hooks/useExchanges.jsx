import {
    useState,
    useEffect,
    useCallback,
    useRef,
  } from "react";
  
  import {
    queryExchangesService,
  } from "../../../services/exchangeService.js";
  
  
  export function useExchanges(filters = {}) {

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
  
    const note =
      typeof filters?.note === "string"
        ? filters.note.trim()
        : "";
  
  

    // حالة البيانات
    const [exchanges, setExchanges] = useState([]);
  
    const [loading, setLoading] = useState(false);
  
    const [error, setError] = useState(null);
  
  
    // منع نتائج الطلبات القديمة من الكتابة
    const requestIdRef = useRef(0);

  
    const refetch = useCallback(async () => {
      const requestId = ++requestIdRef.current;
  
      setLoading(true);
      setError(null);
  
      try {
        const result = await queryExchangesService({
          dateFrom,
          dateTo,
          fromCurrency,
          toCurrency,
          note,
        });
  
        // إذا بدأ طلب أحدث، نتجاهل نتيجة الطلب الأقدم
        if (requestId !== requestIdRef.current) {
          return result;
        }
  
        setExchanges(result);
  
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
    }, [
      dateFrom,
      dateTo,
      fromCurrency,
      toCurrency,
      note,
    ]);
  
  

    // الجلب التلقائي عند فتح الصفحة أو تغيير الفلاتر
    useEffect(() => {

      setExchanges([]);
  
      refetch().catch(() => {
        // نمنع رفض Promise غير المعالج داخل useEffect
      });
  
      return () => {
        requestIdRef.current += 1;
      };
    }, [refetch]);
  
    
    return {
      exchanges,
      loading,
      error,
      refetch
    };
  }