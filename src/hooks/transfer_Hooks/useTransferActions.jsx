import { useState, useCallback } from "react";
import useCashboxContext from "../../hooks/cashbox_Hooks/useCashboxContext.jsx";
import cashboxService from "../../services/cashboxService.js";
import transferService from "../../services/transferService.js";

export function useTransferActions() {
  // الوصول إلى حالة الصناديق المشتركة لتحديثها بعد كل عملية
  const { setCashboxes } = useCashboxContext();

  // حالات الانتظار
  const [creating, setCreating] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [deleting, setDeleting] = useState(false);

  // أخطاء العمليات
  const [createError, setCreateError] = useState(null);

  const [updateError, setUpdateError] = useState(null);

  const [deleteError, setDeleteError] = useState(null);

  // خطأ تحديث حالة الصناديق بعد العمليات
  const [cashboxesSyncError, setCashboxesSyncError] = useState(null);

  // إعادة تحديث حالة الصناديق
  const refreshCashboxes = useCallback(async () => {
    try {
      const currentCashboxes = await cashboxService.getAllCashboxesService();

      setCashboxes(currentCashboxes);

      setCashboxesSyncError(null);
    } catch (error) {
      // فشل تحديث الحالة المحلية للصناديق
      setCashboxesSyncError(error);
    }
  }, [setCashboxes]);

  // إضافة حوالة
  const createTransfer = useCallback(
    async (formData) => {
      setCreating(true);
      setCreateError(null);

      try {
        const newTransfer = await transferService.addTransferService(formData);

        // تحديث الصناديق بعد نجاح العملية المالية
        await refreshCashboxes();

        return newTransfer;
      } catch (error) {
        setCreateError(error);

        throw error;
      } finally {
        setCreating(false);
      }
    },
    [refreshCashboxes]
  );

  // تعديل حوالة
  const updateTransfer = useCallback(
    async (id, formData) => {
      setUpdating(true);
      setUpdateError(null);

      try {
        const updatedTransfer = await transferService.updateTransferService(
          id,
          formData
        );

        await refreshCashboxes();

        return updatedTransfer;
      } catch (error) {
        setUpdateError(error);

        throw error;
      } finally {
        setUpdating(false);
      }
    },
    [refreshCashboxes]
  );

  // حذف حوالة
  const deleteTransfer = useCallback(
    async (id) => {
      setDeleting(true);
      setDeleteError(null);

      try {
        const deletedTransfer = await transferService.deleteTransferService(id);

        await refreshCashboxes();

        return deletedTransfer;
      } catch (error) {
        setDeleteError(error);

        throw error;
      } finally {
        setDeleting(false);
      }
    },
    [refreshCashboxes]
  );

  return {
    createTransfer,
    updateTransfer,
    deleteTransfer,

    creating,
    updating,
    deleting,

    createError,
    updateError,
    deleteError,

    cashboxesSyncError,
  };
}
