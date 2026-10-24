import {
    useState,
    useEffect,
    useCallback,
    useRef,
  } from "react";
import { getExchangeByIdService } from "../../services/exchangeService";
  

  
  
  export function useExchange(id) {

    //الخاص بالحركة id التحقق من
    const exchangeId =
      id === undefined || id === null || id === ""
        ? null
        : Number(id);
  
  
    const [exchange, setExchange] = useState(null);
  
    const [loading, setLoading] = useState(false);
  
    const [error, setError] = useState(null);
  
  
    const requestIdRef = useRef(0);
  
  
    const refetch = useCallback(async () => {
      if (exchangeId === null) {
        setExchange(null);
        setError(null);
        setLoading(false);
  
        return null;
      }
  
      const requestId = ++requestIdRef.current;
  
      setLoading(true);
      setError(null);
  
      try {
        const result = await getExchangeByIdService(
          exchangeId
        );
  
        if (requestId !== requestIdRef.current) {
          return result;
        }
  
        setExchange(result);
  
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
    }, [exchangeId]);
  
  
    //id القراءة عند فتح التفاصيل او تغير
    useEffect(() => {
      if (exchangeId === null) {
        setExchange(null);
        setError(null);
        setLoading(false);
  
        return;
      }
  
      setExchange(null);
  
      refetch().catch(() => {
        // الخطأ محفوظ داخل error
      });
  
      return () => {
        requestIdRef.current += 1;
      };
    }, [exchangeId, refetch]);
  
  
    
  // دالة تحديث حالة الحركة بعد عملية تعديل
    const setExchangeData = useCallback(
      (nextExchange) => {
        if (
          nextExchange !== null &&
          Number(nextExchange.id) !== exchangeId
        ) {
          setError(
            new Error(
              "The exchange ID does not match the current record."
            )
          );
  
          return;
        }
  
        setExchange(nextExchange);
        setError(null);
      },
      [exchangeId]
    );

  
    return {
      exchange,
      loading,
      error,
      refetch,
      setExchangeData,
    };
  }