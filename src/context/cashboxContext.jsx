import { useCallback, useEffect, useMemo } from "react";
import { useState } from "react";
import { createContext } from "react";
import cashboxService from "../services/cashboxService";

export const CashboxContext = createContext(null);

function CashboxProvider({ children }) {
  const [cashboxs, setCashboxes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setEror] = useState(null);

  // ========= جلب الصناديق من قاعدة البيانات ======== //
  const getCashboxes = useCallback(async () => {
    setLoading(true);
    setEror(null);

    try {
      const request = await cashboxService.getAllCashboxesService();

      setCashboxes(request);

      return request;
    } catch (error) {
      setEror(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCashboxes().catch();
  }, [getCashboxes]);

  // ======== context بيانات ====== //
  const value = useMemo(() => {
    cashboxs, setCashboxes, loading, error, getCashboxes;
  }, [cashboxs, loading, error, getCashboxes]);

  return (
    <CashboxContext.Provider value={value}>{children}</CashboxContext.Provider>
  );
}
export default CashboxProvider