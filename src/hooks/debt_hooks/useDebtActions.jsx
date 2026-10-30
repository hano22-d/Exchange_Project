import { useState, useCallback } from "react";
import useCashboxContext from "../cashbox_Hooks/useCashboxContext.jsx";
import cashboxService from "../../services/cashboxService.js";
import debtService from "../../services/debtService.js";


export default function useDebtActions() {
  const { setCashboxes } = useCashboxContext();

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [createError, setCreateError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const [cashboxesSyncError, setCashboxesSyncError] = useState(null);

  // تحديث الصناديق النقدية في Context
  const refreshCashboxes = useCallback(async () => {
    try {
      const currentCashboxes = await cashboxService.getAllCashboxesService();

      setCashboxes(currentCashboxes);
      setCashboxesSyncError(null);

      return true;
    } catch (error) {
      setCashboxesSyncError(error);
      return false;
    }
  }, [setCashboxes]);

  // إضافة حركة دين
  const createDebt = useCallback(
    async (formData) => {
      setCreating(true);
      setCreateError(null);

      try {
        const result = await debtService.addDebtService(formData);

        await refreshCashboxes();

        return result;
      } catch (error) {
        setCreateError(error);
        return null;
      } finally {
        setCreating(false);
      }
    },
    [refreshCashboxes]
  );

  // تعديل حركة دين
  const updateDebt = useCallback(
    async (id, formData) => {
      setUpdating(true);
      setUpdateError(null);

      try {
        const result = await debtService.updateDebtService(id, formData);

        await refreshCashboxes();

        return result;
      } catch (error) {
        setUpdateError(error);
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [refreshCashboxes]
  );

  // حذف حركة دين
  const deleteDebt = useCallback(
    async (id) => {
      setDeleting(true);
      setDeleteError(null);

      try {
        const result = await debtService.deleteDebtService(id);

        await refreshCashboxes();

        return result;
      } catch (error) {
        setDeleteError(error);
        return null;
      } finally {
        setDeleting(false);
      }
    },
    [refreshCashboxes]
  );

  return {
    createDebt,
    updateDebt,
    deleteDebt,

    creating,
    updating,
    deleting,

    createError,
    updateError,
    deleteError,

    cashboxesSyncError,
  };
}
