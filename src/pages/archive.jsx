import { Box, Typography, Button, Divider } from "@mui/material";
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
import useExchanges from "../hooks/exchanges-Hooks/useExchanges";

export default function Archive() {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const text = "black";
  const darkBackground = "#232323";
  const fontFamily = "'Alyamama', sans-serif";

  const [activeFilter, setActiveFilter] = useState("exchange");
  const [exchangeFilters, setExchangeFilters] = useState({
    dateFrom: "",
    dateTo: "",
    fromCurrency: "",
    toCurrency: "",
    note: "",
  });

  const [transferFilters, setTransferFilters] = useState({
    dateFrom: "",
    dateTo: "",
    fullname: "",
    direction: "",
    currency: "",
    note: "",
  });

  //services
  const { exchanges, loading, refetch } = useExchanges();

  return (
    <Box sx={{ p: 4 }}>
      {/* شريط علوي */}
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
          <MdInventory2 style={{ fontSize: 40, color: primary }} />
          <Box>
            <Typography
              sx={{ fontSize: 30, fontFamily: fontFamily, color: secondary }}
            >
              أرشيف العمليات
            </Typography>
            <Typography
              sx={{ fontSize: 15, fontFamily: fontFamily, color: secondary }}
            >
              عرض وبحث متقدم في سجلات عمليات الصرف والحوالات المالية
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          sx={{
            alignSelf: "center",
            fontFamily: fontFamily,
            backgroundColor: primary,
            color: text,
            padding: "7px 15px",
            fontWeight: "bold",
            "&:hover": { backgroundColor: primary },
          }}
        >
          إضافة عملية جديدة
        </Button>
      </Box>

      {/* الفلاتر */}
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
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MdTune style={{ fontSize: 20, color: primary }} />
            <Typography sx={{ fontFamily: fontFamily, color: secondary }}>
              فلاتر البحث والمطابقة
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => {
              if (activeFilter === "exchange") {
                setExchangeFilters({
                  dateFrom: "",
                  dateTo: "",
                  fromCurrency: "",
                  toCurrency: "",
                  note: "",
                });

                refetch(exchangeFilters).catch(console.error);
              } else if (activeFilter === "transfers") {
                setTransferFilters({
                  dateFrom: "",
                  dateTo: "",
                  fullName: "",
                  direction: "",
                  currency: "",
                  note: "",
                });
              }
            }}
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
            <MdRestartAlt style={{ fontSize: 25, padding: 1 }} />
            <Typography sx={{ fontFamily: fontFamily, alignSelf: "end" }}>
              إعادة ضبط الفلاتر
            </Typography>
          </Button>
        </Box>
        <Divider sx={{ backgroundColor: primary, mb: 2 }} />

        <Box className="filterBox" sx={{ alignSelf: "center" }}>
          <Box
            className={`filterAndIcon ${
              activeFilter === "exchange" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("exchange")}
          >
            <MdCurrencyExchange className="icon" />
            <Box className={`filter`}>الصرف</Box>
          </Box>
          <Box
            className={`filterAndIcon ${
              activeFilter === "transfers" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("transfers")}
          >
            <FaMoneyBillTransfer className="icon" />
            <Box className={`filter`}>الحوالات</Box>
          </Box>
        </Box>
        {activeFilter === "exchange" && (
          <>
            <ExFilter
              filters={exchangeFilters}
              onChange={setExchangeFilters}
              onSearch={() => refetch(exchangeFilters)}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 4 }}>
              <Typography
                sx={{ fontFamily: fontFamily, fontSize: 22, color: secondary }}
              >
                عدد النتائج المطابقة:
              </Typography>
              <Typography
                sx={{
                  fontFamily: fontFamily,
                  fontSize: 16,
                  fontWeight: 700,
                  color: text,
                  backgroundColor: primary,
                  borderRadius: 3,
                  p: "6px 14px",
                }}
              >
                {exchanges.length}
              </Typography>
            </Box>

            <Box
              sx={{
                backgroundColor: darkBackground,
                border: `1px solid ${primary}`,
                borderRadius: 2,
                overflow: "hidden",
                p: 2,
              }}
            >
              <ExchangeList exchanges={exchanges} loading={loading} />
            </Box>
          </>
        )}

        {activeFilter === "transfers" && <TrFilter />}
      </Box>
    </Box>
  );
}
