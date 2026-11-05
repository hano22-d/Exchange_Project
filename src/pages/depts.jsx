import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { FaUser } from "react-icons/fa";
import AccountBoxes from "../featuers/depts/accountBoxes_depts";
import AcoountStatement from "../featuers/depts/accountStatement_depts";

export default function Depts() {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const text = "black";
  const darkBackground = "#232323";
  const fontFamily = "'Alyamama', sans-serif";
  const borderColor = "rgba(250,229,110,0.45)";

  const commonInputStyles = {
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

    "& .MuiInputBase-input": {
      fontFamily,
    },

    "& .MuiSvgIcon-root": {
      color: primary,
    },
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: darkBackground,
          border: `1px solid ${primary}`,
          borderRadius: 5,
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FaUser style={{ fontSize: 40, color: primary }} />
          <Box>
            <Typography
              sx={{ fontSize: 30, fontFamily: fontFamily, color: secondary }}
            >
              إدارة الديون والحسابات
            </Typography>
            <Typography
              sx={{ fontSize: 15, fontFamily: fontFamily, color: secondary }}
            >
              متابعة أرصدة الأشخاص والمكاتب وتتبع الذمم المالية
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          sx={{
            alignSelf: "center",
            fontFamily: fontFamily,
            backgroundColor: primary,
            color: text,
            padding: "7px 15px",
            fontWeight: "bold",
            "&:hover": { backgroundColor: primary },
          }}
        >
          إضافة طرف جديد
        </Button>
      </Box>

      {/* حقل بحث */}

      <Box sx={{ my: 2 }}>
        <Typography sx={{ color: secondary, fontFamily }}>
          بحث عن طرف:
        </Typography>
        <TextField
          fullWidth
          placeholder="ابحث عن اسم الشخص، المكتب، أو رقم الهاتف"
          sx={{
            ...commonInputStyles,
          }}
        />
      </Box>


      <AccountBoxes/>
      
      <Divider sx={{my: 2}}/>

      <AcoountStatement/>
    </Box>
  );
}
