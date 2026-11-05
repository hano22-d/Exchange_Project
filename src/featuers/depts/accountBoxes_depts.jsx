import { Box, Button, Divider, Grid, Typography } from "@mui/material";
import { FaUser } from "react-icons/fa";

export default function AccountBoxes() {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const text = "black";
  const darkBackground = "#232323";
  const boxBackground = "#383838";
  const fontFamily = "'Alyamama', sans-serif";

  const buttonStyle = {
    color: text,
    backgroundColor: primary,
    fontFamily,
    m: 0.5,
  };

  const balanceTypography = {
    color: text,
    fontWeight: "bold",
    fontFamily,
  }

  return (
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
      {/* الصندوق الأول */}
      <Grid
        size={6}
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: boxBackground,
          border: `1px solid ${primary}`,
          borderRadius: 2,
          p: 2,
        }}
      >
        {/* رأس الصندوق */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <FaUser
              style={{
                color: primary,
                backgroundColor: darkBackground,
                fontSize: 30,
                borderRadius: 10,
                padding: 10,
              }}
            />
            <Box>
              <Typography
                sx={{
                  color: secondary,
                  fontFamily,
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                أحمد محمد علي
              </Typography>
              <Typography sx={{ color: secondary, fontFamily, fontSize: 16 }}>
                رقم الهاتف
              </Typography>
            </Box>
          </Box>
          <Typography
            sx={{
              color: secondary,
              backgroundColor: darkBackground,
              borderRadius: 6,
              p: 1,
            }}
          >
            آخر حركة: اليوم 17:15
          </Typography>
        </Box>

        <Divider sx={{ backgroundColor: primary, my: 2 }} />

        {/* المحتوى */}

        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ color: secondary, fontFamily }}>
            الأرصدة الحالية:
          </Typography>
          <Grid container rowSpacing={2} columnSpacing={3}>
            <Grid
              size={6}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#f6bc0078",
                border: `1px solid #f6bd00`,
                borderRadius: 4,
                p: 1.5,
              }}
            >
              <Typography sx={balanceTypography}>680 USD</Typography>
              <Typography sx={balanceTypography}>لنا</Typography>
            </Grid>

            <Grid
              size={6}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#00f6f278",
                border: `1px solid #00f6f2`,
                borderRadius: 4,
                p: 1.5,
              }}
            >
              <Typography sx={balanceTypography}>400 EUR</Typography>
              <Typography sx={balanceTypography}>له</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ backgroundColor: primary, my: 2 }} />

        {/* الأزرار السفلية */}

        <Box sx={{ direction: "ltr" }}>
          <Button variant="contained" sx={{ ...buttonStyle }}>
            إضافة دين جديد
          </Button>
          <Button variant="contained" sx={{ ...buttonStyle }}>
            كشف حساب
          </Button>
        </Box>
      </Grid>

      {/* ============================================= */}

      {/* الصندوق الثاني */}
      <Grid
        size={6}
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: boxBackground,
          border: `1px solid ${primary}`,
          borderRadius: 2,
          p: 2,
        }}
      >
        {/* رأس الصتدوق */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <FaUser
              style={{
                color: primary,
                backgroundColor: darkBackground,
                fontSize: 30,
                borderRadius: 10,
                padding: 10,
              }}
            />
            <Box>
              <Typography
                sx={{
                  color: secondary,
                  fontFamily,
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                مكتب كرازة للصرافة
              </Typography>
              <Typography sx={{ color: secondary, fontFamily, fontSize: 16 }}>
                رقم الهاتف
              </Typography>
            </Box>
          </Box>
          <Typography
            sx={{
              color: secondary,
              backgroundColor: darkBackground,
              borderRadius: 6,
              p: 1,
            }}
          >
            آخر حركة: اليوم 17:15
          </Typography>
        </Box>

        <Divider sx={{ backgroundColor: primary, my: 2 }} />

        {/* المحتوى */}

        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ color: secondary, fontFamily }}>
            الأرصدة الحالية:
          </Typography>
          <Grid container rowSpacing={2} columnSpacing={3}>
            <Grid
              size={6}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#f6bc0078",
                border: `1px solid #f6bd00`,
                borderRadius: 4,
                p: 1.5,
              }}
            >
              <Typography sx={balanceTypography}>700 USD</Typography>
              <Typography sx={balanceTypography}>لنا</Typography>
            </Grid>

            <Grid
              size={6}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#00f6f278",
                border: `1px solid #00f6f2`,
                borderRadius: 4,
                p: 1.5,
              }}
            >
              <Typography sx={balanceTypography}>200 EUR</Typography>
              <Typography sx={balanceTypography}>له</Typography>
            </Grid>

            <Grid
              size={6}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#f6bc0078",
                border: `1px solid #f6bd00`,
                borderRadius: 4,
                p: 1.5,
              }}
            >
              <Typography sx={balanceTypography}>12,000,000 SYR</Typography>
              <Typography sx={balanceTypography}>لنا </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ backgroundColor: primary, my: 2 }} />

        {/* الأزرار السفلية */}

        <Box sx={{ direction: "ltr" }}>
          <Button variant="contained" sx={{ ...buttonStyle }}>
            إضافة دين جديد
          </Button>
          <Button variant="contained" sx={{ ...buttonStyle }}>
            كشف حساب
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}
