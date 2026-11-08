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
import { viewCreatedCashboxes } from "../../shared/utils";

export default function TrFilter({ filters, onChange, onSearch }) {
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

  // =================================
  //   services
  // =================================
  const { cashboxes } = useCashboxces();

  // =================================
  // functions
  // =================================
  function handleInputChange(event) {
    const { name, value } = event.target;

    onChange((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  }

  // قائمة العملات حسب الصناديق المنشأة
  const currencies = viewCreatedCashboxes(cashboxes);

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
      {/* التاريخ */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Box>
          <Typography sx={labelStyles}>التاريخ من:</Typography>

          <TextField
            name="dateFrom"
            type="date"
            value={filters.dateFrom}
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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

      {/* الاسم والاتجاه والعملة */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          mt: 2,
        }}
      >
        {/* الاسم الثلاثي */}

        <Box>
          <Typography sx={labelStyles}>الاسم الثلاثي:</Typography>

          <TextField
            name="fullname"
            type="text"
            placeholder="أدخل الاسم الثلاثي"
            fullWidth
            value={filters.fullname}
            onChange={handleInputChange}
            sx={{
              width: 200,
              ...commonInputStyles,
            }}
          />
        </Box>

        {/* اتجاه الحوالة */}

        <Box>
          <Typography sx={labelStyles}>الاتجاه:</Typography>

          <Select
            name="direction"
            fullWidth
            displayEmpty
            value={filters.direction}
            onChange={handleInputChange}
            sx={{
              width: 200,
              ...commonInputStyles,
              height: `${FIELD_HEIGHT}px`,
              borderRadius: 2,
              backgroundColor: darkBackground,
              color: secondary,

              "& .MuiOutlinedInput-notchedOutline": {
                borderColor,
              },

              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: primary,
              },

              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: secondary,
              },
            }}
          >
            <MenuItem value="">جميع الاتجاهات</MenuItem>

            <MenuItem value="وارد">حوالة واردة</MenuItem>

            <MenuItem value="صادر">حوالة صادرة</MenuItem>
          </Select>
        </Box>

        {/* العملة */}

        <Box>
          <Typography sx={labelStyles}>العملة:</Typography>

          <Select
            name="currency"
            fullWidth
            displayEmpty
            value={filters.currency}
            onChange={handleInputChange}
            sx={{
              width: 200,
              ...commonInputStyles,
              height: `${FIELD_HEIGHT}px`,
              borderRadius: 2,
              backgroundColor: darkBackground,
              color: secondary,

              "& .MuiOutlinedInput-notchedOutline": {
                borderColor,
              },

              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: primary,
              },

              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: secondary,
              },
            }}
          >
            <MenuItem value="">جميع العملات</MenuItem>

            {currencies.map((currency) => (
              <MenuItem key={currency.value} value={currency.value}>
                {currency.currencyLabel}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* الملاحظات */}

      <Typography sx={labelStyles}>الملاحظات</Typography>

      <TextField
        name="note"
        multiline
        rows={1}
        placeholder="ابحث في ملاحظات الحوالات..."
        fullWidth
        value={filters.note}
        onChange={handleInputChange}
        sx={{
          "& .MuiOutlinedInput-root": {
            color: secondary,
            backgroundColor: darkBackground,
            borderRadius: 2,

            "& fieldset": {
              borderColor,
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

      {/* زر البحث */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
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
