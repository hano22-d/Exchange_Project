import { Typography, Box, Button } from "@mui/material";
import { FaChartLine, FaCoins } from "react-icons/fa";
import { FaVault } from "react-icons/fa6";
import { useState } from "react";
import AddCashboxDialog from "../featuers/exchange/cashbox/addCashboxDialog";
import useCashboxActions from "../hooks/cashbox_Hooks/useCashboxActions";
import BasicToast from "../shared/ui/toast";
import Boxes from "../featuers/exchange/cashbox/boxes_home";
import Statistics from "../featuers/exchange/cashbox/statistics";

export default function Home() {
  //حالة فتح وإقلاق dialog
  const [open, setOpen] = useState(false);
  //hook اضافة صندوق
  const { addCashbox, adding } = useCashboxActions();

  const [toastState, setToastState] = useState({
    open: false,
    message: "",
    saverity: "success",
  });

  // دالة إضافة صندوق
  async function createCashbox(currency, balance) {
    const newCshbox = {
      currency,
      balance,
    };
    try {
      await addCashbox(newCshbox);

      setToastState({
        open: true,
        message: "تم إنشاء وحفظ الصندوق بنجاح",
        saverity: "success",
      });

      console.log("تمت اضافة الحركة بنجاح");

      setOpen(false);
    } catch (error) {
      console.log(`فشل اضافة الحركة ${error}`);
    }
  }

  return (
    <Box
      sx={{
        p: 3,
        mt: 3,
      }}
    >
      <AddCashboxDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={createCashbox}
        loading={adding}
      />

      <BasicToast
        open={toastState.open}
        message={toastState.message}
        saverity={toastState.saverity}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex" }}>
          <FaCoins style={{ marginLeft: 10, fontSize: 25, color: "gold" }} />{" "}
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontFamily: "'Alyamama', sans-serif",
            }}
          >
            أرصدة الصناديق الحالية
          </Typography>
        </Box>
        <Button
          onClick={() => setOpen(true)}
          variant="outlined"
          sx={{
            p: "10px 25px",
            ml: 2,
            borderColor: "rgba(250, 229, 110, 0.992)",
            color: "rgba(250, 229, 110, 0.992)",
            "&:hover": {
              backgroundColor: "rgba(250, 229, 110, 0.16)",
            },
          }}
        >
          <Typography sx={{ fontFamily: "'Alyamama', sans-serif", pl: 1 }}>
            إضافة صندوق
          </Typography>
          <FaVault style={{ fontSize: 15 }} />
        </Button>
      </Box>

      <Boxes />

      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: "flex" }}>
          <FaChartLine
            style={{ marginLeft: 10, fontSize: 25, color: "#00ff15" }}
          />
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontFamily: "'Alyamama', sans-serif",
            }}
          >
            نشاط وإحصائيات اليوم
          </Typography>
        </Box>

        <Statistics/>

      </Box>
    </Box>
  );
}
