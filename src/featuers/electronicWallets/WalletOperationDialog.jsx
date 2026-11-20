import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";

import {
  OPERATION_LABELS,
  WALLET_COLORS,
  WALLET_FONT,
} from "../../shared/ui/walletUiUtils";
import { formatTimestampFormDateTimeLocal } from "../../shared/utilsDate";

const FIELD_SX = {
  "& .MuiInputLabel-root": { color: "#aaa", fontFamily: WALLET_FONT },
  "& .MuiInputLabel-root.Mui-focused": { color: WALLET_COLORS.gold },
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    bgcolor: "#151515",
    borderRadius: 2,
    fontFamily: WALLET_FONT,
    "& fieldset": { borderColor: WALLET_COLORS.goldBorder },
    "&:hover fieldset, &.Mui-focused fieldset": {
      borderColor: WALLET_COLORS.gold,
    },
  },
};

const OPERATION_OPTIONS = [
  { value: "withdrawal", label: OPERATION_LABELS.withdrawal },
  { value: "deposit", label: OPERATION_LABELS.deposit },
  { value: "external_in", label: OPERATION_LABELS.external_in },
  { value: "external_out", label: OPERATION_LABELS.external_out },
  { value: "adjustment", label: OPERATION_LABELS.adjustment },
];

function getAmountLabel(operationType, feeMode) {
  if (operationType === "withdrawal") return "المبلغ الأساسي للسحب";
  if (operationType === "deposit" && feeMode === "included") {
    return "المبلغ النقدي الذي استلمه المكتب";
  }
  if (operationType === "deposit") return "المبلغ الإلكتروني المرسل";
  if (operationType === "adjustment") return "قيمة التسوية (+ زيادة / - نقصان)";
  if (operationType === "external_in") return "المبلغ الوارد إلى المحفظة";
  if (operationType === "external_out") return "المبلغ الصادر من المحفظة";
  return "المبلغ";
}

function getOperationExplanation(operationType, feeMode) {
  switch (operationType) {
    case "withdrawal":
      return "تزداد المحفظة بالمبلغ الأساسي، وينقص الصندوق النقدي بصافي المبلغ بعد العمولة.";
    case "deposit":
      return feeMode === "included"
        ? "يدخل المبلغ النقدي إلى الصندوق، ويخرج من المحفظة المبلغ بعد اقتطاع العمولة."
        : "يخرج المبلغ الأساسي من المحفظة، ويدخل إلى الصندوق المبلغ الأساسي مضافًا إليه العمولة.";
    case "external_in":
      return "يزداد رصيد المحفظة فقط، دون أي تغيير في الصندوق النقدي.";
    case "external_out":
      return "ينقص رصيد المحفظة فقط، دون أي تغيير في الصندوق النقدي.";
    case "adjustment":
      return "تعديل تصحيحي لرصيد المحفظة فقط. يجب كتابة سبب واضح للتسوية.";
    case "opening_balance":
      return "الرصيد الافتتاحي يغيّر رصيد المحفظة فقط.";
    default:
      return "";
  }
}

export default function WalletOperationDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  balances = [],
  defaultOperationType = "withdrawal",
  initialOperation = null,
}) {
  const isEditing = Boolean(initialOperation);

  const [operationType, setOperationType] = useState(defaultOperationType);
  const [currency, setCurrency] = useState("");
  const [amount, setAmount] = useState("");
  const [feeAmount, setFeeAmount] = useState("0");
  const [feeMode, setFeeMode] = useState("separate");
  const [date, setDate] = useState();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const availableCurrencies = useMemo(
    () => balances.map((item) => item.currency),
    [balances]
  );

  useEffect(() => {
    if (!open) return;

    const nextOperationType =
      initialOperation?.operationType ?? defaultOperationType;

    setOperationType(nextOperationType);
    setCurrency(initialOperation?.currency ?? availableCurrencies[0] ?? "");
    setAmount(initialOperation ? String(initialOperation.amount) : "");
    setFeeAmount(
      initialOperation ? String(initialOperation.feeAmount ?? 0) : "0"
    );
    setFeeMode(initialOperation?.feeMode ?? "separate");
    setDate(
      initialOperation?.date
        ? formatTimestampFormDateTimeLocal(initialOperation.date)
        : formatTimestampFormDateTimeLocal()
    );
    setNote(initialOperation?.note ?? "");
    setError("");
  }, [open, initialOperation, defaultOperationType, availableCurrencies]);

  const hasFee = operationType === "withdrawal" || operationType === "deposit";
  const isAdjustment = operationType === "adjustment";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!currency) {
      setError("يجب إضافة عملة إلى المحفظة أولًا.");
      return;
    }

    const numericAmount = Number(amount);
    const numericFee = Number(feeAmount);

    if (!Number.isFinite(numericAmount) || numericAmount === 0) {
      setError("يرجى إدخال مبلغ صحيح غير صفري.");
      return;
    }

    if (!isAdjustment && numericAmount < 0) {
      setError(
        "المبلغ يجب أن يكون موجبًا. استخدم إشارة السالب في التسوية فقط."
      );
      return;
    }

    if (isAdjustment && !note.trim()) {
      setError("يجب كتابة سبب واضح لعملية التسوية.");
      return;
    }

    if (hasFee && (!Number.isFinite(numericFee) || numericFee < 0)) {
      setError("قيمة العمولة غير صالحة.");
      return;
    }

    if (hasFee && numericFee >= numericAmount && numericFee > 0) {
      setError("يجب أن تكون العمولة أقل من المبلغ الأساسي.");
      return;
    }

    try {
      await onConfirm({
        operationType,
        currency,
        amount: numericAmount,
        feeAmount: hasFee ? numericFee : 0,
        feeMode: hasFee ? feeMode : null,
        date,
        note: note.trim(),
      });
    } catch (submitError) {
      setError(submitError?.message || "تعذر حفظ العملية.");
    }
  }

  const typeOptions = isEditing
    ? [
        {
          value: operationType,
          label: OPERATION_LABELS[operationType] || operationType,
        },
      ]
    : OPERATION_OPTIONS;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: WALLET_COLORS.panel,
          color: "#fff",
          border: `1px solid ${WALLET_COLORS.goldBorder}`,
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#151515",
          borderBottom: `1px solid ${WALLET_COLORS.goldBorder}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <AccountBalanceWalletRoundedIcon sx={{ color: WALLET_COLORS.gold }} />
          <Typography
            sx={{
              color: WALLET_COLORS.gold,
              fontFamily: WALLET_FONT,
              fontWeight: 700,
            }}
          >
            {isEditing
              ? "تعديل العملية"
              : `تسجيل ${OPERATION_LABELS[operationType] || "عملية"}`}
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={loading} sx={{ color: "#aaa" }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, background: "#111" }}>
        <Box
          component="form"
          id="wallet-operation-form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2.4, pt: 1 }}
        >
          <FormControl fullWidth sx={FIELD_SX}>
            <InputLabel id="wallet-operation-type-label">
              نوع العملية
            </InputLabel>
            <Select
              labelId="wallet-operation-type-label"
              value={operationType}
              label="نوع العملية"
              disabled={isEditing}
              onChange={(event) => setOperationType(event.target.value)}
            >
              {typeOptions.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={FIELD_SX}>
            <InputLabel id="wallet-operation-currency-label">العملة</InputLabel>
            <Select
              labelId="wallet-operation-currency-label"
              value={currency}
              label="العملة"
              onChange={(event) => setCurrency(event.target.value)}
            >
              {availableCurrencies.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label={getAmountLabel(operationType, feeMode)}
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputProps={{ step: "any" }}
            fullWidth
            sx={FIELD_SX}
          />

          {hasFee && (
            <>
              <TextField
                label="قيمة العمولة"
                type="number"
                value={feeAmount}
                onChange={(event) => setFeeAmount(event.target.value)}
                inputProps={{ min: 0, step: "any" }}
                fullWidth
                sx={FIELD_SX}
              />

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "#191919",
                  border: `1px solid ${WALLET_COLORS.goldBorder}`,
                }}
              >
                <Typography
                  sx={{
                    color: "#ddd",
                    fontSize: 13,
                    mb: 0.8,
                    fontFamily: WALLET_FONT,
                  }}
                >
                  طريقة احتساب الاجور
                </Typography>
                <RadioGroup
                  value={feeMode}
                  onChange={(event) => setFeeMode(event.target.value)}
                  sx={{ gap: 0.5 }}
                >
                  <FormControlLabel
                    value="separate"
                    control={
                      <Radio
                        sx={{
                          color: "#777",
                          "&.Mui-checked": { color: WALLET_COLORS.gold },
                        }}
                      />
                    }
                    label={
                      operationType === "withdrawal"
                        ? "تُدفع الاجور بشكل منفصل"
                        : "يُدفع المبلغ الاجور نقدًا بشكل منفصل"
                    }
                    sx={{
                      color: "#ddd",
                      fontSize: 13,
                      fontFamily: WALLET_FONT,
                    }}
                  />
                  <FormControlLabel
                    value="included"
                    control={
                      <Radio
                        sx={{
                          color: "#777",
                          "&.Mui-checked": { color: WALLET_COLORS.gold },
                        }}
                      />
                    }
                    label={
                      operationType === "withdrawal"
                        ? "تُقتطع الاجور من النقد المسلم"
                        : "تُقتطع الاجور من المبلغ الإلكتروني"
                    }
                    sx={{
                      color: "#ddd",
                      fontSize: 13,
                      fontFamily: WALLET_FONT,
                    }}
                  />
                </RadioGroup>
              </Box>
            </>
          )}

          <TextField
            label="تاريخ ووقت العملية"
            type="datetime-local"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={FIELD_SX}
          />

          <TextField
            label={isAdjustment ? "سبب التسوية (مطلوب)" : "ملاحظات"}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            multiline
            minRows={2}
            fullWidth
            sx={FIELD_SX}
          />

          <Alert
            severity={isAdjustment ? "warning" : "info"}
            sx={{
              bgcolor: isAdjustment
                ? "rgba(237,108,2,.10)"
                : "rgba(33,150,243,.09)",
              color: "#ddd",
            }}
          >
            {getOperationExplanation(operationType, feeMode)}
          </Alert>

          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: "#151515",
          borderTop: `1px solid ${WALLET_COLORS.goldBorder}`,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            color: "#ddd",
            borderColor: "#555",
            fontFamily: WALLET_FONT,
            textTransform: "none",
            ml: 1
          }}
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          form="wallet-operation-form"
          disabled={loading || availableCurrencies.length === 0}
          variant="contained"
          sx={{
            bgcolor: WALLET_COLORS.gold,
            color: "#111",
            fontWeight: 700,
            fontFamily: WALLET_FONT,
            textTransform: "none",
            minWidth: 130,
            "&:hover": { bgcolor: "#e5cf62" },
          }}
        >
          {loading
            ? "جار الحفظ..."
            : isEditing
            ? "حفظ التعديلات"
            : "تأكيد العملية"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
