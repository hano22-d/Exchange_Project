import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Divider,
  Button,
} from "@mui/material";

import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { useState } from "react";
import { useExchangeActions } from "../../../hooks/exchanges_Hooks/useExchangeActions";
import BasicToast from "../../../shared/ui/toast";
import { getExchangeCalculationType } from "../../../shared/currencydata/exchange-pairs";
import { calculateTargetAmount, formatNumber } from "../../../shared/utils";
import { SUPPORTED_CURRENCIES } from "../../../shared/currencydata/currencies";

const primary = "rgba(250,229,110,0.992)";
const secondary = "#ffffff";
const text = "black";
const darkBackground = "#232323";
const fontFamily = "'Alyamama', sans-serif";
const borderColor = "rgba(250,229,110,0.45)";

const FIELD_HEIGHT = 56;

const commonInputStyles = {
  "& .MuiOutlinedInput-root": {
    height: `${FIELD_HEIGHT}px`,
    color: secondary,
    backgroundColor: darkBackground,
    borderRadius: 2,

    "& fieldset": {
      borderColor: borderColor,
    },

    "&:hover fieldset": {
      borderColor: primary,
    },

    "&.Mui-focused fieldset": {
      borderColor: secondary,
    },
  },

  "& .MuiInputBase-input": {
    fontFamily,
  },

  "& .MuiSvgIcon-root": {
    color: primary,
  },
};

const labelStyles = {
  color: primary,
  fontFamily,
  fontSize: 14,
  marginBottom: 1,
};

export default function Exchange() {
  //states
  const [exchangeForm, setExchangeForm] = useState({
    fromCurrency: "",
    toCurrency: "",
    fromAmount: "",
    rate: "",
    note: "",
    date: "",
  });
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { createExchange, creating } = useExchangeActions();

  // ===== functions ==== //
  function handleInputOnchange(event) {
    const { name, value } = event.target;

    setExchangeForm((prevValue) => {
      return { ...prevValue, [name]: value };
    });
  }

  //دالة إضافة عملية صرف
  async function addExchange() {
    const exchangeData = {
      fromCurrency: exchangeForm.fromCurrency,
      toCurrency: exchangeForm.toCurrency,
      fromAmount: exchangeForm.fromAmount,
      rate: exchangeForm.rate,
      date: exchangeForm.date,
      note: exchangeForm.note,
    };

    try {
      await createExchange(exchangeData);

      setToast({
        open: true,
        message: "تمت إضافة حركة الصرف بنجاح",
        severity: "success",
      });

      setExchangeForm({
        fromCurrency: "",
        toCurrency: "",
        fromAmount: "",
        rate: "",
        note: "",
        date: "",
      });
    } catch (error) {
      setToast({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إضافة حركة الصرف",
        severity: "error",
      });
    }
  }

  //عرض toAmount
  const toAmountReview = () => {
    const fromCurrency = exchangeForm.fromCurrency.trim().toUpperCase();
    const toCurrency = exchangeForm.toCurrency.trim().toUpperCase();
    const fromAmount = Number(exchangeForm.fromAmount);
    const rate = Number(exchangeForm.rate);

    if (!fromCurrency || !toCurrency || !fromAmount || !rate) {
      return null;
    }

    const calculateType = getExchangeCalculationType(fromCurrency, toCurrency);

    return calculateTargetAmount(fromAmount, rate, calculateType);
  };

  return (
    <>
     {/*رسالة نجاح او فشل عملية إضافة حركة صرف*/}
      <BasicToast
        open={toast.open}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        message={toast.message}
        severity={toast.severity}
      />

      <Box
        component="form"
        sx={{
          width: "100%",
          display: "flex",
          boxSizing: "border-box",
          p: 4,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            backgroundColor: "#111111",
            border: `2px solid ${borderColor}`,
            borderRadius: 3,
            p: 6,
          }}
        >
          {/* عنوان النموذج */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              mb: 4,
            }}
          >
            <CurrencyExchangeIcon sx={{ color: primary, fontSize: 30 }} />

            <Typography
              sx={{
                color: primary,
                fontFamily,
                fontSize: 25,
                fontWeight: "bold",
              }}
            >
              عملية صرف جديدة
            </Typography>
          </Box>

          <Divider
            sx={{
              borderColor: borderColor,
              mb: 4,
            }}
          />

          {/* التاريخ والوقت */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography sx={labelStyles}>التاريخ والوقت</Typography>

            <TextField
              name="date"
              value={exchangeForm.date}
              onChange={handleInputOnchange}
              type="datetime-local"
              sx={{
                ...commonInputStyles,
                width: "300px",

                "& input": {
                  color: secondary,
                  colorScheme: "dark",
                },
              }}
            />
          </Box>

          {/* الأعمدة الثلاثة */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* المبلغ والعملة المستلمة */}
            <Box sx={{ minWidth: 380 }}>
              <Typography sx={labelStyles}>العملة المستلمة</Typography>

              <Select
                name="fromCurrency"
                value={
                  exchangeForm.fromCurrency ||
                  SUPPORTED_CURRENCIES[0]?.code ||
                  ""
                }
                onChange={handleInputOnchange}
                fullWidth
                sx={{
                  ...commonInputStyles,
                  height: `${FIELD_HEIGHT}px`,
                  marginBottom: 2.5,
                  borderRadius: 2,

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: borderColor,
                  },

                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: primary,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: secondary,
                  },

                  backgroundColor: darkBackground,
                  color: secondary,
                }}
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <MenuItem key={currency.code} value={currency.code}>
                    {`${currency.code} - ${currency.nameAr}`}
                  </MenuItem>
                ))}
              </Select>

              <Typography sx={labelStyles}>المبلغ المستلم</Typography>

              <TextField
                name="fromAmount"
                value={exchangeForm.fromAmount}
                onChange={handleInputOnchange}
                type="number"
                placeholder="أدخل المبلغ"
                fullWidth
                sx={{
                  ...commonInputStyles,

                  "& input": {
                    color: secondary,
                  },

                  "& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button":
                    {
                      WebkitAppearance: "none",
                      margin: 0,
                    },

                  "& input[type=number]": {
                    MozAppearance: "textfield",
                  },
                }}
              />
            </Box>

            {/*  الايقونة */}
            <CompareArrowsIcon
              sx={{
                color: primary,
                fontSize: 50,
                backgroundColor: darkBackground,
                border: `1.5px solid ${primary}`,
                borderRadius: "50%",
                p: 0.7,
              }}
            />

            {/* العملة والمبلغ المدفوع */}
            <Box sx={{ minWidth: 380 }}>
              <Typography sx={labelStyles}>العملة المدفوعة</Typography>

              <Select
                name="toCurrency"
                value={
                  exchangeForm.toCurrency || SUPPORTED_CURRENCIES[0]?.code || ""
                }
                onChange={handleInputOnchange}
                fullWidth
                sx={{
                  ...commonInputStyles,
                  height: `${FIELD_HEIGHT}px`,
                  marginBottom: 2.5,
                  borderRadius: 2,

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: borderColor,
                  },

                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: primary,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: secondary,
                  },

                  backgroundColor: darkBackground,
                  color: secondary,
                }}
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <MenuItem key={currency.code} value={currency.code}>
                    {`${currency.code} - ${currency.nameAr}`}
                  </MenuItem>
                ))}
              </Select>

              <Typography sx={labelStyles}>المبلغ المدفوع</Typography>

              <Box
                sx={{
                  width: "100%",
                  height: `${FIELD_HEIGHT}px`,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 2,
                  backgroundColor: "rgba(250,229,110,0.08)",
                }}
              >
                <Typography
                  sx={{
                    color: secondary,
                    fontFamily,
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  {formatNumber(toAmountReview())}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ alignSelf: "center", justifySelf: "center" }}>
            <Typography sx={{ ...labelStyles }}>سعر الصرف</Typography>

            <TextField
              name="rate"
              value={exchangeForm.rate}
              onChange={handleInputOnchange}
              type="number"
              placeholder="أدخل سعر الصرف"
              sx={{
                ...commonInputStyles,
                width: "300px",
                mb: 2,

                // ازالة الشريط الجانبي للحقل
                "& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button":
                  {
                    WebkitAppearance: "none",
                  },
              }}
            />
          </Box>

          {/* الملاحظات */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={labelStyles}>الملاحظات</Typography>

            <TextField
              name="note"
              value={exchangeForm.note}
              onChange={handleInputOnchange}
              multiline
              rows={2}
              placeholder="أضف ملاحظات حول عملية الصرف..."
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: secondary,
                  backgroundColor: darkBackground,
                  borderRadius: 2,

                  "& fieldset": {
                    borderColor: borderColor,
                  },

                  "&:hover fieldset": {
                    borderColor: primary,
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: secondary,
                  },
                },

                "& textarea": {
                  fontFamily,
                  lineHeight: 1.8,
                },
              }}
            />
          </Box>

          <Divider
            sx={{
              borderColor: borderColor,
              mb: 3,
            }}
          />

          {/* أزرار الواجهة */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <Button
              onClick={addExchange}
              disabled={creating}
              variant="contained"
              sx={{
                width: "250px",
                height: "48px",
                borderRadius: 2,
                backgroundColor: primary,
                color: text,
                fontFamily,
                fontSize: 15,
                fontWeight: "bold",

                "&:hover": {
                  backgroundColor: primary,
                },
              }}
            >
              {creating ? "..جار التنفيذ" : "تنفيذ العملية"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
