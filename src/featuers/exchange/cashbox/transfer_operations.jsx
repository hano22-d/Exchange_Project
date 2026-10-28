import {
  Box,
  Divider,
  Paper,
  TextField,
  Typography,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import { FaMoneyBillTransfer } from "react-icons/fa6";

export default function Transfer() {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const text = "black";
  const darkBackground = "#232323";
  const fontFamily = "'Alyamama', sans-serif";
  const borderColor = "rgba(250,229,110,0.45)";

  const FIELD_HEIGHT = 56;

  const currencyOptions = [
    { value: "SYP", label: "ليرة سورية (SYP)" },
    { value: "USD", label: "دولار أمريكي (USD)" },
    { value: "EUR", label: "يورو (EUR)" },
    { value: "TRY", label: "ليرة تركية (TRY)" },
  ];

  const transferType = [
    { value: "صادرة", label: "صادرة" },
    { value: "واردة", label: "واردة" },
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

  const labelStyles = {
    color: primary,
    fontFamily,
    fontSize: 14,
    marginBottom: 1,
  };
  return (
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
            تفاصيل الحوالة
          </Typography>
        </Box>
        <Divider
          sx={{
            borderColor: borderColor,
            my: 4,
          }}
        />

        {/* صناديق حقول البحث */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* الحقول الثلاثة الاولى */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={labelStyles}>التاريخ</Typography>
              <TextField
                type="datetime-local"
                sx={{
                  ...commonInputStyles,
                  width: "300px",

                  "& input": {
                    color: secondary,
                    colorScheme: "dark",
                  },
                }}
              />
            </Box>
            <Box>
              <Typography sx={labelStyles}> الاسم الثلاثي</Typography>
              <TextField
                type="text"
                placeholder="أدخل الأسم الثلاثي"
                fullWidth
                sx={{ ...commonInputStyles }}
              />
            </Box>
            <Box>
              <Typography sx={labelStyles}>نوع الحوالة</Typography>
              <Select
                fullWidth
                sx={{
                  width: 300,
                  ...commonInputStyles,
                  height: `${FIELD_HEIGHT}px`,
                  marginBottom: 2.5,
                  borderRadius: 2,

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: borderColor,
                  },

                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: primary,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: secondary,
                  },

                  backgroundColor: darkBackground,
                  color: secondary,
                }}
              >
                {transferType.map((currency) => (
                  <MenuItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
          {/* الحقول الثلاثة الثانية */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={labelStyles}>المبلغ</Typography>
              <TextField
                type="number"
                placeholder="أدخل المبلغ"
                fullWidth
                sx={{
                  ...commonInputStyles,

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
            <Box>
              <Typography sx={labelStyles}>العملة</Typography>
              <Select
                fullWidth
                sx={{
                  width: 300,
                  ...commonInputStyles,
                  height: `${FIELD_HEIGHT}px`,
                  marginBottom: 2.5,
                  borderRadius: 2,

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: borderColor,
                  },

                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: primary,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: secondary,
                  },

                  backgroundColor: darkBackground,
                  color: secondary,
                }}
              >
                {currencyOptions.map((currency) => (
                  <MenuItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box>
              <Typography sx={labelStyles}>الوجهة</Typography>
              <TextField
                type="text"
                placeholder="أدخل الوجهة"
                fullWidth
                sx={{ ...commonInputStyles }}
              />
            </Box>
          </Box>
          {/* حقل الملاح */}
          <Box>
            <Typography sx={labelStyles}>الملاحظات</Typography>
            <TextField
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
          تسجيل الحوالة
        </Button>
      </Paper>
    </Box>
  );
}
