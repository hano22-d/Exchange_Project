import { useState, useEffect, useCallback, useRef } from "react";
import { queryExchangesService } from "../../services/exchangeService";

const PAGE_SIZE = 10;

function useExchanges() {
  // =================================
  // حالة البيانات
  // =================================

  // تحتوي على حركات الصفحة الحالية فقط
  const [exchanges, setExchanges] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // =================================
  // حالة Pagination
  // =================================

  const [page, setPage] = useState(1);

  const [totalItems, setTotalItems] = useState(0);

  const pageSize = PAGE_SIZE;

  const totalPages = Math.ceil(totalItems / pageSize);

  // =================================
  // المراجع
  // =================================

  // منع نتائج الطلبات القديمة من الكتابة
  const requestIdRef = useRef(0);

  // الاحتفاظ بآخر فلاتر تم اعتمادها للبحث
  const activeFiltersRef = useRef({});

  // =================================
  // دالة جلب صفحة محددة
  // =================================

  const fetchPage = useCallback(
    async (filters, requestedPage) => {
      const requestId = ++requestIdRef.current;

      setLoading(true);
      setError(null);

      try {
        // طلب الصفحة من Service
        let result = await queryExchangesService(filters, {
          page: requestedPage,
          pageSize,
        });

        // استخراج العدد الإجمالي
        let resultTotalItems = result.totalItems;

        let actualPage = requestedPage;

        const resultTotalPages = Math.ceil(resultTotalItems / pageSize);

        // معالجة حالة أصبحت فيها الصفحة المطلوبة
        // خارج نطاق الصفحات بسبب حذف بعض الحركات
        if (resultTotalPages > 0 && requestedPage > resultTotalPages) {
          actualPage = resultTotalPages;

          result = await queryExchangesService(filters, {
            page: actualPage,
            pageSize,
          });

          resultTotalItems = result.totalItems;
        }

        if (requestId === requestIdRef.current) {
          setExchanges(result.items ?? []);

          setTotalItems(resultTotalItems);

          setPage(resultTotalItems === 0 ? 1 : actualPage);
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
      // حفظ نسخة من فلاتر البحث المعتمدة
      const filtersSnapshot = { ...filters };

      activeFiltersRef.current = filtersSnapshot;

      // البدء من الصفحة الاولى عند البحث بفلاتر جديدة
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

      // لا نسمح بطلب صفحة خارج النطاق الحالي
      if (totalPages > 0 && nextPage > totalPages) {
        return Promise.resolve(null);
      }

      // نستخدم آخر فلاتر بحث معتمدة
      return fetchPage(activeFiltersRef.current, nextPage);
    },
    [fetchPage, totalPages]
  );

  // =================================
  // الجلب الأولي عند فتح الصفحة
  // =================================

  useEffect(() => {
    refetch().catch(() => {
      // منع رفض Promise غير المعالج داخل useEffect
    });

    return () => {
      requestIdRef.current += 1;
    };
  }, [refetch]);

  return {
    exchanges,
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

export default useExchanges;
