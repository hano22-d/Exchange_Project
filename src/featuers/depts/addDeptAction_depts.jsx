import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { FaFileInvoice } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

export default function AddDeptAction({ open, onClose }) {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const bodyColor1 = "#252525";
  const bodyColor2 = "#111111";
  const mutedColor = "#aaaaaa";
  const fontFamily = "'Alyamama', sans-serif";

  // Field label
  const fieldLabelStyle = {
    color: primary,
    fontFamily,
    fontSize: 11,
    fontWeight: 600,
    mb: 0.7,
  };

  // Common input styles
  const commonInputStyles = {
    "& .MuiOutlinedInput-root": {
      height: 40,
      color: secondary,
      fontSize: 12,
      backgroundColor: bodyColor1,
      borderRadius: 1,
      transition: "all 0.2s ease",

      "& fieldset": {
        borderColor: "rgba(250,229,110,0.25)",
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
      padding: "12px 14px",
    },

    "& .MuiInputBase-input::placeholder": {
      color: mutedColor,
      opacity: 0.8,
    },

    "& .MuiSvgIcon-root": {
      color: primary,
    },

    "& input[type='date']": {
      colorScheme: "dark",
    },
  };

  const selectStyles = {
    width: "100%",

    "&.MuiInputBase-root": {
      height: 40,
      color: secondary,
      backgroundColor: bodyColor1,
      borderRadius: 1,
      fontFamily,
      fontSize: 12,
      transition: "all 0.2s ease",
    },

    "& .MuiSelect-select": {
      color: `${secondary} !important`,
      fontFamily,
      fontSize: 12,
      padding: "10px 14px",
      display: "flex",
      alignItems: "center",
      minHeight: "unset",
    },

    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(250,229,110,0.25)",
    },

    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: primary,
    },

    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: primary,
      borderWidth: 1.5,
    },

    "& .MuiSelect-icon": {
      color: primary,
    },
  };

  // Menu item styles
  const menuItemStyle = {
    fontFamily,
    fontSize: 12,
  };

  const cancelButtonStyle = {
    color: primary,
    borderColor: "rgba(250,229,110,0.6)",
    fontFamily,
    fontSize: 11,
    px: 3,
    py: 1,
    borderRadius: 2,
    transition: "all 0.2s ease",

    "&:hover": {
      borderColor: primary,
      backgroundColor: "rgba(250,229,110,0.08)",
    },
  };

  const submitButtonStyle = {
    color: bodyColor2,
    backgroundColor: primary,
    fontFamily,
    fontSize: 11,
    fontWeight: 700,
    px: 3,
    py: 1,
    borderRadius: 2,
    transition: "all 0.2s ease",

    "&:hover": {
      backgroundColor: "#e9d45e",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            width: "45vw",
            maxWidth: "700px",
            minWidth: "500px",
            background: "linear-gradient(180deg, #111111, #000000)",
            border: `1px solid ${primary}`,
            borderRadius: 2,
            p: 3,
            m: 2,
            overflow: "visible",
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <FaFileInvoice style={{ color: primary, fontSize: 15 }} />

          <Typography
            sx={{
              color: primary,
              fontFamily,
              fontSize: 15,
            }}
          >
            إضافة حركة دين جديدة
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            width: 30,
            height: 30,
            color: secondary,
            borderRadius: 1,
            transition: "all 0.2s ease",

            "&:hover": {
              backgroundColor: "rgba(255,0,0,0.8)",
            },
          }}
        >
          <IoClose style={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, overflow: "visible" }}>
        <Grid container rowSpacing={2} columnSpacing={3} sx={{ my: 2 }}>
          <Grid
            size={12}
            sx={{
              p: 2,
              backgroundColor: bodyColor1,
              borderRadius: 1,
            }}
          >
            <Typography sx={fieldLabelStyle}>الطرف المحدد:</Typography>

            <Typography
              sx={{
                color: secondary,
                fontFamily,
                fontSize: 14,
              }}
            >
              أحمد محمد علي
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography sx={fieldLabelStyle}>التاريخ:</Typography>

            <TextField
              size="small"
              fullWidth
              type="date"
              sx={commonInputStyles}
            />
          </Grid>

          <Grid size={6}>
            <Typography sx={fieldLabelStyle}>اتجاه الحركة:</Typography>

            <Select fullWidth defaultValue="none" sx={selectStyles}>
              <MenuItem value="none" sx={{ display: "none", ...menuItemStyle }}>
                اختر اتجاه الحركة
              </MenuItem>

              <MenuItem value="forUs" sx={menuItemStyle}>
                المكتب أعطى للطرف (لنا)
              </MenuItem>

              <MenuItem value="forTheir" sx={menuItemStyle}>
                الطرف أعطى للمكتب (علينا)
              </MenuItem>
            </Select>
          </Grid>

          <Grid size={6}>
            <Typography sx={fieldLabelStyle}>المبلغ:</Typography>

            <TextField
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

          <Grid size={6}>
            <Typography sx={fieldLabelStyle}>العملة:</Typography>

            <Select fullWidth defaultValue="none" sx={selectStyles}>
              <MenuItem value="none" sx={{ display: "none", ...menuItemStyle }}>
                اختر نوع العملة
              </MenuItem>

              <MenuItem value="USD" sx={menuItemStyle}>
                USD - دولار أمريكي
              </MenuItem>

              <MenuItem value="EUR" sx={menuItemStyle}>
                EUR - يورو
              </MenuItem>

              <MenuItem value="SYP" sx={menuItemStyle}>
                SYP - ليرة سورية
              </MenuItem>

              <MenuItem value="TRY" sx={menuItemStyle}>
                TRY - ليرة تركية
              </MenuItem>
            </Select>
          </Grid>

          <Grid size={12}>
            <Typography sx={fieldLabelStyle}>ملاحظات:</Typography>

            <TextField
              fullWidth
              type="text"
              placeholder="اكتب ملاحظة..."
              size="small"
              sx={commonInputStyles}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
          mt: 1,
        }}
      >
        <Button variant="outlined" onClick={onClose} sx={cancelButtonStyle}>
          إلغاء
        </Button>

        <Button variant="contained" onClick={onClose} sx={submitButtonStyle}>
          إضافة حركة
        </Button>
      </Box>
    </Dialog>
  );
}
