import { useState, useEffect, useCallback, useRef } from "react";

import electronicWalletService from "../../services/electronicWalletService";

function useElectronicWalletOperations(walletId) {
  // =================================
  // تطبيع معرّف المحفظة
  // =================================

  const normalizedWalletId =
    walletId === undefined || walletId === null || walletId === ""
      ? null
      : Number(walletId);

  // =================================
  // حالة البيانات
  // =================================

  const [operations, setOperations] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // =================================
  // المراجع
  // =================================

  // منع الطلبات القديمة من تحديث الحالة
  const requestIdRef = useRef(0);

  // =================================
  // جلب عمليات المحفظة
  // =================================

  const fetchOperations = useCallback(
    async (filters = {}) => {
      const requestId = ++requestIdRef.current;

      if (
        normalizedWalletId === null ||
        !Number.isSafeInteger(normalizedWalletId) ||
        normalizedWalletId <= 0
      ) {
        setOperations([]);
        setError(null);
        setLoading(false);

        return [];
      }

      setLoading(true);
      setError(null);

      try {
        const result =
          await electronicWalletService.queryWalletOperationsService(
            normalizedWalletId,
            filters
          );

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
    },
    [normalizedWalletId]
  );

  // =================================
  // الجلب الأولي
  // =================================

  useEffect(() => {
    fetchOperations().catch(() => {
      // الخطأ محفوظ داخل error
    });

    return () => {
      requestIdRef.current++;
    };
  }, [fetchOperations]);

  // =================================
  // البيانات والدوال العامة
  // =================================

  return {
    operations,
    loading,
    error,

    refetch: fetchOperations,
  };
}

export default useElectronicWalletOperations;
