import { useState, useEffect, useCallback, useRef } from "react";
import transferService from "../../services/transferService.js";

const PAGE_SIZE = 10;

export default function useTransfers() {

  // الحوالات الموجودة في الصفحة الحالية فقط
  const [transfers, setTransfers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // =================================
  // حالة Pagination
  // =================================
  const [page, setPage] = useState(1);

  const [totalItems, setTotalItems] = useState(0);

  const pageSize = PAGE_SIZE;

  // عدد الصفحات قيمة مشتقة
  const totalPages = Math.ceil(totalItems / pageSize);

  // منع الطلبات القديمة من تحديث الحالة
  const requestIdRef = useRef(0);

  // آخر فلاتر بحث تم اعتمادها بنجاح
  const activeFiltersRef = useRef({});

  // =================================
  // جلب صفحة محددة
  // =================================
  const fetchPage = useCallback(
    async (filters, requestedPage) => {
      const requestId = ++requestIdRef.current;

      setLoading(true);
      setError(null);

      try {
        // طلب الصفحة من Service
        let result = await transferService.queryTransferService(filters, {
          page: requestedPage,
          pageSize,
        });

        // استخراج العدد الإجمالي
        let resultTotalItems = result.totalItems;

        let actualPage = requestedPage;

        const resultTotalPages = Math.ceil(resultTotalItems / pageSize);

        // معالجة حالة خروج الصفحة المطلوبة عن النطاق
        if (resultTotalPages > 0 && requestedPage > resultTotalPages) {
          actualPage = resultTotalPages;

          result = await transferService.queryTransferService(filters, {
            page: actualPage,
            pageSize,
          });

          resultTotalItems = result.totalItems;
        }


        if (requestId === requestIdRef.current) {
          setTransfers(result.items ?? []);

          setTotalItems(resultTotalItems);

          setPage(resultTotalItems === 0 ? 1 : actualPage);

          // اعتماد الفلاتر بعد نجاح الطلب
          activeFiltersRef.current = filters;
        }

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
    },
    [pageSize]
  );

  // =================================
  // البحث بفلاتر جديدة
  // =================================

  const refetch = useCallback(
    async (filters = {}) => {

      const filtersSnapshot = { ...filters };

      return fetchPage(filtersSnapshot, 1);
    },
    [fetchPage]
  );

  // =================================
  // الانتقال إلى صفحة أخرى
  // =================================
  const goToPage = useCallback(
    (nextPage) => {
      if (!Number.isSafeInteger(nextPage) || nextPage < 1) {
        throw new RangeError("Page must be a valid positive integer.");
      }

      // منع طلب صفحة غير موجودة
      if (totalPages === 0 || nextPage > totalPages) {
        return Promise.resolve(null);
      }

      // استخدام آخر فلاتر بحث تم حفظها
      return fetchPage(activeFiltersRef.current, nextPage);
    },
    [fetchPage, totalPages]
  );

  // =================================
  // الجلب الأولي عند فتح الصفحة
  // =================================
  useEffect(() => {
    refetch().catch(() => {
      // معالجة رفض Promise داخل useEffect
    });

    return () => {
      requestIdRef.current += 1;
    };
  }, [refetch]);


  return {
    transfers,
    loading,
    error,

    page,
    pageSize,
    totalItems,
    totalPages,

    refetch,
    goToPage,
  };
}
