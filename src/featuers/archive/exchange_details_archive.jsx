import { Box, Button, Grid, Typography } from "@mui/material";
import {
  FaPrint,
  FaEdit,
  FaTrash,
  FaExchangeAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { FaCoins, FaHashtag, FaMoneyBillWave } from "react-icons/fa6";
import { MdPayments } from "react-icons/md";

export default function Details() {

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
            <FaExchangeAlt
              style={{
                fontSize: 20,
                color: primary,
                backgroundColor: text,
                borderRadius: 10,
                padding: 6,
              }}
            />

            عملية صرافة
          </Typography>

          <Typography
            sx={{
              color: secondary,
              fontFamily,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            تفاصيل العملية:
          </Typography>
        </Box>

        {/* رقم العملية والتاريخ */}

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* رقم العملية */}

          <Box sx={infoBox}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FaHashtag style={{ color: primary, fontSize: 22 }} />

              <Typography
                sx={{
                  color: primary,
                  fontFamily,
                  fontSize: 20,
                }}
              >
                رقم العملية
              </Typography>
            </Box>

            <Typography sx={valueStyle}>68461648</Typography>
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

            <Typography sx={valueStyle}>
              1/11/2026 - 12:30
            </Typography>
          </Box>
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
        {/* العملة المستلمة */}

        <Box sx={dataBox}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaCoins style={iconStyle} />

            <Typography sx={titleStyle}>
              العملة المستلمة من الزبون:
            </Typography>
          </Box>

          <Typography sx={valueStyle}>
            USD دولار أمريكي
          </Typography>
        </Box>

        {/* العملة المدفوعة */}

        <Box sx={dataBox}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaCoins style={iconStyle} />

            <Typography sx={titleStyle}>
              العملة المدفوعة للزبون:
            </Typography>
          </Box>

          <Typography sx={valueStyle}>
            SYP ليرة سورية
          </Typography>
        </Box>

        {/* سعر الصرف */}

        <Box sx={dataBox}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaExchangeAlt style={iconStyle} />

            <Typography sx={titleStyle}>
              سعر الصرف:
            </Typography>
          </Box>

          <Typography sx={valueStyle}>
            1 USD = 2500 SYP
          </Typography>
        </Box>

        {/* المبلغ المستلم */}

        <Box sx={dataBox}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaMoneyBillWave style={iconStyle} />

            <Typography sx={titleStyle}>
              المبلغ المستلم من الزبون:
            </Typography>
          </Box>

          <Typography sx={valueStyle}>
            100 USD
          </Typography>
        </Box>

        {/* المبلغ المدفوع */}

        <Box sx={dataBox}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaMoneyBillWave style={iconStyle} />

            <Typography sx={titleStyle}>
              المبلغ المدفوع للزبون:
            </Typography>
          </Box>

          <Typography sx={valueStyle}>
            250000 SYP
          </Typography>
        </Box>

        {/* تاريخ التحديث */}

        <Box sx={dataBox}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaCalendarAlt style={iconStyle} />

            <Typography sx={titleStyle}>
              تاريخ التحديث:
            </Typography>
          </Box>

          <Typography sx={valueStyle}>
            1/11/2026 - 12:30
          </Typography>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MdPayments style={iconStyle} />

            <Typography sx={titleStyle}>
              الملاحظات:
            </Typography>
          </Box>

          <Typography sx={valueStyle}>
            لا يوجد ملاحظات
          </Typography>
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