import { Card, Typography, Box } from "@mui/material";
import { FaChartLine } from "react-icons/fa";
import { FaHandHoldingDollar, FaMoneyBillTransfer } from "react-icons/fa6";
import { MdSwapHoriz } from "react-icons/md";

export default function Statistics({ exchanges, transfers, debts }) {
  const totalOperations = exchanges + transfers + debts.length;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          my: 2,
        }}
      >
        <Card
          sx={{
            width: "21%",
            backgroundColor: "#232323",
            border: "1px solid rgba(250, 229, 110, 0.992)",
            borderRadius: 4,
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: "white", fontSize: 20 }}>
              إجمالي العمليات
            </Typography>
            <FaChartLine style={{ color: "#00c853", fontSize: 20 }} />
          </Box>

          <Box>
            <Typography
              sx={{ color: "#00c853", fontSize: 25, fontWeight: "bold" }}
            >
              {" "}
              {totalOperations}
            </Typography>
            <Typography sx={{ color: "#c5c2c2" }}>حركة منفذة اليوم</Typography>
          </Box>
        </Card>

        <Card
          sx={{
            width: "21%",
            backgroundColor: "#232323",
            border: "1px solid rgba(250, 229, 110, 0.992)",
            borderRadius: 4,
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: "white", fontSize: 20 }}>
              عمليات الصرف
            </Typography>
            <FaMoneyBillTransfer style={{ color: "#29b6f6", fontSize: 20 }} />
          </Box>

          <Box>
            <Typography
              sx={{ color: "#29b6f6", fontSize: 25, fontWeight: "bold" }}
            >
              {" "}
              {exchanges}
            </Typography>
            <Typography sx={{ color: "#c5c2c2" }}>عملية بيع وشراء</Typography>
          </Box>
        </Card>

        <Card
          sx={{
            width: "21%",
            backgroundColor: "#232323",
            border: "1px solid rgba(250, 229, 110, 0.992)",
            borderRadius: 4,
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: "white", fontSize: 20 }}>
              الحوالات
            </Typography>
            <MdSwapHoriz style={{ color: "#ab47bc", fontSize: 20 }} />
          </Box>

          <Box>
            <Typography
              sx={{ color: "#ab47bc", fontSize: 25, fontWeight: "bold" }}
            >
              {transfers}
            </Typography>
            <Typography sx={{ color: "#c5c2c2" }}>صادرة وورادة</Typography>
          </Box>
        </Card>

        <Card
          sx={{
            width: "21%",
            backgroundColor: "#232323",
            border: "1px solid rgba(250, 229, 110, 0.992)",
            borderRadius: 4,
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: "white", fontSize: 20 }}>
              الديون
            </Typography>
            <FaHandHoldingDollar style={{ color: "#ffb300", fontSize: 20 }} />
          </Box>

          <Box>
            <Typography
              sx={{ color: "#ffb300", fontSize: 25, fontWeight: "bold" }}
            >
              {debts.length}
            </Typography>
            <Typography sx={{ color: "#c5c2c2" }}>سداد واستدانة</Typography>
          </Box>
        </Card>
      </Box>
    </>
  );
}
