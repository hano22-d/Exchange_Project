import { useState, useEffect, useCallback, useRef } from "react";

import dashboardService from "../../services/dashboardService.js";

export default function useLatestOperations(limit = 5) {
  // ========================================
  // حالة البيانات
  // ========================================

  const [operations, setOperations] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // ========================================
  // منع الطلبات القديمة من تحديث الحالة
  // ========================================

  const requestIdRef = useRef(0);

  // ========================================
  // جلب أحدث العمليات
  // ========================================

  const fetchLatestOperations = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const result = await dashboardService.getLatestOperationsService(limit);

      if (requestId === requestIdRef.current) {
        setOperations(result ?? []);
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
  }, [limit]);

  // ========================================
  // الجلب الأولي عند تحميل المكون
  // ========================================

  useEffect(() => {
    fetchLatestOperations().catch(() => {

    });

    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchLatestOperations]);

  return {
    operations,
    loading,
    error,
    refetch: fetchLatestOperations,
  };
}
