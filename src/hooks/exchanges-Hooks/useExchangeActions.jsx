import { useState, useCallback } from "react";

import {
  createExchangeService,
  updateExchangeService,
  deleteExchangeService,
} from "../../services/exchangeService.js";

import  useCashboxContext  from "../cashbox_Hooks/useCashboxContext.jsx";
import cashboxService from "../../services/cashboxService.js";

export function useExchangeActions() {
  // الوصول إلى حالة الصناديق المشتركة من اجل تحديثها بعد كل عملية
  const { setCashboxes } = useCashboxContext();

  // حالات الانتظار
  const [creating, setCreating] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [deleting, setDeleting] = useState(false);

  // أخطاء العمليات
  const [createError, setCreateError] = useState(null);

  const [updateError, setUpdateError] = useState(null);

  const [deleteError, setDeleteError] = useState(null);

  // حالة خطأ تحديث الصناديق بعد العمليات
  const [cashboxesSyncError, setCashboxesSyncError] = useState(null);

  // إعادة تحديث حالة الصناديق
  const refreshCashboxes = useCallback(async () => {
    try {
      const currentCashboxes = await cashboxService.getAllCashboxesService();

      setCashboxes(currentCashboxes);

      setCashboxesSyncError(null);
    } catch (error) {
      // نمرر الخطا في حال حدث خطأ اثناء تحديث الصناديق
      setCashboxesSyncError(error);
    }
  }, [setCashboxes]);

  // إضافة حركة صرف
  const createExchange = useCallback(
    async (formData) => {
      setCreating(true);
      setCreateError(null);

      try {
        const newExchange = await createExchangeService(formData);

        // نحدّث الصناديق بعد نجاح المعاملة المالية
        await refreshCashboxes();

        return newExchange;
      } catch (error) {
        setCreateError(error);

        throw error;
      } finally {
        setCreating(false);
      }
    },
    [refreshCashboxes]
  );

  // تعديل حركة صرف
  const updateExchange = useCallback(
    async (id, formData) => {
      setUpdating(true);
      setUpdateError(null);

      try {
        const updatedExchange = await updateExchangeService(id, formData);

        await refreshCashboxes();

        return updatedExchange;
      } catch (error) {
        setUpdateError(error);

        throw error;
      } finally {
        setUpdating(false);
      }
    },
    [refreshCashboxes]
  );

  // حذف حركة صرف
  const deleteExchange = useCallback(
    async (id) => {
      setDeleting(true);
      setDeleteError(null);

      try {
        const deletedExchange = await deleteExchangeService(id);

        await refreshCashboxes();

        return deletedExchange;
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
    createExchange,
    updateExchange,
    deleteExchange,

    creating,
    updating,
    deleting,

    createError,
    updateError,
    deleteError,

    cashboxesSyncError,
  };
}
