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
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import AddCardRoundedIcon from "@mui/icons-material/AddCardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { toDamascusDateTimeLocal, WALLET_COLORS, WALLET_FONT } from "./walletUiUtils";
import { SUPPORTED_CURRENCIES } from "../../shared/currencydata/currencies";


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

export default function AddWalletCurrencyDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  cashboxes = [],
  existingBalances = [],
}) {
  const [currency, setCurrency] = useState("");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [date, setDate] = useState(toDamascusDateTimeLocal());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const availableCurrencies = useMemo(() => {
    const existing = new Set(existingBalances.map((item) => item.currency));
    const activeCashboxCurrencies = new Set(
      cashboxes.filter((item) => item.active).map((item) => item.currency)
    );

    return SUPPORTED_CURRENCIES.filter(
      (item) =>
        activeCashboxCurrencies.has(item.code) && !existing.has(item.code)
    );
  }, [cashboxes, existingBalances]);

  useEffect(() => {
    if (!open) return;
    setCurrency(availableCurrencies[0]?.code ?? "");
    setOpeningBalance("0");
    setDate(toDamascusDateTimeLocal());
    setNote("");
    setError("");
  }, [open, availableCurrencies]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const amount = Number(openingBalance);
    if (!currency) {
      setError(
        "لا توجد عملة متاحة للإضافة. تأكد من وجود صندوق نقدي نشط للعملة."
      );
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      setError("الرصيد الافتتاحي يجب أن يكون صفرًا أو أكبر.");
      return;
    }

    try {
      await onConfirm({ currency, openingBalance: amount, date, note });
    } catch (submitError) {
      setError(submitError?.message || "تعذرت إضافة العملة.");
    }
  }

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
          <AddCardRoundedIcon sx={{ color: WALLET_COLORS.gold }} />
          <Typography
            sx={{
              color: WALLET_COLORS.gold,
              fontFamily: WALLET_FONT,
              fontWeight: 700,
            }}
          >
            إضافة عملة إلى المحفظة
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={loading} sx={{ color: "#aaa" }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box
          component="form"
          id="wallet-currency-form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}
        >
          {availableCurrencies.length === 0 ? (
            <Alert severity="warning">
              لا توجد عملات متاحة للإضافة حاليًا. يجب أن يكون لديك صندوق نقدي
              نشط للعملة، كما لا يمكن إضافة العملة نفسها مرتين إلى المحفظة.
            </Alert>
          ) : (
            <>
              <FormControl fullWidth sx={FIELD_SX}>
                <InputLabel id="wallet-currency-label">العملة</InputLabel>
                <Select
                  labelId="wallet-currency-label"
                  value={currency}
                  label="العملة"
                  onChange={(event) => setCurrency(event.target.value)}
                >
                  {availableCurrencies.map((item) => (
                    <MenuItem key={item.code} value={item.code}>
                      {item.nameAr} ({item.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="الرصيد الافتتاحي"
                type="number"
                value={openingBalance}
                onChange={(event) => setOpeningBalance(event.target.value)}
                inputProps={{ min: 0, step: "any" }}
                fullWidth
                sx={FIELD_SX}
              />

              <TextField
                label="تاريخ الرصيد الافتتاحي"
                type="datetime-local"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={FIELD_SX}
              />

              <TextField
                label="ملاحظة"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                multiline
                minRows={2}
                fullWidth
                sx={FIELD_SX}
              />

              <Alert severity="info">
                الرصيد الافتتاحي يضاف إلى رصيد المحفظة فقط، ولا يغيّر رصيد
                الصندوق النقدي.
              </Alert>
            </>
          )}
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
          }}
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          form="wallet-currency-form"
          disabled={loading || availableCurrencies.length === 0}
          variant="contained"
          sx={{
            bgcolor: WALLET_COLORS.gold,
            color: "#111",
            fontWeight: 700,
            fontFamily: WALLET_FONT,
            textTransform: "none",
            "&:hover": { bgcolor: "#e5cf62" },
          }}
        >
          {loading ? "جار الإضافة..." : "إضافة العملة"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
