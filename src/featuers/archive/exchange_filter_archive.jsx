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
import useCashboxces from "../../hooks/cashbox_Hooks/usecashboxes";
import { getSupportedCurrency } from "../../shared/currencydata/currencies";

export default function ExFilter({ filters, onChange, onSearch }) {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const text = "black";
  const darkBackground = "#232323";
  const fontFamily = "'Alyamama', sans-serif";
  const borderColor = "rgba(250,229,110,0.45)";

  const FIELD_HEIGHT = 40;

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

  //services
  const { cashboxes } = useCashboxces();

  //functions
  function handleInputOnchange(event) {
    const { name, value } = event.target;

    onChange((prevFilters) => {
      return { ...prevFilters, [name]: value };
    });
  }

  // قائمة العملات حسب الصناديق المنشأة
  const viewCreatedCashboxes = cashboxes.map((cashbox) => {
    if (!cashbox) {
      return null;
    }
    const getNameAr = getSupportedCurrency(cashbox.currency).nameAr;
    const currencyLabel = `${cashbox.currency} - ${getNameAr}`;

    return {
      value: cashbox.currency,
      currencyLabel,
    };
  });

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
      <Box sx={{ display: "flex", justifyContent: "center", gap: 6, ml: 6 }}>
        <Box>
          <Typography sx={labelStyles}>التاريخ من:</Typography>
          <TextField
            name="dateFrom"
            type="date"
            value={filters.dateFrom}
            onChange={handleInputOnchange}
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
            name="dateTo"
            type="date"
            value={filters.dateTo}
            onChange={handleInputOnchange}
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
      <Box sx={{ display: "flex", gap: 6, mt: 2 }}>
        <Box>
          <Typography sx={labelStyles}>العملة من:</Typography>
          <Select
            name="fromCurrency"
            fullWidth
            value={filters.fromCurrency}
            onChange={handleInputOnchange}
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
            {viewCreatedCashboxes.map((currency) => (
              <MenuItem key={currency.value} value={currency.value}>
                {currency.currencyLabel}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box>
          <Typography sx={labelStyles}>العملة إلى:</Typography>
          <Select
            name="toCurrency"
            fullWidth
            value={filters.toCurrency}
            onChange={handleInputOnchange}
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
            {viewCreatedCashboxes.map((currency) => (
              <MenuItem key={currency.value} value={currency.value}>
                {currency.currencyLabel}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
      <Typography sx={labelStyles}>الملاحظات</Typography>
      <TextField
        name="note"
        multiline
        rows={1}
        placeholder="ابحث في ملاحظات الصرف ..."
        value={filters.note}
        onChange={handleInputOnchange}
        sx={{
          width: "93%",
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
          onClick={onSearch}
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
