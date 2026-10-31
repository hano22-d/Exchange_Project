import { useState } from "react";
import {
  Box,
  Divider,
  Typography,
  TextField,
  Container,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { FaSearch } from "react-icons/fa";

export default function TrFilter({ onSearch }) {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const text = "black";
  const darkBackground = "#232323";
  const fontFamily = "'Alyamama', sans-serif";
  const borderColor = "rgba(250,229,110,0.45)";

  const FIELD_HEIGHT = 40;

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [fullName, setFullName] = useState("");
  const [direction, setDirection] = useState("");
  const [currency, setCurrency] = useState("");
  const [note, setNote] = useState("");

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

  const currencyOptions = [
    { value: "SYP", label: "ليرة سورية (SYP)" },
    { value: "USD", label: "دولار أمريكي (USD)" },
    { value: "EUR", label: "يورو (EUR)" },
    { value: "TRY", label: "ليرة تركية (TRY)" },
  ];

  const handleSearch = () => {
    onSearch({
      dateFrom,
      dateTo,
      fullName,
      direction,
      currency,
      note,
    });
  };

  return (
    <Container
      sx={{
        width: "55vw",
        border: `1px solid ${primary}`,
        borderRadius: 2,
        p: 3,
        my: 4,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", gap: 6 }}>
        <Box>
          <Typography sx={labelStyles}>التاريخ من:</Typography>
          <TextField
            type="datetime-local"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
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
          <Typography sx={labelStyles}>التاريخ إلى:</Typography>
          <TextField
            type="datetime-local"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
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
      </Box>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 2 }}
      >
        <Box>
          <Typography sx={labelStyles}> الاسم الثلاثي:</Typography>
          <TextField
            type="text"
            placeholder="أدخل الأسم الثلاثي"
            fullWidth
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            sx={{ width: 200, ...commonInputStyles }}
          />
        </Box>

        <Box>
          <Typography sx={labelStyles}> الوجهة:</Typography>
          <Box>
            <Select
              fullWidth
              displayEmpty
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              sx={{
                width: 200,
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
              <MenuItem value="outgoing">حوالة صادرة</MenuItem>
              <MenuItem value="incoming">حوالة واردة</MenuItem>
            </Select>
          </Box>
        </Box>

        <Box>
          <Typography sx={labelStyles}>العملة:</Typography>
          <Select
            fullWidth
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            sx={{
              width: 200,
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
      </Box>
      <Typography sx={labelStyles}>الملاحظات</Typography>
      <TextField
        multiline
        rows={1}
        placeholder="ابحث في ملاحظات الحوالات ..."
        fullWidth
        value={note}
        onChange={(e) => setNote(e.target.value)}
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
      <Divider sx={{ backgroundColor: primary, my: 2 }} />
      {/* زر البحث فقط في المنتصف */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            width: 200,
            display: "flex",
            borderRadius: 2,
            backgroundColor: primary,
            color: text,
            fontFamily,
            fontSize: 15,
            fontWeight: "bold",
            gap: 0.5,
            "&:hover": {
              backgroundColor: primary,
            },
          }}
        >
          <FaSearch />
          <Typography>بحث</Typography>
        </Button>
      </Box>
    </Container>
  );
}