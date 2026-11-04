import { Box, Button, Grid, Typography } from "@mui/material";
import {
  FaPrint,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";
import {
  FaArrowRightArrowLeft,
  FaFileCirclePlus,
  FaHandHoldingDollar,
  FaMoneyBillTransfer,
  FaMoneyBillWave,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { MdPayments } from "react-icons/md";

export default function DeptDetails() {
  const primary = "#FAE56E";
  const secondary = "#F5F5F5";
  const text = "#151515";
  const border = "rgba(250, 229, 110, 0.45)";
  const fontFamily = "'Alyamama', sans-serif";

  const infoBox = {
    width: 150,
    height: 50,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    p: 2,
    backgroundColor: "#242424",
    border: `1px solid ${border}`,
    borderRadius: 2,
  };

  const dataBox = {
    width: "320px",
    backgroundColor: "#2B2B2B",
    border: `1px solid ${border}`,
    borderRadius: 2,
    p: 2,
  };

  const titleStyle = {
    color: primary,
    fontFamily,
    fontWeight: "bold",
  };

  const valueStyle = {
    color: secondary,
    fontFamily,
  };

  const iconStyle = {
    color: primary,
    backgroundColor: text,
    fontSize: 16,
    borderRadius: 4,
    padding: 4,
  };

  const buttonStyle = {
    color: primary,
    borderColor: primary,
    fontSize: 15,
    gap: 1,
  };

  return (
    <Box
      sx={{
        backgroundColor: "#1E1E1E",
        border: `1px solid ${primary}`,
        borderRadius: 2,
        p: 3,
        mt: 2,
      }}
    >
      {/* ================= Header ================= */}

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* العنوان */}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
              color: text,
              backgroundColor: primary,
              fontFamily,
              fontSize: 20,
              fontWeight: "bold",
              borderRadius: 2,
              p: 1,
              gap: 1,
            }}
          >
            <FaFileCirclePlus
              style={{
                fontSize: 20,
                color: primary,
                backgroundColor: text,
                borderRadius: 10,
                padding: 6,
              }}
            />
            دين مسجل
          </Typography>

          <Typography
            sx={{
              color: secondary,
              fontFamily,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            تفاصيل الدين:
          </Typography>
        </Box>

        {/* الوقت والتاريخ */}

        <Box sx={infoBox}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaCalendarAlt
              style={{
                color: primary,
                fontSize: 22,
              }}
            />

            <Typography
              sx={{
                color: primary,
                fontFamily,
                fontSize: 20,
              }}
            >
              الوقت والتاريخ
            </Typography>
          </Box>

          <Typography sx={valueStyle}>1/11/2026 - 12:30</Typography>
        </Box>
      </Box>

      {/* ================= Details ================= */}

      <Grid
        container
        spacing={3}
        columns={12}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#191919",
          border: `1px solid ${border}`,
          borderRadius: 2,
          p: 2,
          my: 2,
        }}
      >
        {/*  الدائن */}

        <Box sx={dataBox}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <FaHandHoldingDollar style={iconStyle} />

            <Typography sx={titleStyle}>الدائن (المعطي):</Typography>
          </Box>

          <Typography sx={valueStyle}>الطرف الدائن</Typography>
        </Box>

        {/* المدين */}

        <Box sx={dataBox}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <FaUser style={iconStyle} />

            <Typography sx={titleStyle}>المدين (الآخذ):</Typography>
          </Box>

          <Typography sx={valueStyle}>الطرف المدين</Typography>
        </Box>

        {/* العملة  */}

        <Box sx={dataBox}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <FaArrowRightArrowLeft style={iconStyle} />

            <Typography sx={titleStyle}>العملة:</Typography>
          </Box>

          <Typography sx={valueStyle}>عملة الدين</Typography>
        </Box>

        {/* المبلغ */}

        <Box sx={dataBox}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <FaMoneyBillWave style={iconStyle} />

            <Typography sx={titleStyle}>المبلغ:</Typography>
          </Box>

          <Typography sx={valueStyle}>القيمة الأصلية للدين</Typography>
        </Box>

        {/* المبلغ المسدد */}

        <Box sx={dataBox}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <FaMoneyBillTransfer style={iconStyle} />

            <Typography sx={titleStyle}>المبلغ المسدد:</Typography>
          </Box>

          <Typography sx={valueStyle}>إجمالي ما تم تسديده</Typography>
        </Box>

        {/* الحالة */}

        <Box sx={dataBox}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <FaTriangleExclamation style={iconStyle} />

            <Typography sx={titleStyle}>حالة الدين:</Typography>
          </Box>

          <Typography sx={valueStyle}>مسدد - مسدد جزئي - غير مسدد</Typography>
        </Box>

        {/* الملاحظات */}

        <Box
          sx={{
            width: 1075,
            backgroundColor: "#202020",
            border: `1px solid ${border}`,
            borderRadius: 2,
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <MdPayments style={iconStyle} />

            <Typography sx={titleStyle}>الملاحظات:</Typography>
          </Box>

          <Typography sx={valueStyle}>لا يوجد ملاحظات</Typography>
        </Box>
      </Grid>

      {/* ================= Buttons ================= */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button variant="outlined" sx={buttonStyle}>
          <FaPrint />
          طباعة
        </Button>

        <Box sx={{ display: "flex", gap: 4 }}>
          <Button variant="outlined" sx={buttonStyle}>
            <FaEdit />
            تعديل
          </Button>

          <Button
            variant="contained"
            sx={{
              ...buttonStyle,
              color: text,
              backgroundColor: primary,
            }}
          >
            <FaTrash />
            حذف
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
