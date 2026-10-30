import { useState, useEffect, useCallback, useRef } from "react";
import debtService from "../../services/debtService";


export default function useDebts(filters = {}) {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);

  // استخراج الفلاتر المطلوبة
  const {
    partyId,
    currency,
    direction,
    dateFromTimestamp,
    dateToExclusiveTimestamp,
    note,
  } = filters;

  // الاستعلام عن حركات الدين
  const fetchDebts = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const result = await debtService.queryDebtsService({
        partyId,
        currency,
        direction,
        dateFromTimestamp,
        dateToExclusiveTimestamp,
        note,
      });

      if (requestId === requestIdRef.current) {
        setDebts(result);
      }

      return result;
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setError(error);
      }

      return null;
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [
    partyId,
    currency,
    direction,
    dateFromTimestamp,
    dateToExclusiveTimestamp,
    note,
  ]);

  // إعادة الاستعلام عند تغير الفلاتر
  useEffect(() => {
    fetchDebts();

    return () => {
      requestIdRef.current++;
    };
  }, [fetchDebts]);

  return {
    debts,
    loading,
    error,
    refetch: fetchDebts,
  };
}
