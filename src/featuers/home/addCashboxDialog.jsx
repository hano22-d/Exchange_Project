import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CloseIcon from "@mui/icons-material/Close";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { SUPPORTED_CURRENCIES } from "../../shared/currencydata/currencies";

const AddCashboxDialog = ({ open, onClose, onConfirm, loading }) => {
  const [cashboxForm, setCshboxForm] = useState({
    currency: "",
    balance: "",
  });

  function handleInputOnchange(event) {
    const { name, value } = event.target;

    setCshboxForm((prevValue) => {
      return { ...prevValue, [name]: value };
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          width: "70%",
          maxWidth: { xs: "100%", sm: "450px", md: "500px" },
          backgroundColor: "#1e1e1e",
          color: "#ffffff",
          borderRadius: "16px",
          border: "1px solid rgba(250, 229, 110, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8)",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#121212",
          borderBottom: `1px solid 'rgba(250, 229, 110, 0.3)'`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AccountBalanceWalletIcon
            sx={{ color: "rgba(250, 229, 110, 0.992)", fontSize: "28px" }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "rgba(250, 229, 110, 0.992)",
              fontFamily: "Cairo, sans-serif",
            }}
          >
            إضافة صندوق جديد
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#aaa",
            "&:hover": {
              color: "rgba(250, 229, 110, 0.992)",
              backgroundColor: "rgba(250, 229, 110, 0.08)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 5, px: 3, pb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onConfirm(cashboxForm.currency, cashboxForm.balance);
            }}
          >
            <FormControl fullWidth variant="filled">
              <InputLabel
                id="currency-select-label"
                sx={{
                  color: "#aaa",
                  "&.Mui-focused": { color: "rgba(250, 229, 110, 0.992)" },
                }}
              >
                العملة
              </InputLabel>
              <Select
                labelId="currency-select-label"
                name="currency"
                value={cashboxForm.currency}
                onChange={handleInputOnchange}
                label="العملة"
                sx={{
                  mb: 4,
                  color: "#fff",
                  backgroundColor: "#121212",
                  borderRadius: "8px",
                  "& .MuiSelect-select": {
                    paddingTop: "8px",
                    paddingBottom: "15px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(250, 229, 110, 0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(250, 229, 110, 0.992)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(250, 229, 110, 0.992)",
                  },
                  "& .MuiSvgIcon-root": { color: "rgba(250, 229, 110, 0.992)" },
                }}
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <MenuItem
                    key={curr.code}
                    value={curr.code}
                    sx={{
                      backgroundColor: "#1e1e1e",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "rgba(250, 229, 110, 0.15)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "rgba(250, 229, 110, 0.25) !important",
                      },
                    }}
                  >
                    {`${curr.nameAr} (${curr.code})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="الرصيد الابتدائي (Balance)"
              type="number"
              name="balance"
              value={cashboxForm.balance}
              onChange={handleInputOnchange}
              sx={{
                "& .MuiInputLabel-root": {
                  color: "gray",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "rgba(250, 229, 110, 0.992)",
                },
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  backgroundColor: "#121212",
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "rgba(250, 229, 110, 0.3)" },
                  "&:hover fieldset": {
                    borderColor: "rgba(250, 229, 110, 0.992)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(250, 229, 110, 0.992)",
                  },
                },
                "& input": {
                  color: "#fff",
                },
              }}
            />
          </form>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: "#121212",
          borderTop: `1px solid 'rgba(250, 229, 110, 0.3)'`,
          px: 3,
          py: 2,
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "#ccc",
            borderColor: "#555",
            borderRadius: "8px",
            px: 3,
            textTransform: "none",
            fontFamily: "Cairo, sans-serif",
            "&:hover": {
              borderColor: "#888",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
          }}
        >
          إغلاق
        </Button>
        <Button
          onClick={() => onConfirm(cashboxForm.currency, cashboxForm.balance)}
          disabled={loading || cashboxForm.balance.trim() === ""}
          variant="contained"
          sx={{
            backgroundColor: "rgba(250, 229, 110, 0.992)",
            color: "#000",
            fontWeight: "bold",
            borderRadius: "8px",
            px: 3,
            textTransform: "none",
            fontFamily: "Cairo, sans-serif",
            boxShadow: "0 4px 12px rgba(250, 229, 110, 0.3)",
            "&:hover": {
              backgroundColor: "#e5cf62",
              boxShadow: "0 6px 16px rgba(250, 229, 110, 0.5)",
            },
            "&.Mui-disabled": {
              backgroundColor: "rgba(250, 229, 110, 0.2)",
              color: "#666",
            },
          }}
        >
          {loading ? "جار الاضافة" : " إضافة صندوق"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCashboxDialog;
