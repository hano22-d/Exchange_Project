import { useCallback, useState } from "react";
import useCashboxContext from "../cashbox_Hooks/useCashboxContext";
import cashboxService from "../../services/cashboxService";
import electronicWalletService from "../../services/electronicWalletService";

export function useElectronicWalletActions() {
  // الوصول إلى حالة الصناديق النقدية المشتركة
  const { setCashboxes } = useCashboxContext();

  // =================================
  // حالات الانتظار
  // =================================

  const [creatingWallet, setCreatingWallet] = useState(false);
  const [updatingWallet, setUpdatingWallet] = useState(false);
  const [updatingWalletStatus, setUpdatingWalletStatus] = useState(false);
  const [addingCurrency, setAddingCurrency] = useState(false);

  const [creatingOperation, setCreatingOperation] = useState(false);
  const [updatingOperation, setUpdatingOperation] = useState(false);
  const [deletingOperation, setDeletingOperation] = useState(false);

  // =================================
  // حالات الأخطاء
  // =================================

  const [walletCreateError, setWalletCreateError] = useState(null);
  const [walletUpdateError, setWalletUpdateError] = useState(null);
  const [walletStatusError, setWalletStatusError] = useState(null);
  const [currencyAddError, setCurrencyAddError] = useState(null);

  const [operationCreateError, setOperationCreateError] = useState(null);
  const [operationUpdateError, setOperationUpdateError] = useState(null);
  const [operationDeleteError, setOperationDeleteError] = useState(null);

  const [cashboxesSyncError, setCashboxesSyncError] = useState(null);

  // =================================
  // تحديث الصناديق النقدية في Context
  // =================================

  const refreshCashboxes = useCallback(async () => {
    try {
      const currentCashboxes = await cashboxService.getAllCashboxesService();

      setCashboxes(currentCashboxes);
      setCashboxesSyncError(null);

      return true;
    } catch (error) {
      // العملية المالية قد تكون نجحت بالفعل في IndexedDB.
      // هذا الخطأ يخص تحديث الحالة المحلية للصناديق فقط.
      setCashboxesSyncError(error);

      return false;
    }
  }, [setCashboxes]);

  // =================================
  // إنشاء محفظة
  // =================================

  const createWallet = useCallback(async (formData) => {
    setCreatingWallet(true);
    setWalletCreateError(null);

    try {
      return await electronicWalletService.addWalletService(formData);
    } catch (error) {
      setWalletCreateError(error);
      throw error;
    } finally {
      setCreatingWallet(false);
    }
  }, []);

  // =================================
  // تعديل بيانات محفظة
  // =================================

  const updateWallet = useCallback(async (walletId, formData) => {
    setUpdatingWallet(true);
    setWalletUpdateError(null);

    try {
      return await electronicWalletService.updateWalletService(
        walletId,
        formData
      );
    } catch (error) {
      setWalletUpdateError(error);
      throw error;
    } finally {
      setUpdatingWallet(false);
    }
  }, []);

  // =================================
  // تفعيل أو تعطيل محفظة
  // =================================

  const setWalletActive = useCallback(async (walletId, active) => {
    setUpdatingWalletStatus(true);
    setWalletStatusError(null);

    try {
      return await electronicWalletService.setWalletActiveService(
        walletId,
        active
      );
    } catch (error) {
      setWalletStatusError(error);
      throw error;
    } finally {
      setUpdatingWalletStatus(false);
    }
  }, []);

  // =================================
  // إضافة عملة إلى محفظة
  // =================================

  const addWalletCurrency = useCallback(async (walletId, formData) => {
    setAddingCurrency(true);
    setCurrencyAddError(null);

    try {
      return await electronicWalletService.addWalletCurrencyService(
        walletId,
        formData
      );
    } catch (error) {
      setCurrencyAddError(error);
      throw error;
    } finally {
      setAddingCurrency(false);
    }
  }, []);

  // =================================
  // إنشاء عملية مالية
  // =================================

  const createOperation = useCallback(
    async (
      serviceMethod,
      walletId,
      formData,
      shouldRefreshCashboxes = false
    ) => {
      setCreatingOperation(true);
      setOperationCreateError(null);
      setCashboxesSyncError(null);

      try {
        const result = await serviceMethod(walletId, formData);

        // السحب والإيداع يؤثران في الصناديق النقدية.
        // الحركات الخارجية والتسوية لا تؤثر فيها.
        if (shouldRefreshCashboxes) {
          await refreshCashboxes();
        }

        return result;
      } catch (error) {
        setOperationCreateError(error);
        throw error;
      } finally {
        setCreatingOperation(false);
      }
    },
    [refreshCashboxes]
  );

  // السحب
  const createWithdrawal = useCallback(
    (walletId, formData) =>
      createOperation(
        electronicWalletService.createWithdrawalService,
        walletId,
        formData,
        true
      ),
    [createOperation]
  );

  // الإيداع
  const createDeposit = useCallback(
    (walletId, formData) =>
      createOperation(
        electronicWalletService.createDepositService,
        walletId,
        formData,
        true
      ),
    [createOperation]
  );

  // حركة واردة خارجية
  const createExternalIn = useCallback(
    (walletId, formData) =>
      createOperation(
        electronicWalletService.createExternalInService,
        walletId,
        formData
      ),
    [createOperation]
  );

  // حركة صادرة خارجية
  const createExternalOut = useCallback(
    (walletId, formData) =>
      createOperation(
        electronicWalletService.createExternalOutService,
        walletId,
        formData
      ),
    [createOperation]
  );

  // التسوية
  const createWalletAdjustment = useCallback(
    (walletId, formData) =>
      createOperation(
        electronicWalletService.createWalletAdjustmentService,
        walletId,
        formData
      ),
    [createOperation]
  );

  // =================================
  // تعديل عملية قديمة
  // =================================

  const updateWalletOperation = useCallback(
    async (walletId, operationId, formData) => {
      setUpdatingOperation(true);
      setOperationUpdateError(null);
      setCashboxesSyncError(null);

      try {
        const result =
          await electronicWalletService.updateWalletOperationService(
            walletId,
            operationId,
            formData
          );

        // قد تكون العملية القديمة أو الجديدة سحبًا أو إيداعًا،
        // لذلك نعيد جلب الصناديق بعد أي تعديل.
        await refreshCashboxes();

        return result;
      } catch (error) {
        setOperationUpdateError(error);
        throw error;
      } finally {
        setUpdatingOperation(false);
      }
    },
    [refreshCashboxes]
  );

  // =================================
  // حذف عملية قديمة
  // =================================

  const deleteWalletOperation = useCallback(
    async (walletId, operationId) => {
      setDeletingOperation(true);
      setOperationDeleteError(null);
      setCashboxesSyncError(null);

      try {
        const result =
          await electronicWalletService.deleteWalletOperationService(
            walletId,
            operationId
          );

        // قد يكون للعملية المحذوفة أثر على الصندوق النقدي.
        await refreshCashboxes();

        return result;
      } catch (error) {
        setOperationDeleteError(error);
        throw error;
      } finally {
        setDeletingOperation(false);
      }
    },
    [refreshCashboxes]
  );

  // =================================
  // الواجهة العامة للـ Hook
  // =================================

  return {
    // إدارة المحافظ
    createWallet,
    updateWallet,
    setWalletActive,

    creatingWallet,
    updatingWallet,
    updatingWalletStatus,

    walletCreateError,
    walletUpdateError,
    walletStatusError,

    // إدارة العملات
    addWalletCurrency,
    addingCurrency,
    currencyAddError,

    // إنشاء العمليات
    createWithdrawal,
    createDeposit,
    createExternalIn,
    createExternalOut,
    createWalletAdjustment,

    creatingOperation,
    operationCreateError,

    // تعديل وحذف العمليات
    updateWalletOperation,
    deleteWalletOperation,

    updatingOperation,
    deletingOperation,

    operationUpdateError,
    operationDeleteError,

    // مزامنة حالة الصناديق
    cashboxesSyncError,
  };
}

export default useElectronicWalletActions;
