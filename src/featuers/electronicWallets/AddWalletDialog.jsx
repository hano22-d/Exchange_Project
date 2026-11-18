import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useBlobObjectUrl, WALLET_COLORS, WALLET_FONT } from "./walletUiUtils";


const FIELD_SX = {
  "& .MuiInputLabel-root": { color: "#a9a9a9", fontFamily: WALLET_FONT },
  "& .MuiInputLabel-root.Mui-focused": { color: WALLET_COLORS.gold },
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    bgcolor: "#151515",
    borderRadius: 2,
    fontFamily: WALLET_FONT,
    "& fieldset": { borderColor: WALLET_COLORS.goldBorder },
    "&:hover fieldset": { borderColor: WALLET_COLORS.gold },
    "&.Mui-focused fieldset": { borderColor: WALLET_COLORS.gold },
  },
};

export default function AddWalletDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  initialWallet = null,
}) {
  const isEditing = Boolean(initialWallet);

  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [note, setNote] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [removeExistingLogo, setRemoveExistingLogo] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [duplicateWallets, setDuplicateWallets] = useState([]);
  const [formError, setFormError] = useState("");

  const logoPreview = useBlobObjectUrl(
    logoFile || (removeExistingLogo ? null : initialWallet?.logo)
  );

  useEffect(() => {
    if (!open) return;

    setName(initialWallet?.name ?? "");
    setProvider(initialWallet?.provider ?? "");
    setNote(initialWallet?.note ?? "");
    setLogoFile(null);
    setRemoveExistingLogo(false);
    setDuplicateWarning(false);
    setDuplicateWallets([]);
    setFormError("");
  }, [open, initialWallet]);

  async function submitForm(event, confirmDuplicate = false) {
    event?.preventDefault();
    setFormError("");

    const payload = {
      name: name.trim(),
      provider: provider.trim(),
      note: note.trim(),
    };

    // إذا لم يرفع المستخدم شعارًا جديدًا نحافظ على الشعار القديم عند التعديل.
    if (logoFile) {
      payload.logo = logoFile;
    } else if (isEditing && removeExistingLogo) {
      payload.logo = null;
    }

    if (!payload.name || !payload.provider) {
      setFormError("يرجى إدخال اسم المحفظة ومزود الخدمة.");
      return;
    }

    if (confirmDuplicate) {
      payload.confirmDuplicateProvider = true;
    }

    try {
      await onConfirm(payload);
      setDuplicateWarning(false);
    } catch (error) {
      if (error?.code === "DUPLICATE_WALLET_PROVIDER") {
        setDuplicateWallets(error.duplicateWallets ?? []);
        setDuplicateWarning(true);
        return;
      }

      setFormError(error?.message || "تعذر حفظ بيانات المحفظة.");
    }
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("يرجى اختيار ملف صورة صالح.");
      event.target.value = "";
      return;
    }

    setLogoFile(file);
    setRemoveExistingLogo(false);
    setFormError("");
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
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#151515",
          borderBottom: `1px solid ${WALLET_COLORS.goldBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
          <AccountBalanceWalletRoundedIcon
            sx={{ color: WALLET_COLORS.gold, fontSize: 28 }}
          />
          <Typography
            sx={{
              color: WALLET_COLORS.gold,
              fontFamily: WALLET_FONT,
              fontWeight: 700,
              fontSize: 19,
            }}
          >
            {isEditing ? "تعديل بيانات المحفظة" : "إضافة محفظة إلكترونية"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={loading} sx={{ color: "#aaa" }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Box
          component="form"
          id="wallet-form"
          onSubmit={submitForm}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              variant="rounded"
              src={logoPreview || undefined}
              sx={{
                width: 76,
                height: 76,
                borderRadius: 3,
                bgcolor: WALLET_COLORS.goldSoft,
                color: WALLET_COLORS.gold,
                border: `1px solid ${WALLET_COLORS.goldBorder}`,
                "& img": { objectFit: "contain", p: 0.5 },
              }}
            >
              <AccountBalanceWalletRoundedIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.8,
                alignItems: "flex-start",
              }}
            >
              <Button
                component="label"
                variant="outlined"
                startIcon={<AddPhotoAlternateRoundedIcon />}
                sx={{
                  color: WALLET_COLORS.gold,
                  borderColor: WALLET_COLORS.goldBorder,
                  fontFamily: WALLET_FONT,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: WALLET_COLORS.gold,
                    bgcolor: WALLET_COLORS.goldSoft,
                  },
                }}
              >
                {logoPreview ? "تغيير الشعار" : "إضافة شعار"}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </Button>
              {(logoPreview || initialWallet?.logo) && (
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  onClick={() => {
                    setLogoFile(null);
                    setRemoveExistingLogo(true);
                  }}
                  sx={{ fontFamily: WALLET_FONT, textTransform: "none" }}
                >
                  إزالة الشعار
                </Button>
              )}
            </Box>
          </Box>

          <TextField
            label="اسم المحفظة"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
            required
            autoFocus
            sx={FIELD_SX}
          />

          <TextField
            label="مزود الخدمة"
            placeholder="مثال: شام كاش"
            value={provider}
            onChange={(event) => {
              setProvider(event.target.value);
              setDuplicateWarning(false);
            }}
            fullWidth
            required
            sx={FIELD_SX}
          />

          <TextField
            label="ملاحظات (اختياري)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={FIELD_SX}
          />

          <Alert
            severity="info"
            sx={{
              bgcolor: "rgba(33,150,243,.09)",
              color: "#cbdff5",
              alignItems: "center",
            }}
          >
            إضافة المحفظة لا تنشئ عملة أو رصيدًا. ستضيف العملات وأرصدتها من صفحة
            تفاصيل المحفظة.
          </Alert>

          {duplicateWarning && (
            <Alert
              severity="warning"
              action={
                <Button
                  color="inherit"
                  size="small"
                  disabled={loading}
                  onClick={(event) => submitForm(event, true)}
                  sx={{
                    whiteSpace: "nowrap",
                    fontWeight: 700,
                    fontFamily: WALLET_FONT,
                  }}
                >
                  تأكيد الإضافة
                </Button>
              }
            >
              يوجد {duplicateWallets.length || "مزود آخر"} مسجل بالمزود نفسه.
              يمكنك المتابعة بعد التأكيد.
              {duplicateWallets.length > 0 && (
                <Box component="ul" sx={{ my: 0.5, pl: 2 }}>
                  {duplicateWallets.map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </Box>
              )}
            </Alert>
          )}

          {formError && <Alert severity="error">{formError}</Alert>}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: "#151515",
          borderTop: `1px solid ${WALLET_COLORS.goldBorder}`,
          gap: 1,
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
          form="wallet-form"
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: WALLET_COLORS.gold,
            color: "#111",
            fontWeight: 700,
            fontFamily: WALLET_FONT,
            textTransform: "none",
            minWidth: 135,
            "&:hover": { bgcolor: "#e5cf62" },
          }}
        >
          {loading
            ? "جار الحفظ..."
            : isEditing
            ? "حفظ التعديلات"
            : "إضافة المحفظة"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
