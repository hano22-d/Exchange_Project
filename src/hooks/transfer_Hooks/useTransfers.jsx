import { useCallback, useEffect, useRef, useState } from "react";
import transferService from "../../services/transferService.js";

export default function useTransfers(filters = {}) {
  //استخراج قيم الفلاتر
  const dateFrom = filters?.dateFrom ?? "";
  const dateTo = filters?.dateTo ?? "";
  const fullName =
    typeof filters?.fullName === "string" ? filters.fullName.trim() : "";

  const currency =
    typeof filters?.currency === "string"
      ? filters.currency.trim().toUpperCase()
      : "";

  const direction =
    typeof filters?.direction === "string" ? filters.direction.trim() : "";

  const note = typeof filters?.note === "string" ? filters.note.trim() : "";

  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // رقم لكل طلب حتى نتجاهل نتائج الطلبات القديمة
  const requestIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const result = await transferService.queryTransferService({
        dateFrom,
        dateTo,
        fullName,
        currency,

        direction,

        note,
      });

      // لا نحدّث الحالة بنتيجة طلب قديم
      if (requestId === requestIdRef.current) {
        setTransfers(result);
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
  }, [dateFrom, dateTo, fullName, currency, direction, note]);

  useEffect(() => {
    refetch().catch(() => {
      // لعدم بقاء وعد غير معالج
    });

    return () => {
      // إبطال الطلب السابق عند تغيير الفلاتر
      requestIdRef.current += 1;
    };
  }, [refetch]);

  return {
    transfers,
    loading,
    error,
    refetch,
  };
}
