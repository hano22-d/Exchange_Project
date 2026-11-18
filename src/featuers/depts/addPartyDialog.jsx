import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Divider,
  Zoom,
} from "@mui/material";
import {
  CloseRounded,
  PersonAddAlt1Rounded,
  PhoneAndroidRounded,
} from "@mui/icons-material";

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 2.5,
    color: "#f8fafc",
    transition: "all 0.25s ease",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.14)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(214, 181, 109, 0.5)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#D6B56D",
      borderWidth: "1.5px",
    },
    "&.Mui-focused": {
      bgcolor: "rgba(214, 181, 109, 0.04)",
      boxShadow: "0 0 0 3px rgba(214, 181, 109, 0.12)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#94a3b8",
    right: 38,
    left: "auto",
    transformOrigin: "top right",
    "&.Mui-focused": {
      color: "#D6B56D",
    },
    "&.MuiInputLabel-shrink": {
      right: 22,
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    textAlign: "right",
  },
  "& .MuiFormHelperText-root": {
    textAlign: "right",
    mx: 0.5,
  },
};

export function AddPartyDialog({ open, onClose, onAdd, loading }) {
  const [addPartyForm, setAddPartyForm] = useState({
    fullName: "",
    phoneNumber: "",
  });

  // ==== functions ==== //
  function handleInputOnchange(event) {
    const { name, value } = event.target;

    setAddPartyForm((prevValue) => {
      return { ...prevValue, [name]: value };
    });
  }

  // دالة تفريغ المدخلات
  function handleResetAndClose() {
    setAddPartyForm({
      fullName: "",
      fhoneNumber: "",
    });
    onClose?.();
  }

  // دالة ارسال بيانات الجهة
  function handleSubmit(event) {
    event.preventDefault();

    onAdd(addPartyForm);
  }

  return (
    <Dialog
      open={open}
      onClose={handleResetAndClose}
      dir="rtl"
      maxWidth="xs"
      fullWidth
      TransitionComponent={Zoom}
      transitionDuration={300}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.64)",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: "12%",
          right: "12%",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, #D6B56D, #00d9ff, #D6B56D, transparent)",
        }}
      />

      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          pt: 2.5,
          pb: 2,
          bgcolor: "#111",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(214, 181, 109, 0.12)",
              border: "1px solid rgba(214, 181, 109, 0.35)",
              color: "#D6B56D",
            }}
          >
            <PersonAddAlt1Rounded fontSize="small" />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: "#f8fafc", lineHeight: 1.2 }}
            >
              إضافة جهة دين جديدة
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              تسجيل حساب ذمم جديد في دفتر الديون
            </Typography>
          </Box>
        </Box>

        <IconButton
          aria-label="إغلاق"
          onClick={handleResetAndClose}
          size="small"
          sx={{
            color: "#94a3b8",
            bgcolor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            transition: "all 0.2s ease",
            "&:hover": {
              color: "#f87171",
              bgcolor: "rgba(239, 68, 68, 0.12)",
              borderColor: "rgba(239, 68, 68, 0.35)",
              transform: "rotate(90deg)",
            },
          }}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.07)" }} />

      <DialogContent sx={{ px: 3, py: 3, bgcolor: "#111" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            autoFocus
            fullWidth
            label="اسم جهة الدين"
            placeholder="مثال: شركة النور أو اسم الشخص"
            name="fullName"
            value={addPartyForm.fullName}
            onChange={handleInputOnchange}
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{ ml: 1, mr: 0 }}
                ></InputAdornment>
              ),
            }}
            sx={inputStyles}
          />

          <TextField
            fullWidth
            label="رقم الهاتف (اختياري)"
            placeholder="09xxxxxxxx"
            name="phoneNumber"
            value={addPartyForm.phoneNumber}
            onChange={handleInputOnchange}
            inputProps={{
              dir: "ltr",
              style: { textAlign: "right" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 1, mr: 0 }}>
                  <PhoneAndroidRounded
                    sx={{ color: "#00d9ff", fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            }}
            sx={inputStyles}
          />
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.07)" }} />

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1.5,
          justifyContent: "flex-start",
          bgcolor: "#111",
        }}
      >
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            fontWeight: 800,
            fontSize: "0.9rem",
            color: "#111111",
            background:
              "linear-gradient(135deg, #f3d796 0%, #D6B56D 55%, #b89448 100%)",
            boxShadow: "0 6px 20px -4px rgba(214, 181, 109, 0.45)",
            transition: "all 0.2s ease",
            "& .MuiButton-startIcon": {
              ml: 0.8,
              mr: 0,
            },
            "&:hover": {
              background:
                "linear-gradient(135deg, #f8e2ad 0%, #dfc07a 55%, #c5a052 100%)",
              transform: "translateY(-1px)",
              boxShadow: "0 10px 24px -4px rgba(214, 181, 109, 0.6)",
            },
          }}
        >
          {loading ? "جار الإضافة" : "إضافة"}
        </Button>

        <Button
          type="button"
          variant="outlined"
          onClick={handleResetAndClose}
          sx={{
            px: 2.5,
            py: 1,
            borderRadius: 2,
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "#94a3b8",
            borderColor: "rgba(255, 255, 255, 0.14)",
            bgcolor: "rgba(255, 255, 255, 0.02)",
            "&:hover": {
              color: "#f8fafc",
              borderColor: "rgba(255, 255, 255, 0.3)",
              bgcolor: "rgba(255, 255, 255, 0.06)",
            },
          }}
        >
          إلغاء
        </Button>
      </DialogActions>
    </Dialog>
  );
}
