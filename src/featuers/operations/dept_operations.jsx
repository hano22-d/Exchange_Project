import {
  Box,
  Divider,
  Paper,
  TextField,
  Typography,
  Button,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { FaFileInvoice } from "react-icons/fa";
import useParties from "../../hooks/parties_hooks/useParties";
import { useState } from "react";
import useCashboxces from "../../hooks/cashbox_Hooks/usecashboxes";
import { viewCreatedCashboxes } from "../../shared/utils";
import useDebtActions from "../../hooks/debt_hooks/useDebtActions";
import BasicToast from "../../shared/ui/toast";

const primary = "rgba(250,229,110,0.992)";
const secondary = "#ffffff";
const text = "black";
const darkBackground = "#232323";
const fontFamily = "'Alyamama', sans-serif";
const borderColor = "rgba(250,229,110,0.45)";

const FIELD_HEIGHT = 56;

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

const emptyForm = {
  partyId: "",
  currency: "",
  amount: "",
  direction: "",
  date: "",
  note: "",
};

export default function Transfer() {
  // ==== states ==== //
  const [addDebtForm, setAddDebtForm] = useState(emptyForm);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "",
  });

  // ==== services ==== //
  const { cashboxes } = useCashboxces();
  const { parties } = useParties();
  const { createDebt, creating } = useDebtActions();

  // ==== functions ====
  const handleInputOnchange = (e) => {
    const { name, value } = e.target;
    setAddDebtForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // دالة إضافة حركة دين
  async function addDebtFun() {
    try {
      await createDebt(addDebtForm);

      setToast({
        open: true,
        message: "تمت إضافة الدين بنجاح",
        severity: "success",
      });

      setAddDebtForm(emptyForm);
    } catch (error) {
      setToast({
        open: true,
        message: `فشل إضافة الدين: ${error.message}`,
        severity: "error",
      });
    }
  }

  // الصناديق الحالية
  const currencies = viewCreatedCashboxes(cashboxes);

  return (
    <>
      {/* helper Components */}
      <BasicToast
        open={toast.open}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        message={toast.message}
        severity={toast.severity}
      />
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
            <FaFileInvoice style={{ color: primary, fontSize: 30 }} />
            <Typography
              sx={{
                color: primary,
                fontFamily,
                fontSize: 25,
                fontWeight: "bold",
              }}
            >
              تسجيل دين
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
                  name="date"
                  value={addDebtForm.date}
                  onChange={handleInputOnchange}
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
                <Typography sx={labelStyles}>الطرف (الشخص / الحساب)</Typography>
                <Autocomplete
                  options={parties}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.fullName
                  }
                  onChange={(_, newValue) =>
                    handleInputOnchange({
                      target: {
                        name: "partyId",
                        value:
                          newValue && typeof newValue === "object"
                            ? newValue.id
                            : "",
                      },
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="partyId"
                      type="text"
                      placeholder="أدخل اسم الشخص أو الوجهة"
                      fullWidth
                      sx={{ ...commonInputStyles }}
                    />
                  )}
                />
              </Box>
              <Box>
                <Typography sx={labelStyles}>اتجاه الدين</Typography>
                <Select
                  fullWidth
                  name="direction"
                  value={addDebtForm.direction}
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
                  <MenuItem value="لنا">لنا</MenuItem>

                  <MenuItem value="له">له</MenuItem>
                </Select>
              </Box>
            </Box>
            {/* الحقول الثلاثة الثانية */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Typography sx={labelStyles}>المبلغ</Typography>
                <TextField
                  name="amount"
                  value={addDebtForm.amount}
                  onChange={handleInputOnchange}
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
                  name="currency"
                  value={addDebtForm.currency}
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
                  {currencies.map((currency) => (
                    <MenuItem key={currency.value} value={currency.value}>
                      {currency.currencyLabel}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Box sx={{ width: 300 }}></Box>
            </Box>
            {/* حقل الملاحظة */}
            <Box>
              <Typography sx={labelStyles}>الملاحظات</Typography>
              <TextField
                name="note"
                value={addDebtForm.note}
                onChange={handleInputOnchange}
                multiline
                rows={2}
                placeholder="أضف ملاحظات حول الدين ..."
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
            onClick={addDebtFun}
            disabled={creating}
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
            تسجيل الدين
          </Button>
        </Paper>
      </Box>
    </>
  );
}
