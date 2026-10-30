import { useState, useEffect, useCallback, useRef } from "react";
import debtService from "../../services/debtService";


export default function usePartyDebtAccount(partyId) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);

  // جلب حساب الشخص
  const fetchAccount = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (partyId === undefined || partyId === null || partyId === "") {
      setAccount(null);
      setLoading(false);
      setError(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await debtService.getPartyDebtAccountService(partyId);

      // تجاهل نتيجة الطلب القديم
      if (requestId === requestIdRef.current) {
        setAccount(result);
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
  }, [partyId]);

  
  useEffect(() => {
    setAccount(null);
    fetchAccount();

    return () => {
      requestIdRef.current++;
    };
  }, [fetchAccount]);

  return {
    account,

    party: account?.party ?? null,
    debts: account?.debts ?? [],
    balances: account?.balances ?? [],

    loading,
    error,

    refetch: fetchAccount,
  };
}
