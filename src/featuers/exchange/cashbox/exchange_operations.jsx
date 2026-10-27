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
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

const primary = "rgba(250,229,110,0.992)";
const secondary = "#ffffff";
const darkBackground = "#232323";
const fontFamily = "'Alyamama', sans-serif";

const FIELD_HEIGHT = 56;
const FORM_WIDTH = 1200;

const currencyOptions = [
  { value: "SYP", label: "ليرة سورية (SYP)" },
  { value: "USD", label: "دولار أمريكي (USD)" },
  { value: "EUR", label: "يورو (EUR)" },
  { value: "TRY", label: "ليرة تركية (TRY)" },
];

const commonInputStyles = {
  "& .MuiOutlinedInput-root": {
    height: `${FIELD_HEIGHT}px`,
    boxSizing: "border-box",
    color: secondary,
    backgroundColor: darkBackground,
    fontFamily,
    borderRadius: "8px",

    "& fieldset": {
      borderColor: "rgba(250,229,110,0.45)",
    },

    "&:hover fieldset": {
      borderColor: primary,
    },

    "&.Mui-focused fieldset": {
      borderColor: primary,
      borderWidth: "2px",
    },
  },

  "& .MuiInputBase-input": {
    fontFamily,
    boxSizing: "border-box",
  },

  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    height: `${FIELD_HEIGHT}px`,
    boxSizing: "border-box",
    paddingTop: 0,
    paddingBottom: 0,
  },

  "& .MuiSvgIcon-root": {
    color: primary,
  },
};

const labelStyles = {
  display: "block",
  color: primary,
  fontFamily,
  fontSize: "14px",
  marginBottom: "10px",
  textAlign: "right",
};

const currencyMenuProps = {
  PaperProps: {
    sx: {
      backgroundColor: darkBackground,
      color: secondary,
      fontFamily,

      "& .MuiMenuItem-root": {
        fontFamily,
        minHeight: "44px",
        justifyContent: "flex-end",

        "&:hover": {
          backgroundColor: "rgba(250,229,110,0.12)",
        },

        "&.Mui-selected": {
          backgroundColor: "rgba(250,229,110,0.18)",
        },
      },
    },
  },
};

export default function Exchange() {
  return (
    <Box
      dir="rtl"
      sx={{
        width: "100%",
        minWidth: "1000px",
        boxSizing: "border-box",
        padding: "24px",
        display: "flex",
        justifyContent: "center",
        fontFamily,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: `${FORM_WIDTH}px`,
          minWidth: "950px",
          boxSizing: "border-box",
          padding: "32px",
          backgroundColor: "#111111",
          color: secondary,
          border: "1px solid rgba(250,229,110,0.25)",
          borderRadius: "14px",
          fontFamily,
        }}
      >
        {/* عنوان النموذج */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          <CurrencyExchangeIcon sx={{ color: primary, fontSize: "32px" }} />

          <Typography
            sx={{
              color: primary,
              fontFamily,
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            عملية صرف جديدة
          </Typography>
        </Box>

        <Divider
          sx={{
            borderColor: "rgba(250,229,110,0.25)",
            marginBottom: "28px",
          }}
        />

        {/* التاريخ والوقت */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <Typography sx={labelStyles}>التاريخ والوقت</Typography>

          <TextField
            type="datetime-local"
            lang="en-US"
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
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "24px",
            alignItems: "start",
            marginBottom: "28px",
          }}
        >
          {/* العملة والمبلغ المستلم */}
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={labelStyles}>العملة المستلمة</Typography>

            <Select
              defaultValue="USD"
              fullWidth
              MenuProps={currencyMenuProps}
              sx={{
                ...commonInputStyles,
                height: `${FIELD_HEIGHT}px`,
                marginBottom: "20px",
                borderRadius: "8px",

                // الحالة العادية
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(250,229,110,0.45)",
                  borderWidth: "1px",
                },

                // عند مرور المؤشر
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: primary,
                },

                // عند الضغط أو التركيز
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: primary,
                  borderWidth: "2px",
                },

                // النص الظاهر داخل الحقل
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  height: `${FIELD_HEIGHT}px`,
                  boxSizing: "border-box",
                  padding: "0 14px",
                  color: secondary,
                  fontFamily,
                  textAlign: "right",
                },

                // السهم
                "& .MuiSelect-icon": {
                  color: primary,
                },

                // الخلفية في جميع الحالات
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

          {/* سعر الصرف */}
          <Box
            sx={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
            }}
          >
            <Box
              sx={{
                height: "24px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <CompareArrowsIcon
                sx={{
                  color: primary,
                  fontSize: "50px",
                  backgroundColor: "#232323",
                  border: `1.5px solid ${primary}`,
                  borderRadius: "50%",
                  p: 0.7,
                  mt: 10,
                }}
              />
            </Box>

            <Typography sx={{ ...labelStyles, mt: 5 }}>سعر الصرف</Typography>

            <TextField
              type="number"
              placeholder="أدخل سعر الصرف"
              fullWidth
              sx={{
                ...commonInputStyles,
                marginBottom: "20px",

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

            <Button
              variant="outlined"
              sx={{
                width: "100%",
                height: `${FIELD_HEIGHT}px`,
                boxSizing: "border-box",
                borderRadius: "8px",
                borderColor: primary,
                color: primary,
                fontFamily,
                fontSize: "15px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                mt: 2,
                "&:hover": {
                  borderColor: primary,
                  backgroundColor: "rgba(250,229,110,0.10)",
                },
              }}
            >
              احسب المبلغ
            </Button>
          </Box>

          {/* العملة والمبلغ المدفوع */}
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={labelStyles}>العملة المدفوعة</Typography>

            <Select
              defaultValue="SYP"
              fullWidth
              MenuProps={currencyMenuProps}
              sx={{
                ...commonInputStyles,
                height: `${FIELD_HEIGHT}px`,
                marginBottom: "20px",
                borderRadius: "8px",

                // الحالة العادية
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(250,229,110,0.45)",
                  borderWidth: "1px",
                },

                // عند مرور المؤشر
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: primary,
                },

                // عند الضغط أو التركيز
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: primary,
                  borderWidth: "2px",
                },

                // النص الظاهر داخل الحقل
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  height: `${FIELD_HEIGHT}px`,
                  boxSizing: "border-box",
                  padding: "0 14px",
                  color: secondary,
                  fontFamily,
                  textAlign: "right",
                },

                // السهم
                "& .MuiSelect-icon": {
                  color: primary,
                },

                // الخلفية في جميع الحالات
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
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                overflow: "hidden",
                border: "1px solid rgba(250,229,110,0.45)",
                borderRadius: "8px",
                backgroundColor: "rgba(250,229,110,0.08)",
              }}
            >
              <Typography
                sx={{
                  color: "#999999",
                  fontFamily,
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                —
              </Typography>

              <Typography
                sx={{
                  color: primary,
                  fontFamily,
                  fontSize: "13px",
                }}
              >
                SYP
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* الملاحظات */}
        <Box sx={{ marginBottom: "28px" }}>
          <Typography sx={labelStyles}>الملاحظات</Typography>

          <TextField
            multiline
            rows={3}
            placeholder="أضف ملاحظات حول عملية الصرف..."
            fullWidth
            sx={{
              width: "100%",

              "& .MuiOutlinedInput-root": {
                color: secondary,
                backgroundColor: darkBackground,
                fontFamily,
                borderRadius: "8px",
                alignItems: "flex-start",

                "& fieldset": {
                  borderColor: "rgba(250,229,110,0.45)",
                },

                "&:hover fieldset": {
                  borderColor: primary,
                },

                "&.Mui-focused fieldset": {
                  borderColor: primary,
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
            borderColor: "rgba(250,229,110,0.25)",
            marginBottom: "24px",
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
              width: "180px",
              height: "48px",
              borderRadius: "8px",
              backgroundColor: primary,
              color: "#111111",
              fontFamily,
              fontSize: "15px",
              fontWeight: "bold",

              "&:hover": {
                backgroundColor: "#e6cf55",
              },
            }}
          >
            تنفيذ العملية
          </Button>

          <Button
            variant="outlined"
            sx={{
              width: "180px",
              height: "48px",
              borderRadius: "8px",
              borderColor: "#888888",
              color: secondary,
              fontFamily,
              fontSize: "15px",

              "&:hover": {
                borderColor: primary,
                backgroundColor: "rgba(250,229,110,0.06)",
              },
            }}
          >
            إلغاء
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
