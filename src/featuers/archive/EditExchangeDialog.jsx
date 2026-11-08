import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CurrencyExchangeRoundedIcon from "@mui/icons-material/CurrencyExchangeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { useState } from "react";
import useCashboxces from "../../hooks/cashbox_Hooks/usecashboxes";
import {
  calculateToAmount,
  formatNumber,
  viewCreatedCashboxes,
} from "../../shared/utils";
import { formatTimestampFormDateTimeLocal } from "../../shared/utilsDate";

const GOLD = "#e9b858";
const GOLD_LIGHT = "#ffda8a";
const BORDER = "rgba(233, 184, 88, 0.27)";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 48,
    color: "#f5f3ee",
    background:
      "linear-gradient(145deg, rgba(35,36,43,.98), rgba(17,18,22,.98))",
    borderRadius: "11px",
    "& fieldset": { borderColor: "rgba(255,255,255,.13)" },
    "&:hover fieldset": { borderColor: "rgba(233,184,88,.55)" },
    "&.Mui-focused fieldset": { borderColor: GOLD, borderWidth: 1.5 },
  },
  "& .MuiInputBase-input": {
    py: 1.35,
    px: 1.6,
    fontSize: "0.98rem",
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#e8e3d9",
    opacity: 1,
  },
  "& .MuiSvgIcon-root": { color: GOLD },
};

// Form label
function LabelForm({ label }) {
  return (
    <Typography
      style={{
        color: "#fff",
        padding: "4px 10px",
        fontSize: "15px",
        letterSpacing: "0.5px",
        fontFamily: "'Alyamama', sans-serif",
      }}
    >
      {label}
    </Typography>
  );
}

export default function EditExchangeDialog({
  open,
  onClose,
  exchange,
  onEditConfirm,
  editLoading,
}) {
  //استخراج قيم الحركة القديمة لملئ الحقول بالقيمة الاولية
  const { fromCurrency, toCurrency, fromAmount, rate, note, date } = exchange;

  const [updateExchangeForm, setUpdateExchangeForm] = useState({
    fromCurrency: fromCurrency,
    toCurrency: toCurrency,
    fromAmount: fromAmount,
    rate: rate,
    note: note,
    date: formatTimestampFormDateTimeLocal(date),
  });

  //services
  const { cashboxes } = useCashboxces();

  // functions
  function handleInputOnchange(event) {
    const { name, value } = event.target;

    setUpdateExchangeForm((prevValue) => {
      return { ...prevValue, [name]: value };
    });
  }

  //دالة ارسال التعديلات للاب
  function handleUpdateExchange() {
    const newData = {
      ...updateExchangeForm,
      toAmount: toAmount,
    };
    onEditConfirm(newData);
  }

  // قائمة العملات حسب الصناديق المنشأة
  const currencies = viewCreatedCashboxes(cashboxes);

  //حساب toAmount
  let toAmount = calculateToAmount(updateExchangeForm);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      dir="rtl"
      PaperProps={{
        sx: {
          m: 2,
          width: "100%",
          maxWidth: 790,
          overflow: "hidden",
          color: "#f5f3ee",
          borderRadius: "19px",
          background: "#111",
          boxShadow:
            "0 24px 80px rgba(0,0,0,.72), inset 0 1px 0 rgba(255,255,255,.06)",
          border: "2px solid #fff",
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(3,4,7,.76)",
          backdropFilter: "blur(5px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          position: "relative",
          px: { xs: 2.2, sm: 3.2 },
          pt: 2.7,
          pb: 2.35,
          border: "1px solid rgba(233,184,88,.55)",
          borderBottom: "1px solid rgba(233,184,88,.22)",
          background: "#111",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.35}>
          <Box
            sx={{
              width: 43,
              height: 43,
              display: "grid",
              placeItems: "center",
              borderRadius: "12px",
              color: "#17130b",
              background: `linear-gradient(135deg, ${GOLD_LIGHT}, #c88d2d)`,
              boxShadow: "0 5px 18px rgba(214,163,69,.24)",
            }}
          >
            <CurrencyExchangeRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography
            sx={{
              pr: 2,
              pt: 1,
              color: GOLD_LIGHT,
              fontWeight: 800,
              fontSize: { xs: "1.12rem", sm: "1.28rem" },
            }}
          >
            تعديل حركة الصرف
          </Typography>
        </Stack>

        <IconButton
          aria-label="إغلاق"
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 17,
            left: 18,
            width: 36,
            height: 36,
            color: "#c9c5bc",
            border: "1px solid rgba(255,255,255,.13)",
            backgroundColor: "rgba(255,255,255,.035)",
            "&:hover": {
              color: GOLD_LIGHT,
              borderColor: BORDER,
              backgroundColor: "rgba(233,184,88,.09)",
            },
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2, sm: 3.2 },
          pt: "24px !important",
          pb: 2.8,
          background: "#111",
          borderLeft: "1px solid rgba(233,184,88,.55)",
          borderRight: "1px solid rgba(233,184,88,.55)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.6,
          }}
        >
          <FormControl fullWidth size="small" sx={fieldSx}>
            <LabelForm label={"العملة المستلمة من الزبون"} />
            <Select
              name="fromCurrency"
              value={updateExchangeForm.fromCurrency}
              displayEmpty
              onChange={handleInputOnchange}
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.value} value={currency.value}>
                  {currency.currencyLabel}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={fieldSx}>
            <LabelForm label={"العملة المدفوعة"} />
            <Select
              name="toCurrency"
              value={updateExchangeForm.toCurrency}
              onChange={handleInputOnchange}
              displayEmpty
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.value} value={currency.value}>
                  {currency.currencyLabel}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <LabelForm label={"سعر الصرف"} />
            <TextField
              fullWidth
              size="small"
              type="number"
              name="rate"
              value={updateExchangeForm.rate}
              onChange={handleInputOnchange}
              placeholder="أدخل سعر الصرف"
              sx={fieldSx}
              inputProps={{
                min: 0,
                step: "any",
                dir: "ltr",
                style: { textAlign: "right" },
              }}
            />
          </FormControl>

          <FormControl>
            <LabelForm label={"المبلغ المستلم من الزبون"} />
            <TextField
              fullWidth
              size="small"
              type="number"
              name="fromAmount"
              value={updateExchangeForm.fromAmount}
              onChange={handleInputOnchange}
              placeholder="أدخل المبلغ المستلم"
              sx={fieldSx}
              inputProps={{
                min: 0,
                step: "any",
                dir: "ltr",
                style: { textAlign: "right" },
              }}
            />
          </FormControl>

          <FormControl>
            <LabelForm label={"التاريخ"} />
            <TextField
              fullWidth
              size="small"
              type="datetime-local"
              name="date"
              value={updateExchangeForm.date}
              onChange={handleInputOnchange}
              placeholder="أدخل المبلغ المستلم"
              sx={fieldSx}
              inputProps={{
                min: 0,
                step: "any",
                dir: "ltr",
                style: { textAlign: "right" },
              }}
            />
          </FormControl>

          <FormControl>
            <LabelForm label={"المبلغ المدفوع"} />
            <Box
              sx={{
                minHeight: 48,
                border: "1px solid rgba(255,255,255,.13)",
                borderRadius: "11px",
              }}
            >
              <Typography
                fullWidth
                placeholder="يُحدّث تلقائياً"
                sx={{
                  color: "#fff",
                  pt: 1.5,
                  pr: 1.5,
                }}
              >
                {formatNumber(toAmount)}
              </Typography>
            </Box>
          </FormControl>

          <FormControl>
            <LabelForm label={"الملاحظات"} />
            <TextField
              fullWidth
              multiline
              minRows={1}
              name="note"
              value={updateExchangeForm.note}
              onChange={handleInputOnchange}
              placeholder="أضف ملاحظة للعملية..."
              sx={{
                ...fieldSx,
                "& .MuiOutlinedInput-root": {
                  ...fieldSx["& .MuiOutlinedInput-root"],
                  alignItems: "flex-start",
                  py: 0.4,
                },
                "& .MuiInputBase-input": {
                  px: 1.6,
                  py: 1.2,
                  lineHeight: 1.8,
                },
              }}
            />
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3.2 },
          py: 2.2,
          gap: 1.3,
          borderTop: "1px solid rgba(255,255,255,.08)",
          background: "#111",
          justifyContent: "flex-start",
          flexWrap: "wrap",
          borderRight: "1px solid rgba(233,184,88,.55)",
          borderLeft: "1px solid rgba(233,184,88,.55)",
          borderBottom: "1px solid rgba(233,184,88,.55)",
        }}
      >
        <Button
          disabled={editLoading}
          onClick={handleUpdateExchange}
          variant="contained"
          sx={{
            minWidth: 174,
            minHeight: 45,
            px: 2.7,
            borderRadius: "10px",
            color: "#17120a",
            fontWeight: 800,
            fontSize: ".95rem",
            background: `linear-gradient(135deg, ${GOLD_LIGHT}, #c98e2e)`,
            boxShadow: "0 6px 18px rgba(207,151,51,.20)",
            "&:hover": {
              background: "linear-gradient(135deg, #ffe4a4, #d49a3a)",
              boxShadow: "0 8px 22px rgba(207,151,51,.28)",
            },
            "&.Mui-disabled": {
              color: "rgba(20,16,9,.5)",
              background: "rgba(233,184,88,.35)",
            },
          }}
        >
          <CheckRoundedIcon sx={{ pl: 1 }} />
          {editLoading ? "جار التعديل.." : "تأكيد التعديل"}
        </Button>

        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            minWidth: 130,
            minHeight: 45,
            px: 2.4,
            borderRadius: "10px",
            color: "#d8d4cc",
            borderColor: "rgba(255,255,255,.22)",
            fontWeight: 700,
            "&:hover": {
              borderColor: "rgba(233,184,88,.65)",
              color: GOLD_LIGHT,
              backgroundColor: "rgba(233,184,88,.06)",
            },
          }}
        >
          <CancelOutlinedIcon sx={{ pl: 1 }} />
          إلغاء
        </Button>
      </DialogActions>
    </Dialog>
  );
}
