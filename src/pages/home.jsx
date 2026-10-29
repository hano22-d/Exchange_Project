import { Typography, Box, Button } from "@mui/material";
import { FaChartLine, FaCoins } from "react-icons/fa";
import { FaVault } from "react-icons/fa6";
import { useState } from "react";
import AddCashboxDialog from "../featuers/home/addCashboxDialog";
import useCashboxActions from "../hooks/cashbox_Hooks/useCashboxActions";
import BasicToast from "../shared/ui/toast";
import Boxes from "../featuers/home/boxes_home";
import Statistics from "../featuers/home/statistics";
import useCashboxces from "../hooks/cashbox_Hooks/usecashboxes";
import { getSupportedCurrency } from "../shared/currencydata/currencies";
import LastOper from "../featuers/home/lastOperations_home";
import useExchanges from "../hooks/exchanges_hooks/useExchanges.jsx";

export default function Home() {
  //حالة فتح وإقلاق dialog
  const [open, setOpen] = useState(false);

  //حالة ادارة التوست
  const [toastState, setToastState] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  //hook اضافة صندوق
  const { addCashbox, adding } = useCashboxActions();
  //hook جلب الصناديق
  const { cashboxes, loading, error } = useCashboxces();
  //hook جلب الحركات
  const { exchanges } = useExchanges();

  // دالة إضافة صندوق
  async function createCashbox(currency, balance) {
    const newCshbox = {
      currency,
      balance,
      currencyNameAr: getSupportedCurrency(currency).nameAr,
    };
    try {
      await addCashbox(newCshbox);

      setToastState({
        open: true,
        message: "تم إنشاء وحفظ الصندوق بنجاح",
        severity: "success",
      });

      setOpen(false);
    } catch (error) {
      console.log(`فشل اضافة الحركة ${error}`);
      setToastState({
        open: true,
        message: `فشل إضافة الصندوق`,
        severity: "error",
      });
    }
  }

  return (
    <Box
      sx={{
        p: 3,
        mt: 3,
      }}
    >
      {/*نافذة إضافة صندوق*/}
      <AddCashboxDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={createCashbox}
        loading={adding}
      />

      {/*رسالة نجاح او فشل عملية إضافة صندوق*/}
      <BasicToast
        open={toastState.open}
        onClose={() => setToastState((prev) => ({ ...prev, open: false }))}
        message={toastState.message}
        severity={toastState.severity}
      />

      {/*المكونات الرئيسية*/}

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

      <Boxes cashboxes={cashboxes} loading={loading} error={error} />

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

        <Statistics exchanges={exchanges} />
        <LastOper cashboxes={cashboxes} />
      </Box>
    </Box>
  );
}
