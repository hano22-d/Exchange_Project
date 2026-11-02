import {
  Box,
  Divider,
  Paper,
  TextField,
  Typography,
  Button,
  Select,
  MenuItem,
  Checkbox,
} from "@mui/material";

import { useState } from "react";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { useTransferActions } from "../../hooks/transfer_Hooks/useTransferActions";
import BasicToast from "../../shared/ui/toast";
import useCashboxces from "../../hooks/cashbox_Hooks/usecashboxes";
import { getSupportedCurrency } from "../../shared/currencydata/currencies";

export default function Transfer() {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const text = "black";
  const darkBackground = "#232323";
  const fontFamily = "'Alyamama', sans-serif";
  const borderColor = "rgba(250,229,110,0.45)";

  const FIELD_HEIGHT = 56;

  const transferType = [
    { value: "صادر", label: "صادرة" },
    { value: "وارد", label: "واردة" },
  ];

  const commonInputStyles = {
    "& .MuiOutlinedInput-root": {
      width: 300,
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

  // نفس التنسيقات الأصلية مع جعل عرض الحقل مرناً ليتناسب مع ترتيب الأعمدة
  const responsiveInputStyles = {
    ...commonInputStyles,

    "& .MuiOutlinedInput-root": {
      ...commonInputStyles["& .MuiOutlinedInput-root"],
      width: "100%",
    },
  };

  const labelStyles = {
    color: primary,
    fontFamily,
    fontSize: 14,
    marginBottom: 1,
  };

  const EMPTY_TRANSFER_FORM = {
    date: "",
    fullname: "",
    receiverFullname: "",
    senderPhone: "",
    receiverPhone: "",
    destination: "",
    direction: "",
    currency: "",
    amount: "",
    wages: "",
    wagesIncluded: "",
    note: "",
  };

  // ==== states ====
  const [transferForm, setTransferForm] = useState(EMPTY_TRANSFER_FORM);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "",
  });

  // ==== services ====
  const { createTransfer, creating } = useTransferActions();
  const { cashboxes } = useCashboxces();

  // ==== functions ====
  function handleInputOnchange(event) {
    const { name, value } = event.target;

    setTransferForm((prevValue) => {
      return { ...prevValue, [name]: value };
    });
  }

  // إضافة حوالة
  async function addTransfer() {
    const transferData = {
      date: transferForm.date,
      fullname: transferForm.fullname,
      receiverFullname: transferForm.receiverFullname,
      senderPhone: transferForm.senderPhone,
      receiverPhone: transferForm.receiverPhone,
      destination: transferForm.destination,
      direction: transferForm.direction,
      currency: transferForm.currency,
      amount: transferForm.amount,
      wages: transferForm.wages,
      wagesIncluded: transferForm.wagesIncluded,
      note: transferForm.note,
    };

    try {
      await createTransfer(transferData);

      setToast({
        open: true,
        message: "تمت إضافة الحوالة بنجاح",
        severity: "success",
      });

      setTransferForm(EMPTY_TRANSFER_FORM);
    } catch (error) {
      setToast({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  }

  // قائمة العملات حسب الصناديق المنشأة
  const viewCreatedCashboxes = cashboxes.map((cashbox) => {
    if (!cashbox) {
      return null;
    }
    const getNameAr = getSupportedCurrency(cashbox.currency).nameAr;
    const currencyLabel = `${cashbox.currency} - ${getNameAr}`;

    return {
      value: cashbox.currency,
      currencyLabel,
    };
  });

  return (
    <>
      {/* helper Components */}
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
          justifyContent: "center",
          boxSizing: "border-box",
          p: 4,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
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
              md: 4,
            }}
          >
            <FaMoneyBillTransfer style={{ color: primary, fontSize: 30 }} />

            <Typography
              sx={{
                color: primary,
                fontFamily,
                fontSize: 25,
                fontWeight: "bold",
              }}
            >
              حوالات مالية
            </Typography>
          </Box>

          <Divider
            sx={{
              borderColor: borderColor,
              my: 4,
            }}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 3,
              }}
            >
              {/* التاريخ */}
              <Box sx={{ width: "32%" }}>
                <Typography sx={labelStyles}>التاريخ</Typography>

                <TextField
                  name="date"
                  value={transferForm.date}
                  onChange={handleInputOnchange}
                  type="datetime-local"
                  fullWidth
                  sx={{
                    ...responsiveInputStyles,

                    "& input": {
                      color: secondary,
                      colorScheme: "dark",
                    },
                  }}
                />
              </Box>

              {/* نوع الحوالة */}
              <Box sx={{ width: "32%" }}>
                <Typography sx={labelStyles}>نوع الحوالة</Typography>

                <Select
                  name="direction"
                  value={transferForm.direction}
                  onChange={handleInputOnchange}
                  fullWidth
                  sx={{
                    height: `${FIELD_HEIGHT}px`,
                    marginBottom: 2.5,
                    borderRadius: 2,
                    backgroundColor: darkBackground,
                    color: secondary,

                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: borderColor,
                    },

                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: primary,
                    },

                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: secondary,
                    },

                    "& .MuiSvgIcon-root": {
                      color: primary,
                    },
                  }}
                >
                  {transferType.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {/* الوجهة */}
              <Box sx={{ width: "32%" }}>
                <Typography sx={labelStyles}>الوجهة</Typography>

                <TextField
                  name="destination"
                  value={transferForm.destination}
                  onChange={handleInputOnchange}
                  type="text"
                  placeholder="أدخل الوجهة"
                  fullWidth
                  sx={responsiveInputStyles}
                />
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "stretch",
                gap: 4,
                my: 2,
              }}
            >
              {/* قسم المرسل */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    color: primary,
                    fontFamily,
                    fontSize: 19,
                    fontWeight: "bold",
                    textAlign: "center",
                    mb: 1,
                  }}
                >
                  المرسل
                </Typography>

                {/* اسم المرسل */}
                <Box>
                  <Typography sx={labelStyles}>الاسم الثلاثي</Typography>

                  <TextField
                    name="fullname"
                    value={transferForm.fullname}
                    onChange={handleInputOnchange}
                    type="text"
                    placeholder="أدخل الاسم الثلاثي للمرسل"
                    fullWidth
                    sx={responsiveInputStyles}
                  />
                </Box>

                {/* رقم المرسل */}
                <Box>
                  <Typography sx={labelStyles}>رقم المرسل</Typography>

                  <TextField
                    name="senderPhone"
                    value={transferForm.senderPhone}
                    onChange={handleInputOnchange}
                    type="tel"
                    placeholder="أدخل رقم المرسل"
                    fullWidth
                    sx={responsiveInputStyles}
                  />
                </Box>
              </Box>

              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  borderColor: primary,
                  borderRightWidth: 2,
                  opacity: 0.6,
                  mx: 1,
                }}
              />

              {/* قسم المستلم */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    color: primary,
                    fontFamily,
                    fontSize: 19,
                    fontWeight: "bold",
                    textAlign: "center",
                    mb: 1,
                  }}
                >
                  المستلم
                </Typography>

                {/* اسم المستلم */}
                <Box>
                  <Typography sx={labelStyles}>الاسم الثلاثي</Typography>

                  <TextField
                    name="receiverFullname"
                    value={transferForm.receiverFullname}
                    onChange={handleInputOnchange}
                    type="text"
                    placeholder="أدخل الاسم الثلاثي للمستلم"
                    fullWidth
                    sx={responsiveInputStyles}
                  />
                </Box>

                {/* رقم المستلم */}
                <Box>
                  <Typography sx={labelStyles}>رقم المستلم</Typography>

                  <TextField
                    name="receiverPhone"
                    value={transferForm.receiverPhone}
                    onChange={handleInputOnchange}
                    type="tel"
                    placeholder="أدخل رقم المستلم"
                    fullWidth
                    sx={responsiveInputStyles}
                  />
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 3,
              }}
            >
              {/* المبلغ */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={labelStyles}>المبلغ</Typography>

                <TextField
                  name="amount"
                  value={transferForm.amount}
                  onChange={handleInputOnchange}
                  type="number"
                  placeholder="أدخل المبلغ"
                  fullWidth
                  sx={{
                    ...responsiveInputStyles,

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

              {/* العملة */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={labelStyles}>العملة</Typography>

                <Select
                  name="currency"
                  value={transferForm.currency}
                  onChange={handleInputOnchange}
                  fullWidth
                  sx={{
                    height: `${FIELD_HEIGHT}px`,
                    borderRadius: 2,
                    backgroundColor: darkBackground,
                    color: secondary,

                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: borderColor,
                    },

                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: primary,
                    },

                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: secondary,
                    },

                    "& .MuiSvgIcon-root": {
                      color: primary,
                    },
                  }}
                >
                  {viewCreatedCashboxes.map((currency) => (
                    <MenuItem key={currency.value} value={currency.value}>
                      {currency.currencyLabel}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {/* الأجور */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={labelStyles}>الأجور</Typography>

                <TextField
                  disabled={transferForm.direction === "وارد"}
                  name="wages"
                  value={transferForm.wages}
                  onChange={handleInputOnchange}
                  type="number"
                  placeholder="أجور"
                  fullWidth
                  sx={{
                    ...responsiveInputStyles,

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

              {/* متضمن الأجور */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "start",
                  minHeight: `${FIELD_HEIGHT}px`,
                }}
              >
                <Typography
                  sx={{
                    ...labelStyles,
                    mb: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  متضمن الأجور
                </Typography>

                <Checkbox
                  disabled={transferForm.direction === "وارد"}
                  name="wagesIncluded"
                  value={transferForm.wagesIncluded}
                  onChange={handleInputOnchange}
                  defaultChecked={false}
                  size="medium"
                  color={primary}
                  sx={{
                    color: primary,

                    "&.Mui-disabled": {
                      color: "gray",
                    },
                  }}
                />
              </Box>
            </Box>

            {/* حقل الملاحظات */}
            <Box>
              <Typography sx={labelStyles}>الملاحظات</Typography>

              <TextField
                name="note"
                value={transferForm.note}
                onChange={handleInputOnchange}
                multiline
                rows={2}
                placeholder="أضف ملاحظات حول الحوالة ..."
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
          </Box>

          <Divider
            sx={{
              borderColor: borderColor,
              my: 4,
            }}
          />

          {/* زر التنفيذ */}
          <Button
            onClick={addTransfer}
            disabled={creating}
            variant="contained"
            sx={{
              width: "250px",
              height: "48px",
              alignSelf: "center",
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
            {creating ? "جار التنفيذ" : "تسجيل الحوالة"}
          </Button>
        </Paper>
      </Box>
    </>
  );
}
