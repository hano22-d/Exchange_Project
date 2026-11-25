import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { FaClipboardList } from "react-icons/fa";
import { useState } from "react";
import useCashboxces from "../hooks/cashbox_Hooks/usecashboxes";
import SuccessMatching from "../featuers/inventory/successDialog_inventory";
import FailedMatching from "../featuers/inventory/failedDialog_inventory";
import useReconceBalance from "../hooks/utilsHooks/useReconceBalance";
import { useReconciliation } from "../context/ReconcilliationContext";

export default function Inventory() {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const textColor = "black";
  const bodyColor = "#252525";
  const mutedColor = "#aaaaaa";
  const fontFamily = "'Alyamama', sans-serif";

  const commonInputStyles = {
    "& .MuiOutlinedInput-root": {
      color: secondary,
      backgroundColor: bodyColor,
      borderRadius: 1,
      transition: "all 0.2s ease",
      mt: 6,

      "& fieldset": {
        borderColor: "rgba(250,229,110,0.4)",
      },

      "&:hover fieldset": {
        borderColor: primary,
      },

      "&.Mui-focused fieldset": {
        borderColor: primary,
      },
    },

    "& .MuiInputBase-input": {
      fontFamily,
      fontSize: 14,
      padding: "12px 14px",
    },

    "& .MuiInputBase-input::placeholder": {
      color: mutedColor,
      opacity: 0.8,
    },

    "& .MuiSvgIcon-root": {
      color: primary,
    },
  };

  const fieldLabelStyle = {
    color: primary,
    fontFamily,
    fontSize: 20,
    fontWeight: 700,
  };

  const gridStyle = {
    height: 150,
    background: "linear-gradient(180deg, #3b3b3b, #000000)",
    borderRadius: 2,
    p: 2,
  };

  const [currenciesForm, setCurrenciesForm] = useState({});
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openFailed, setOpenFailed] = useState(false);

  // ==== services ==== //
  const { cashboxes } = useCashboxces();
  // خدمة حساب مطابقة الارصدة
  const { mismatchedBalances, reconcileBalances } =
    useReconceBalance(cashboxes);
  const { saveReconciliation } = useReconciliation();

  // ==== functions ==== //
  function handleInputOnchange(event) {
    const { name, value } = event.target;

    setCurrenciesForm((prevValue) => {
      return { ...prevValue, [name]: value };
    });
  }

  //دالة حساب الجرد
  function handleReconcile() {
    const result = reconcileBalances(currenciesForm);

    // لم تكتمل عملية التحميل أو لا توجد صناديق
    if (result.status !== "completed") {
      return;
    }

    try {
      saveReconciliation(result);

      if (result.matched) {
        setOpenFailed(false);
        setOpenSuccess(true);
      } else {
        setOpenSuccess(false);
        setOpenFailed(true);
      }
    } catch (error) {
      console.error(error);
      // اعرض رسالة تعذر حفظ نتيجة الجرد
    }
  }

  // التحقق من تعبئة كل الحقول
  const areAllFieldsFilled =
    cashboxes.length > 0 &&
    cashboxes.every((cashbox) => {
      const val = currenciesForm[cashbox.currency];
      if (val === undefined || val === null) return false;
      const trimmed = String(val).trim();
      return trimmed !== "" && Number.isFinite(Number(trimmed));
    });

  return (
    <>
      {/* helper components */}
      <SuccessMatching
        openSuccess={openSuccess}
        onClose={() => setOpenSuccess(false)}
      />
      <FailedMatching
        openFailed={openFailed}
        onClose={() => setOpenFailed(false)}
        mismatchedBalances={mismatchedBalances}
      />

      <Box sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: bodyColor,
            border: `1px solid ${primary}`,
            borderRadius: 5,
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FaClipboardList style={{ fontSize: 40, color: primary }} />
            <Box>
              <Typography
                sx={{ fontSize: 30, fontFamily: fontFamily, color: secondary }}
              >
                الجرد والمطابقة
              </Typography>
              <Typography
                sx={{ fontSize: 15, fontFamily: fontFamily, color: secondary }}
              >
                إحصاء المبالغ الموجودة والمطابقة مع الصناديق
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            background: "linear-gradient(360deg, #000000, #3b3b3b, #000000)",

            border: `1px solid ${primary}`,
            borderRadius: 2,
            p: 4,
            my: 2,
          }}
        >
          <Grid container rowSpacing={1} columnSpacing={3} sx={{ my: 1 }}>
            {cashboxes.map((cashbox) => (
              <Grid key={cashbox.currency} size={4} sx={gridStyle}>
                <Typography
                  sx={fieldLabelStyle}
                >{`${cashbox.currency} - ${cashbox.currencyNameAr}`}</Typography>
                <TextField
                  name={cashbox.currency}
                  value={currenciesForm[cashbox.currency] ?? ""}
                  onChange={handleInputOnchange}
                  size="small"
                  type="number"
                  placeholder="أدخل المبلغ"
                  fullWidth
                  sx={{
                    ...commonInputStyles,

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
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Button
              onClick={handleReconcile}
              disabled={!areAllFieldsFilled}
              variant="contained"
              sx={{
                color: textColor,
                backgroundColor: primary,
                fontFamily,
                fontSize: 15,
                "&.Mui-disabled": {
                  backgroundColor: "rgba(250, 229, 110, 0.25)",
                  color: "rgba(255, 255, 255, 0.45)",
                },
              }}
            >
              مطابقة مع الصناديق
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
