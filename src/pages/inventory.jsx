import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { FaClipboardList } from "react-icons/fa";
import { useState } from "react";
import useCashboxces from "../hooks/cashbox_Hooks/usecashboxes";
import SuccessMatching from "../featuers/inventory/successDialog_inventory";
import FailedMatching from "../featuers/inventory/failedDialog_inventory";

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
  const [mismatchedBalances, setMismatchedBalances] = useState([]);

  // ==== services ==== //
  const { cashboxes } = useCashboxces();

  // ==== functions ==== //

  // دالة جمع قيم المدخلات
  function handleInputOnchange(event) {
    const { name, value } = event.target;

    setCurrenciesForm((prevValue) => {
      return { ...prevValue, [name]: value };
    });
  }

  function roundBalance(value) {
    return Number(Number(value).toFixed(2));
  }

  //دالة التحقق من مطابقة الارصدة
  function reconcileBalances() {
    const mismatches = [];

    for (let i = 0; i < cashboxes.length; i++) {
      const cashbox = cashboxes[i];

      const enteredBalance = currenciesForm[cashbox.currency];

      const hasEnteredValue =
        enteredBalance !== undefined && String(enteredBalance).trim() !== "";

      const actualBalance = roundBalance(cashbox.balance);

      const formBalance = hasEnteredValue ? roundBalance(enteredBalance) : null;

      const isValidBalance =
        formBalance !== null && Number.isFinite(formBalance);

      if (!isValidBalance || formBalance !== actualBalance) {
        const balanceDifference = isValidBalance
          ? Number((actualBalance - formBalance).toFixed(2))
          : null;

        const mismatchData = {
          currency: cashbox.currency,
          currencyName: cashbox.currencyNameAr,
          balance: cashbox.balance,
          formBalance: enteredBalance ?? "",
          difference: balanceDifference,
        };

        mismatches.push(mismatchData);
      }
    }

    setMismatchedBalances(mismatches);

    if (mismatches.length === 0) {
      setOpenFailed(false);
      setOpenSuccess(true);
    } else {
      setOpenSuccess(false);
      setOpenFailed(true);
    }
  }

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
              <Grid size={4} sx={gridStyle}>
                <Typography
                  sx={fieldLabelStyle}
                >{`${cashbox.currency} - ${cashbox.currencyNameAr}`}</Typography>
                <TextField
                  name={cashbox.currency}
                  value={currenciesForm[cashbox.currency]}
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
              variant="contained"
              onClick={reconcileBalances}
              sx={{
                color: textColor,
                backgroundColor: primary,
                fontFamily,
                fontSize: 15,
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
