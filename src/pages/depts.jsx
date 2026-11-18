import {
  Box,
  Button,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { FaUser } from "react-icons/fa";
import AccountBoxes from "../featuers/depts/accountBoxes_depts";
import useParties from "../hooks/parties_hooks/useParties";
import { useState } from "react";
import { AddPartyDialog } from "../featuers/depts/addPartyDialog";
import usePartyActions from "../hooks/parties_hooks/usePartyActions";
import BasicToast from "../shared/ui/toast";

export default function Depts() {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const text = "black";
  const darkBackground = "#232323";
  const fontFamily = "'Alyamama', sans-serif";
  const borderColor = "rgba(250,229,110,0.45)";

  const buttonStyle = {
    color: text,
    backgroundColor: primary,
    fontFamily,
    m: 0.5,
  };

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

  const [searchParty, setSearchParty] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const { parties, refetch, loading } = useParties();
  const { createParty, creating } = usePartyActions();

  async function handleSearchParty() {
    await refetch(searchParty);
  }

  // دالة إضافة جهة
  async function handleAddParty(data) {
    try {
      await createParty(data);

      refetch();

      setToast({
        open: true,
        message: "تمت إضافة الجهة بنجاح",
        severity: "success",
      });

      setOpenAddDialog(false);
    } catch (error) {
      setToast({
        open: true,
        message: `فشل إضافة الجهة: ${error.message}`,
        severity: "error",
      });
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      {openAddDialog && (
        <AddPartyDialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          onAdd={handleAddParty}
          loading={creating}
        />
      )}

      <BasicToast
        open={toast.open}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        message={toast.message}
        severity={toast.severity}
      />

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
          onClick={() => setOpenAddDialog(true)}
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
          value={searchParty}
          onChange={(e) => setSearchParty(e.target.value)}
          fullWidth
          placeholder="ابحث عن اسم الشخص، المكتب، أو رقم الهاتف"
          sx={{
            ...commonInputStyles,
            width: 600,
          }}
        />

        <Button
          onClick={handleSearchParty}
          sx={{ ...buttonStyle, py: 1.5, px: 3, mr: 1, borderRadius: 2 }}
        >
          بحث
        </Button>
      </Box>

      <Grid
        container
        rowSpacing={2}
        columnSpacing={3}
        sx={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: darkBackground,
          border: `1px solid ${primary}`,
          borderRadius: 2,
          p: 2,
          gap: 2.5,
        }}
      >
        {loading && (
          <Typography
            sx={{
              fontFamily,
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
              color: "#fff",
              mt: 5,
            }}
          >
            "جار التحميل..
          </Typography>
        )}
        {parties.map((party) => (
          <Grid
            size={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#444",
              border: `1px solid ${primary}`,
              borderRadius: 2,
              p: 2,
            }}
          >
            <AccountBoxes party={party} />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 2 }} />
    </Box>
  );
}
