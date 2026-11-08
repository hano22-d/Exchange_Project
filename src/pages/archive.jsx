import { Box, Typography, Button, Divider, Pagination } from "@mui/material";
import "../styles/operations.css";

import {
  MdCurrencyExchange,
  MdInventory2,
  MdRestartAlt,
  MdTune,
} from "react-icons/md";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { useState } from "react";

import TrFilter from "../featuers/archive/transfers_filter_archives";
import ExFilter from "../featuers/archive/exchange_filter_archive";
import ExchangeList from "../featuers/archive/exchangeList";
import TransferList from "../featuers/archive/transferList";
import useExchanges from "../hooks/exchanges-Hooks/useExchanges";
import useTransfers from "../hooks/transfer_Hooks/useTransfers";

// =================================
// الفلاتر الابتدائية
// =================================
const EMPTY_EXCHANGE_FILTERS = {
  dateFrom: "",
  dateTo: "",
  fromCurrency: "",
  toCurrency: "",
  note: "",
};

const EMPTY_TRANSFER_FILTERS = {
  dateFrom: "",
  dateTo: "",
  fullname: "",
  direction: "",
  currency: "",
  note: "",
  destination: "",
};

export default function Archive() {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const text = "black";
  const darkBackground = "#232323";
  const fontFamily = "'Alyamama', sans-serif";

  const [activeFilter, setActiveFilter] = useState("exchange");

  const [exchangeFilters, setExchangeFilters] = useState({
    ...EMPTY_EXCHANGE_FILTERS,
  });

  const [transferFilters, setTransferFilters] = useState({
    ...EMPTY_TRANSFER_FILTERS,
  });

  // =================================
  // services
  // =================================

  // exchange
  const {
    exchanges,
    loading: exchangeLoading,
    error: exchangeError,

    page: exchangePage,
    pageSize: exchangePageSize,
    totalItems: exchangeTotalItems,
    totalPages: exchangeTotalPages,

    refetch: refetchExchanges,
    goToPage: goToExchangePage,
  } = useExchanges();

  // transfer
  const {
    transfers,
    loading: transferLoading,
    error: transferError,

    page: transferPage,
    pageSize: transferPageSize,
    totalItems: transferTotalItems,
    totalPages: transferTotalPages,

    refetch: refetchTransfers,
    goToPage: goToTransferPage,
  } = useTransfers();

  // =================================
  // functions
  // =================================

  // دالة البحث في حركات الصرف
  function handleExchangeSearch() {
    refetchExchanges(exchangeFilters).catch((error) => {
      console.error("فشل البحث عن حركات الصرف:", error);
    });
  }

  // دالة البحث في الحوالات
  function handleTransferSearch() {
    refetchTransfers(transferFilters).catch((error) => {
      console.error("فشل البحث عن الحوالات:", error);
    });
  }

  // دالة إعادة ضبط الفلاتر
  function handleResetFilters() {
    if (activeFilter === "exchange") {
      const clearedFilters = {
        ...EMPTY_EXCHANGE_FILTERS,
      };

      setExchangeFilters(clearedFilters);

      refetchExchanges(clearedFilters).catch((error) => {
        console.error("فشل إعادة جلب حركات الصرف:", error);
      });
    } else {
      const clearedFilters = {
        ...EMPTY_TRANSFER_FILTERS,
      };

      setTransferFilters(clearedFilters);

      refetchTransfers(clearedFilters).catch((error) => {
        console.error("فشل إعادة جلب الحوالات:", error);
      });
    }
  }

  // اختيار دالة الانتقال للقسم النشط
  function handlePageChange(event, nextPage) {
    const goToPage =
      activeFilter === "exchange" ? goToExchangePage : goToTransferPage;

    goToPage(nextPage).catch((error) => {
      console.error("فشل الانتقال إلى الصفحة:", error);
    });
  }

  // =================================
  // معلومات Pagination
  // =================================
  const activePagination =
    activeFilter === "exchange"
      ? {
          page: exchangePage,
          pageSize: exchangePageSize,
          totalItems: exchangeTotalItems,
          totalPages: exchangeTotalPages,
          loading: exchangeLoading,
        }
      : {
          page: transferPage,
          pageSize: transferPageSize,
          totalItems: transferTotalItems,
          totalPages: transferTotalPages,
          loading: transferLoading,
        };

  const {
    page: activePage,
    pageSize: activePageSize,
    totalItems: activeTotalItems,
    totalPages: activeTotalPages,
    loading: activeLoading,
  } = activePagination;

  // =================================
  // نطاق العناصر المعروضة
  // =================================
  const firstVisibleItem =
    activeTotalItems === 0 ? 0 : (activePage - 1) * activePageSize + 1;

  const lastVisibleItem = Math.min(
    activePage * activePageSize,
    activeTotalItems
  );

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: darkBackground,
          border: `1px solid ${primary}`,
          borderRadius: 5,
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <MdInventory2
            style={{
              fontSize: 40,
              color: primary,
            }}
          />

          <Box>
            <Typography
              sx={{
                fontSize: 30,
                fontFamily,
                color: secondary,
              }}
            >
              أرشيف العمليات
            </Typography>

            <Typography
              sx={{
                fontSize: 15,
                fontFamily,
                color: secondary,
              }}
            >
              عرض وبحث متقدم في سجلات عمليات الصرف والحوالات المالية
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          sx={{
            alignSelf: "center",
            fontFamily,
            backgroundColor: primary,
            color: text,
            padding: "7px 15px",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: primary,
            },
          }}
        >
          إضافة عملية جديدة
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: darkBackground,
          border: `1px solid ${primary}`,
          borderRadius: 2,
          p: 2,
          mt: 4,
        }}
      >
        {/* عنوان الفلاتر وزر إعادة الضبط */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MdTune
              style={{
                fontSize: 20,
                color: primary,
              }}
            />

            <Typography
              sx={{
                fontFamily,
                color: secondary,
              }}
            >
              فلاتر البحث والمطابقة
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={handleResetFilters}
            sx={{
              color: primary,
              fontFamily,
              borderColor: primary,
              gap: 0.5,

              "&:hover": {
                backgroundColor: "rgba(250, 229, 110, 0.16)",
                borderColor: primary,
              },
            }}
          >
            <MdRestartAlt
              style={{
                fontSize: 25,
                padding: 1,
              }}
            />

            <Typography
              sx={{
                fontFamily,
                alignSelf: "end",
              }}
            >
              إعادة ضبط الفلاتر
            </Typography>
          </Button>
        </Box>

        <Divider
          sx={{
            backgroundColor: primary,
            mb: 2,
          }}
        />

        {/*التبديل بين القسمين*/}
        <Box
          className="filterBox"
          sx={{
            alignSelf: "center",
          }}
        >
          <Box
            className={`filterAndIcon ${
              activeFilter === "exchange" ? "active" : ""
            }`}
            onClick={() => {setActiveFilter("exchange")
            }}
          >
            <MdCurrencyExchange className="icon" />
            <Box className="filter">الصرف</Box>
          </Box>

          <Box
            className={`filterAndIcon ${
              activeFilter === "transfers" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("transfers")}
          >
            <FaMoneyBillTransfer className="icon" />
            <Box className="filter">الحوالات</Box>
          </Box>
        </Box>

        {/* قسم الصرف*/}
        {activeFilter === "exchange" && (
          <>
            <ExFilter
              filters={exchangeFilters}
              onChange={setExchangeFilters}
              onSearch={handleExchangeSearch}
            />

            {/* العدد الإجمالي */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                my: 4,
              }}
            >
              <Typography
                sx={{
                  fontFamily,
                  fontSize: 22,
                  color: secondary,
                }}
              >
                عدد النتائج المطابقة:
              </Typography>

              <Typography
                sx={{
                  fontFamily,
                  fontSize: 16,
                  fontWeight: 700,
                  color: text,
                  backgroundColor: primary,
                  borderRadius: 3,
                  p: "6px 14px",
                }}
              >
                {exchangeTotalItems}
              </Typography>
            </Box>

            {/* جدول حركات الصرف */}
            <Box
              sx={{
                backgroundColor: darkBackground,
                border: `1px solid ${primary}`,
                borderRadius: 2,
                overflow: "hidden",
                p: 2,
              }}
            >
              <ExchangeList exchanges={exchanges} loading={exchangeLoading} />
            </Box>

            {exchangeError && (
              <Typography color="error" sx={{ mt: 2, fontFamily }}>
                {exchangeError.message || "حدث خطأ أثناء جلب حركات الصرف"}
              </Typography>
            )}
          </>
        )}

        {/* قسم الحوالات */}
        {activeFilter === "transfers" && (
          <>
            <TrFilter
              filters={transferFilters}
              onChange={setTransferFilters}
              onSearch={handleTransferSearch}
            />

            {/* العدد الإجمالي */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                my: 4,
              }}
            >
              <Typography
                sx={{
                  fontFamily,
                  fontSize: 22,
                  color: secondary,
                }}
              >
                عدد النتائج المطابقة:
              </Typography>

              <Typography
                sx={{
                  fontFamily,
                  fontSize: 16,
                  fontWeight: 700,
                  color: text,
                  backgroundColor: primary,
                  borderRadius: 3,
                  p: "6px 14px",
                }}
              >
                {transferTotalItems}
              </Typography>
            </Box>

            {/* جدول الحوالات */}

            <Box
              sx={{
                backgroundColor: darkBackground,
                border: `1px solid ${primary}`,
                borderRadius: 2,
                overflow: "hidden",
                p: 2,
              }}
            >
              <TransferList transfers={transfers} loading={transferLoading} />
            </Box>

            {transferError && (
              <Typography color="error" sx={{ mt: 2, fontFamily }}>
                {transferError.message || "حدث خطأ أثناء جلب الحوالات"}
              </Typography>
            )}
          </>
        )}

        {/* pagination */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: darkBackground,
            border: `1px solid ${primary}`,
            borderRadius: 2,
            p: 2,
            mt: 3,
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {activeTotalPages > 1 && (
            <Pagination
              count={activeTotalPages}
              page={activePage}
              onChange={handlePageChange}
              disabled={activeLoading}
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: secondary,
                  fontFamily,
                  borderColor: "rgba(250, 229, 110, 0.4)",
                  margin: "0 3px",
                },

                "& .MuiPaginationItem-root.Mui-selected": {
                  backgroundColor: primary,
                  color: text,
                  fontWeight: "bold",
                  borderColor: primary,
                  transform: "scale(1.08)",
                },

                "& .MuiPaginationItem-root.Mui-selected:hover": {
                  backgroundColor: primary,
                },
              }}
            />
          )}

          <Typography
            sx={{
              color: secondary,
              fontFamily,
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            {activeTotalItems > 0
              ? `عرض ${firstVisibleItem}–${lastVisibleItem} من ${activeTotalItems}`
              : "لا توجد نتائج"}
          </Typography>
        </Box>
      </Box>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      </Box>
    </Box>
  );
}
