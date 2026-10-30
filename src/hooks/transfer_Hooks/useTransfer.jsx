import { useCallback, useEffect, useRef, useState } from "react";
import transferService from "../../services/transferService.js";

export default function useTransfer(id) {
  const transferId =
    id === undefined || id === null || id === "" ? null : Number(id);

  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (transferId === null || transferId === undefined || transferId === "") {
      setTransfer(null);
      setLoading(false);
      setError(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await transferService.getTransferByIdService(transferId);

      if (requestId === requestIdRef.current) {
        setTransfer(result);
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
  }, [transferId]);

  useEffect(() => {
    refetch().catch(() => {
      // لعدم بقاء وعد غير معالج
    });

    return () => {
      requestIdRef.current += 1;
    };
  }, [refetch]);

  //  لتحديث تفاصيل الصفحة بعد نجاح التعديل
  const setTransferData = useCallback((updatedTransfer) => {
    if (updatedTransfer !== null && updatedTransfer.id !== transferId) {
      throw new Error("The exchange ID does not match the current record")
    }
    setTransfer(updatedTransfer)
    
  }, [transferId]);

  return {
    transfer,
    loading,
    error,
    refetch,
    setTransferData,
  };
}
