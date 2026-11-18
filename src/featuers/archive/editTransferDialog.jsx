import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { useState } from "react";
import { viewCreatedCashboxes } from "../../shared/utils";
import useCashboxces from "../../hooks/cashbox_Hooks/usecashboxes";
import { formatTimestampFormDateTimeLocal } from "../../shared/utilsDate";

const primary = "rgba(250,229,110,0.992)";
const secondary = "#FFFFFF";
const fieldBackground = "#232323";
const borderColor = "rgba(250,229,110,0.35)";
const fontFamily = "'Alyamama', sans-serif";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 43,
    color: secondary,
    backgroundColor: fieldBackground,
    borderRadius: 2,

    "& fieldset": {
      borderColor: "rgba(255,255,255,0.12)",
    },

    "&:hover fieldset": {
      borderColor: primary,
    },

    "&.Mui-focused fieldset": {
      borderColor: primary,
    },
  },

  "& .MuiInputBase-input": {
    color: secondary,
    fontFamily,
    fontSize: 14,
  },

  "& .MuiSvgIcon-root": {
    color: primary,
  },
};

const labelSx = {
  color: primary,
  fontFamily,
  fontSize: 13,
  fontWeight: "bold",
  mb: 0.8,
};

function Field({ label, children, sx }) {
  return (
    <Box sx={{ minWidth: 0, ...sx }}>
      <Typography sx={labelSx}>{label}</Typography>

      {children}
    </Box>
  );
}

const directionOptions = [
  { value: "صادر", label: "صادرة" },
  { value: "وارد", label: "واردة" },
];

export default function EditTransferDialog({
  open,
  onClose,
  onConfirm,
  transfer,
  loading,
}) {
  const {
    fullName,
    receiverFullname,
    receiverPhone,
    senderPhone,
    currency,
    amount,
    date,
    note,
    wages,
    wagesIncluded,
    direction,
    destination,
  } = transfer;

  const { cashboxes } = useCashboxces();

  const [updateTransferForm, setUpdateTransferForm] = useState({
    fullname: fullName,
    receiverFullname: receiverFullname,
    currency: currency,
    amount: amount,
    receiverPhone: receiverPhone,
    senderPhone: senderPhone,
    wages: wages,
    wagesIncluded: wagesIncluded,
    date: formatTimestampFormDateTimeLocal(date),
    note: note,
    direction: direction,
    destination: destination,
  });

  // functions
  function handleInputOnchange(event) {
    const { name, value } = event.target;

    setUpdateTransferForm((prevValue) => {
      return { ...prevValue, [name]: value };
    });
  }

  //دالة ارسال التعديلات
  function handleUpdateTransfer() {
    onConfirm(updateTransferForm);
  }

  // قائمة العملات حسب الصناديق المنشأة
  const currencies = viewCreatedCashboxes(cashboxes);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      dir="rtl"
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(0,0,0,0.78)",
          backdropFilter: "blur(2px)",
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: "95%", sm: 780 },
          maxWidth: "95vw",
          maxHeight: "90vh",
          color: secondary,
          border: `1px solid ${borderColor}`,
          borderRadius: 2.5,
          boxShadow: "0 15px 55px rgba(0,0,0,0.65)",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 1.8,
          borderBottom: `1px solid ${borderColor}`,
          background: "#111",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              backgroundColor: primary,
              color: "#151515",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 15px rgba(250,229,110,0.2)",
            }}
          >
            <FaMoneyBillTransfer size={21} />
          </Box>

          <Typography
            sx={{
              color: primary,
              fontFamily,
              fontSize: 17,
              fontWeight: "bold",
            }}
          >
            تعديل الحوالة
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            color: "#BDBDBD",
            border: "1px solid rgba(255,255,255,0.12)",
            width: 34,
            height: 34,

            "&:hover": {
              color: secondary,
              backgroundColor: "rgba(255,255,255,0.08)",
            },
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          px: { xs: 2, sm: 2.7 },
          py: 2.5,
          overflowY: "auto",
          background: "#111",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          <Field label="التاريخ">
            <TextField
              name="date"
              value={updateTransferForm.date}
              onChange={handleInputOnchange}
              type="datetime-local"
              fullWidth
              size="small"
              sx={{
                ...inputSx,
                "& input": {
                  color: secondary,
                  colorScheme: "dark",
                  fontFamily,
                  fontSize: 13,
                },
              }}
            />
          </Field>

          <Field label="اسم المرسل">
            <TextField
              name="fullname"
              value={updateTransferForm.fullname}
              onChange={handleInputOnchange}
              placeholder="أدخل الاسم الثلاثي"
              fullWidth
              size="small"
              sx={inputSx}
            />
          </Field>

          <Field label="اسم المستلم">
            <TextField
              name="receiverFullname"
              value={updateTransferForm.receiverFullname}
              onChange={handleInputOnchange}
              placeholder="أدخل الاسم الثلاثي"
              fullWidth
              size="small"
              sx={inputSx}
            />
          </Field>

          <Field label="موبايل المرسل">
            <TextField
              name="senderPhone"
              value={updateTransferForm.senderPhone}
              onChange={handleInputOnchange}
              type="number"
              placeholder="أدخل المبلغ"
              fullWidth
              size="small"
              sx={inputSx}
            />
          </Field>

          <Field label="موبايل المستلم">
            <TextField
              name="receiverPhone"
              value={updateTransferForm.receiverPhone}
              onChange={handleInputOnchange}
              type="number"
              placeholder="أدخل المبلغ"
              fullWidth
              size="small"
              sx={inputSx}
            />
          </Field>

          <Field label="نوع الحوالة">
            <FormControl fullWidth size="small" sx={inputSx}>
              <Select
                name="direction"
                value={updateTransferForm.direction}
                onChange={handleInputOnchange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  اختر نوع الحوالة
                </MenuItem>

                {directionOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Field>

          <Field label="المبلغ">
            <TextField
              name="amount"
              value={updateTransferForm.amount}
              onChange={handleInputOnchange}
              type="number"
              placeholder="أدخل المبلغ"
              fullWidth
              size="small"
              sx={inputSx}
            />
          </Field>

          <Field label="العملة">
            <FormControl fullWidth size="small" sx={inputSx}>
              <Select
                name="currency"
                value={updateTransferForm.currency}
                onChange={handleInputOnchange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  اختر العملة
                </MenuItem>

                {currencies.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.currencyLabel}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Field>

          <Field label="الوجهة">
            <TextField
              name="destination"
              value={updateTransferForm.destination}
              onChange={handleInputOnchange}
              placeholder="أدخل الوجهة"
              fullWidth
              size="small"
              sx={inputSx}
            />
          </Field>

          <Field label="الأجور">
            <TextField
              name="wages"
              value={updateTransferForm.wages}
              onChange={handleInputOnchange}
              type="number"
              placeholder="أدخل الأجور"
              fullWidth
              size="small"
              sx={inputSx}
            />
          </Field>

          <Box
            sx={{
              display: "flex",
              alignItems: "end",
              pb: 0.2,
            }}
          >
            <Box
              sx={{
                width: "100%",
                minHeight: 43,
                display: "flex",
                alignItems: "center",
                px: 1.5,
                borderRadius: 2,
                backgroundColor: fieldBackground,
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="wagesIncluded"
                    value={updateTransferForm.wagesIncluded}
                    onChange={handleInputOnchange}
                    sx={{
                      color: primary,
                      "&.Mui-checked": {
                        color: primary,
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      color: secondary,
                      fontFamily,
                      fontSize: 13,
                    }}
                  >
                    متضمن الأجور
                  </Typography>
                }
              />
            </Box>
          </Box>

          <Field
            label="الملاحظات"
            sx={{
              gridColumn: {
                xs: "span 1",
                sm: "1 / -1",
              },
              mt: 0.5,
            }}
          >
            <TextField
              name="note"
              value={updateTransferForm.note}
              onChange={handleInputOnchange}
              placeholder="أضف ملاحظات حول الحوالة..."
              multiline
              minRows={2}
              fullWidth
              sx={{
                ...inputSx,

                "& .MuiOutlinedInput-root": {
                  ...inputSx["& .MuiOutlinedInput-root"],
                  alignItems: "flex-start",
                },

                "& textarea": {
                  fontFamily,
                  lineHeight: 1.8,
                  color: secondary,
                },
              }}
            />
          </Field>
        </Box>
      </DialogContent>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.10)",
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 1.2,
          px: 2.5,
          py: 2,
          backgroundColor: "#151515",
        }}
      >
        <Button
          onClick={handleUpdateTransfer}
          disabled={loading}
          variant="contained"
          startIcon={<CheckRoundedIcon />}
          sx={{
            minWidth: 150,
            height: 42,
            borderRadius: 2,
            backgroundColor: primary,
            color: "#111111",
            fontFamily,
            fontWeight: "bold",
            boxShadow: "0 3px 12px rgba(250,229,110,0.15)",

            "&:hover": {
              backgroundColor: "#E6CD60",
              boxShadow: "0 3px 15px rgba(250,229,110,0.25)",
            },
          }}
        >
          {loading ? "جار التعديل.." : "تأكيد التعديل"}
        </Button>

        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<CancelOutlinedIcon />}
          sx={{
            minWidth: 110,
            height: 42,
            borderRadius: 2,
            color: "#CCCCCC",
            borderColor: "rgba(255,255,255,0.16)",
            fontFamily,
            fontWeight: "bold",

            "&:hover": {
              borderColor: primary,
              backgroundColor: "rgba(255,255,255,0.04)",
            },
          }}
        >
          إلغاء
        </Button>
      </Box>
    </Dialog>
  );
}
