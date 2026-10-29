import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Divider,
  Button,
} from "@mui/material";

import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import { FaLeftLong } from "react-icons/fa6";

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

const commonInputStyles = {
  "& .MuiOutlinedInput-root": {
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

export default function Exchange() {
  return (
    <Box
      component="form"
      sx={{
        width: "100%",
        display: "flex",
        boxSizing: "border-box",
        p: 4,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
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
            mb: 4,
          }}
        >
          <CurrencyExchangeIcon sx={{ color: primary, fontSize: 30 }} />

          <Typography
            sx={{
              color: primary,
              fontFamily,
              fontSize: 25,
              fontWeight: "bold",
            }}
          >
            عملية صرف جديدة
          </Typography>
        </Box>

        <Divider
          sx={{
            borderColor: borderColor,
            mb: 4,
          }}
        />

        {/* التاريخ والوقت */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography sx={labelStyles}>التاريخ والوقت</Typography>

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

        {/* الأعمدة الثلاثة */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* المبلغ والعملة المستلمة */}
          <Box sx={{ minWidth: 380 }}>
            <Typography sx={labelStyles}>العملة المستلمة</Typography>

            <Select
              fullWidth
              sx={{
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

            <Typography sx={labelStyles}>المبلغ المستلم</Typography>

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

          {/*  الايقونة */}
          <FaLeftLong
            style={{
              color: primary,
              fontSize: 40,
              backgroundColor: darkBackground,
              border: `1.5px solid ${primary}`,
              borderRadius: "50%",
              padding: 10,
            }}
          />

          {/* العملة والمبلغ المدفوع */}
          <Box sx={{ minWidth: 380 }}>
            <Typography sx={labelStyles}>العملة المدفوعة</Typography>

            <Select
              fullWidth
              sx={{
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

            <Typography sx={labelStyles}>المبلغ المدفوع</Typography>

            <Box
              sx={{
                width: "100%",
                height: `${FIELD_HEIGHT}px`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                border: `1px solid ${borderColor}`,
                borderRadius: 2,
                backgroundColor: "rgba(250,229,110,0.08)",
              }}
            >
              <Typography
                sx={{
                  color: secondary,
                  fontFamily,
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                --
              </Typography>

              <Typography
                sx={{
                  color: primary,
                  fontFamily,
                  fontSize: 18,
                }}
              >
                (SYP)
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ alignSelf: "center", justifySelf: "center" }}>
          <Typography sx={{ ...labelStyles }}>سعر الصرف</Typography>

          <TextField
            type="number"
            placeholder="أدخل سعر الصرف"
            sx={{
              ...commonInputStyles,
              width: "300px",
              mb: 2,

              // ازالة الشريط الجانبي للحقل
              "& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button":
                {
                  WebkitAppearance: "none",
                },
            }}
          />
        </Box>

        {/* الملاحظات */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={labelStyles}>الملاحظات</Typography>

          <TextField
            multiline
            rows={2}
            placeholder="أضف ملاحظات حول عملية الصرف..."
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

        <Divider
          sx={{
            borderColor: borderColor,
            mb: 3,
          }}
        />

        {/* أزرار الواجهة */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <Button
            variant="contained"
            sx={{
              width: "250px",
              height: "48px",
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
            تنفيذ العملية
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
