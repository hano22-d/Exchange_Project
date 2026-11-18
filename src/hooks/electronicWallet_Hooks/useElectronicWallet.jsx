import { useState, useEffect, useCallback, useRef } from "react";
import electronicWalletService from "../../services/electronicWalletService";

export function useElectronicWallet(id) {
  // =================================
  // تطبيع المعرّف
  // =================================

  const walletId =
    id === undefined || id === null || id === "" ? null : Number(id);

  // =================================
  // حالة البيانات
  // =================================

  const [account, setAccount] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // =================================
  // المراجع
  // =================================

  const requestIdRef = useRef(0);

  // =================================
  // جلب تفاصيل المحفظة
  // =================================

  const fetchWallet = useCallback(async () => {
    if (walletId === null || !Number.isSafeInteger(walletId) || walletId <= 0) {
      setAccount(null);
      setError(null);
      setLoading(false);

      return null;
    }

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const result = await electronicWalletService.getWalletDetailsService(
        walletId
      );

      if (requestId !== requestIdRef.current) {
        return result;
      }

      setAccount(result);

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
  }, [walletId]);

  // =================================
  // الجلب عند فتح المحفظة أو تغير ID
  // =================================

  useEffect(() => {
    setAccount(null);

    fetchWallet().catch(() => {
      // الخطأ محفوظ داخل error
    });

    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchWallet]);

  return {
    account,

    wallet: account?.wallet ?? null,

    balances: account?.balances ?? [],

    loading,
    error,

    refetch: fetchWallet,
  };
}
