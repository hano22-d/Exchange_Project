import { useState, useEffect, useCallback, useRef } from "react";
import partyService from "../../services/partyService";

export default function useParties(searchTerm = "") {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);

  // جلب الأشخاص أو البحث عنهم
  const fetchParties = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const normalizedSearch =
        typeof searchTerm === "string" ? searchTerm.trim() : "";

      const result = normalizedSearch
        ? await partyService.searchPartiesByNameService(normalizedSearch)
        : await partyService.getAllPartiesService();

      // تجاهل نتيجة الطلب القديم
      if (requestId === requestIdRef.current) {
        setParties(result);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setError(error);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [searchTerm]);

  // الجلب عند تحميل Hook أو تغير نص البحث
  useEffect(() => {
    fetchParties();

    return () => {
      requestIdRef.current++;
    };
  }, [fetchParties]);

  return {
    parties,
    loading,
    error,
    refetch: fetchParties,
  };
}
