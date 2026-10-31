import { Box, Typography, Button, Divider } from "@mui/material";
import "../styles/operations.css";
import {
  MdCurrencyExchange,
  MdInventory2,
  MdRestartAlt,
  MdTune,
  MdVisibility,
} from "react-icons/md";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FaLayerGroup } from "react-icons/fa";
import { useState } from "react";
import TrFilter from "../featuers/archive/transfers_filter_archives";
import ExFilter from "../featuers/archive/exchange_filter_archive";

export default function Archive() {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const text = "black";
  const darkBackground = "#232323";
  const fontFamily = "'Alyamama', sans-serif";

  const [activeFilter, setActiveFilter] = useState("all");
  const [exchangeFilters, setExchangeFilters] = useState({
    dateFrom: "",
    dateTo: "",
    currencyFrom: "",
    currencyTo: "",
    note: "",
  });

  const [transferFilters, setTransferFilters] = useState({
    dateFrom: "",
    dateTo: "",
    fullName: "",
    direction: "",
    currency: "",
    note: "",
  });

  const [exchangeResetKey, setExchangeResetKey] = useState(0);
  const [transferResetKey, setTransferResetKey] = useState(0);

  const operationsData = [
    {
      id: 1,
      type: "صرف",
      typeKey: "exchange",
      date: "28/10/2026 - 10:35",
      details: "100 USD → 1,350,000 SYP",
      party: "—",
      note: "شراء دولار - زبون محلي",
    },
    {
      id: 2,
      type: "حوالة (صادرة)",
      typeKey: "transfers",
      date: "28/10/2026 - 11:15",
      details: "1,000 USD",
      party: "—",
      note: "حوالة عائلية إرسال",
    },
    {
      id: 3,
      type: "صرف",
      typeKey: "exchange",
      date: "27/10/2026 - 12:50",
      details: "500 EUR → 540 USD",
      party: "—",
      note: "صرف يورو إلى دولار",
    },
    {
      id: 4,
      type: "حوالة (واردة)",
      typeKey: "transfers",
      date: "26/10/2026 - 16:20",
      details: "10,000 TRY",
      party: "—",
      note: "استلام دفعة بضاعة",
    },
    {
      id: 5,
      type: "صرف",
      typeKey: "exchange",
      date: "26/10/2026 - 14:10",
      details: "2,000 USD → 27,000,000 SYP",
      party: "—",
      note: "مقبوضات ليرة سورية",
    },
    {
      id: 6,
      type: "حوالة (صادرة)",
      typeKey: "transfers",
      date: "25/10/2026 - 09:45",
      details: "2,500 USD",
      party: "—",
      note: "حوالة تجارية",
    },
  ];

  const filteredData = operationsData.filter((item) => {
    if (activeFilter === "all") return true;

    if (activeFilter === "exchange") {
      if (
        exchangeFilters.currencyFrom &&
        !item.details.includes(exchangeFilters.currencyFrom)
      ) {
        return false;
      }

      if (
        exchangeFilters.currencyTo &&
        !item.details.includes(exchangeFilters.currencyTo)
      ) {
        return false;
      }

      const [datePart, timePart] = item.date.split(" - ");

      const [day, month, year] = datePart.split("/");
      const [hours, minutes] = timePart.split(":");

      const operationDate = new Date(year, month - 1, day, hours, minutes);

      if (
        exchangeFilters.dateFrom &&
        operationDate < new Date(exchangeFilters.dateFrom)
      ) {
        return false;
      }

      if (
        exchangeFilters.dateTo &&
        operationDate > new Date(exchangeFilters.dateTo)
      ) {
        return false;
      }
      if (
        exchangeFilters.note &&
        !item.note.toLowerCase().includes(exchangeFilters.note.toLowerCase())
      ) {
        return false;
      }
    }
    if (activeFilter === "transfers") {
      if (
        transferFilters.currency &&
        !item.details.includes(transferFilters.currency)
      ) {
        return false;
      }
      if (
        transferFilters.fullName &&
        !item.party
          .toLowerCase()
          .includes(transferFilters.fullName.toLowerCase())
      ) {
        return false;
      }
      if (transferFilters.direction) {
        if (
          transferFilters.direction === "outgoing" &&
          !item.type.includes("صادرة")
        ) {
          return false;
        }

        if (
          transferFilters.direction === "incoming" &&
          !item.type.includes("واردة")
        ) {
          return false;
        }
      }
      const [datePart, timePart] = item.date.split(" - ");

      const [day, month, year] = datePart.split("/");
      const [hours, minutes] = timePart.split(":");

      const operationDate = new Date(year, month - 1, day, hours, minutes);

      if (
        transferFilters.dateFrom &&
        operationDate < new Date(transferFilters.dateFrom)
      ) {
        return false;
      }

      if (
        transferFilters.dateTo &&
        operationDate > new Date(transferFilters.dateTo)
      ) {
        return false;
      }
      if (
        transferFilters.note &&
        !item.note.toLowerCase().includes(transferFilters.note.toLowerCase())
      ) {
        return false;
      }
    }

    return item.typeKey === activeFilter;
  });

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
                  currencyFrom: "",
                  currencyTo: "",
                  note: "",
                });
                setExchangeResetKey((prev) => prev + 1);
              } else if (activeFilter === "transfers") {
                setTransferFilters({
                  dateFrom: "",
                  dateTo: "",
                  fullName: "",
                  direction: "",
                  currency: "",
                  note: "",
                });
                setTransferResetKey((prev) => prev + 1);
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
            className={`filterAndIcon ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            <FaLayerGroup className="icon" />
            <Box className={`filter`}>الكل</Box>
          </Box>
          <Box
            className={`filterAndIcon ${activeFilter === "exchange" ? "active" : ""}`}
            onClick={() => setActiveFilter("exchange")}
          >
            <MdCurrencyExchange className="icon" />
            <Box className={`filter`}>الصرف</Box>
          </Box>
          <Box
            className={`filterAndIcon ${activeFilter === "transfers" ? "active" : ""}`}
            onClick={() => setActiveFilter("transfers")}
          >
            <FaMoneyBillTransfer className="icon" />
            <Box className={`filter`}>الحوالات</Box>
          </Box>
        </Box>
        {activeFilter === "exchange" && (
          <ExFilter
            key={exchangeResetKey} // <--- هذا سيجبر المكون على إعادة التعيين بصرياً
            onSearch={(filters) => setExchangeFilters(filters)}
            onReset={() =>
              setExchangeFilters({
                dateFrom: "",
                dateTo: "",
                currencyFrom: "",
                currencyTo: "",
                note: "",
              })
            }
          />
        )}

        {activeFilter === "transfers" && (
          <TrFilter
            key={transferResetKey} // <--- هذا سيجبر المكون على إعادة التعيين بصرياً
            onSearch={(filters) => setTransferFilters(filters)}
            onReset={() =>
              setTransferFilters({
                dateFrom: "",
                dateTo: "",
                fullName: "",
                direction: "",
                currency: "",
                note: "",
              })
            }
          />
        )}
      </Box>

      {/* احصاء النتائج */}
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
          {filteredData.length} عملية
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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1.2fr 1.5fr 1.5fr 1.5fr 0.9fr",
            gap: 2,
            px: 2,
            py: 1.5,
            alignItems: "center",
          }}
        >
          <Typography
            align="center"
            sx={{
              color: primary,
              fontFamily,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            نوع العملية
          </Typography>
          <Typography
            align="center"
            sx={{
              color: primary,
              fontFamily,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            التاريخ والوقت
          </Typography>
          <Typography
            align="center"
            sx={{
              color: primary,
              fontFamily,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            التفاصيل المالية
          </Typography>
          <Typography
            align="center"
            sx={{
              color: primary,
              fontFamily,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            الطرف / الوجهة
          </Typography>
          <Typography
            align="center"
            sx={{
              color: primary,
              fontFamily,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            الملاحظة
          </Typography>
          <Typography
            align="center"
            sx={{
              color: primary,
              fontFamily,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            الإجراءات
          </Typography>
        </Box>

        <Divider sx={{ backgroundColor: primary, my: 1 }} />

        {filteredData.map((item, index) => (
          <Box key={item.id}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1.2fr 1.5fr 1.5fr 1.5fr 0.9fr",
                gap: 2,
                px: 2,
                py: 2,
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: 14,
                    fontFamily,
                    fontWeight: "bold",
                    textAlign: "center",
                    backgroundColor:
                      item.typeKey === "exchange"
                        ? "rgba(0, 150, 136, 0.2)"
                        : "rgba(3, 169, 244, 0.2)",
                    color: item.typeKey === "exchange" ? "#4db6ac" : "#4fc3f7",
                    border: `1px solid ${item.typeKey === "exchange" ? "#00897b" : "#0288d1"}`,
                  }}
                >
                  {item.type}
                </Box>
              </Box>

              {/* التاريخ والوقت */}
              <Typography
                align="center"
                sx={{ color: secondary, fontFamily, fontSize: 15 }}
              >
                {item.date}
              </Typography>

              {/* التفاصيل المالية */}
              <Typography
                align="center"
                sx={{
                  color: primary,
                  fontFamily,
                  fontSize: 15,
                }}
              >
                {item.details}
              </Typography>

              {/* الطرف / الوجهة */}
              <Typography
                align="center"
                sx={{ color: secondary, fontFamily, fontSize: 15 }}
              >
                {item.party}
              </Typography>

              {/* الملاحظة */}
              <Typography
                align="center"
                sx={{ color: secondary, fontFamily, fontSize: 15 }}
              >
                {item.note}
              </Typography>

              {/* زر تفاصيل */}
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    color: primary,
                    borderColor: primary,
                    fontFamily,
                    fontSize: "13px",
                    padding: "4px 10px",
                    "&:hover": {
                      backgroundColor: "rgba(250, 229, 110, 0.15)",
                      borderColor: primary,
                    },
                  }}
                >
                  <MdVisibility />
                  <Typography sx={{ fontFamily, mr: 1 }}>التفاصيل</Typography>
                </Button>
              </Box>
            </Box>

            {index < filteredData.length - 1 && (
              <Divider
                sx={{ backgroundColor: "rgba(250, 229, 110, 0.15)", my: 1 }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
