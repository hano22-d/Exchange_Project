import { useState, useEffect, useCallback, useRef } from "react";

import electronicWalletService from "../../services/electronicWalletService.js";

function useElectronicWallets() {
  // =================================
  // حالة البيانات
  // =================================

  const [wallets, setWallets] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // =================================
  // المراجع
  // =================================

  // منع نتائج الطلبات القديمة من تحديث الحالة
  const requestIdRef = useRef(0);

  // =================================
  // جلب جميع المحافظ
  // =================================

  const fetchWallets = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const result = await electronicWalletService.getWalletsOverviewService();

      if (requestId === requestIdRef.current) {
        setWallets(result ?? []);
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

  // =================================
  // الجلب الأولي
  // =================================

  useEffect(() => {
    fetchWallets().catch(() => {
      // الخطأ محفوظ داخل error
    });

    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchWallets]);

  // =================================
  // البيانات والدوال العامة
  // =================================

  return {
    wallets,
    loading,
    error,

    refetch: fetchWallets,
  };
}

export default useElectronicWallets;
