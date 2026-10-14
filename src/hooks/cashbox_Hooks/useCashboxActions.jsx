import { useCallback, useState } from "react";
import useCashboxContext from "./useCashboxContext";
import cashboxService from "../../services/cashboxService";

function useCashboxActions() {
  const { setCashboxes } = useCashboxContext();

  // ===== حالات الإضافة ===== //
  const [adding, setAdding] = useState(false);
  const [addError, setAddErroe] = useState(null);

  // ====== حالات التعديل ====== //
  const [updatingCurrency, setUpdatingCurrency] = useState(null);
  const [updatingError, setUpdatingError] = useState(null);

  // ====== دالة الإضافة ===== //
  const addCshbox = useCallback(
    async (cashbox) => {
      setAdding(true);
      setAddErroe(null);

      try {
        const newCashbox = await cashboxService.addCashboxService(cashbox);

        setCashboxes((previousCashboxes) => [...previousCashboxes, newCashbox]);
      } catch (error) {
        setAddErroe(error);
        throw error;
      } finally {
        setAdding(false);
      }
    },
    [setCashboxes]
  );

  // ===== دالة التعديل ===== //
  const updateCashboxStatus = useCallback(
    async (currency, nextActive) => {
      setUpdatingCurrency(currency);
      setUpdatingError(null);

      try {
        const updatingCashbox = await cashboxService.setCashboxActiveService(
          currency,
          nextActive
        );

        setCashboxes((previousCashboxes) =>
          previousCashboxes.map((casbox) => {
            return casbox.currency === currency ? updatingCashbox : casbox;
          })
        );
      } catch (error) {
        setUpdatingError(error);
        throw error;
      } finally {
        setUpdatingCurrency(null);
      }
    },
    [setCashboxes]
  );

  return {
    addCshbox,
    adding,
    addError,

    updateCashboxStatus,
    updatingCurrency,
    updatingError
  }
}
export default useCashboxActions