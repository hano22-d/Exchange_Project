import { Grid, Card, Typography, Box, Divider, Button } from "@mui/material";
import { FaCoins } from "react-icons/fa";
import { FaVault } from "react-icons/fa6";
import { SY, US, TR, IQ, CH, EU } from "country-flag-icons/react/3x2";

export default function Home() {
  const information = [
    {
      cashBoxCategorySymbol: "SYP",
      cashBoxCategoryName: "ليرة سورية",
      CurrentBalance: "85000000",
      countryFlag: <SY style={{ width: "40px", borderRadius: 4 }} />,
    },
    {
      cashBoxCategorySymbol: "USD",
      cashBoxCategoryName: "دولار أمريكي",
      CurrentBalance: "27200",
      countryFlag: <US style={{ width: "40px", borderRadius: 4 }} />,
    },
    {
      cashBoxCategorySymbol: "EUR",
      cashBoxCategoryName: " يورو أوروبي",
      CurrentBalance: "8600",
      countryFlag: <EU style={{ width: "40px", borderRadius: 4 }} />,
    },
    {
      cashBoxCategorySymbol: "TRY",
      cashBoxCategoryName: "ليرة تركية",
      CurrentBalance: "15000",
      countryFlag: <TR style={{ width: "40px", borderRadius: 4 }} />,
    },
    {
      cashBoxCategorySymbol: "IQD",
      cashBoxCategoryName: "دينار عراقي",
      CurrentBalance: "158000",
      countryFlag: <IQ style={{ width: "40px", borderRadius: 4 }} />,
    },
    {
      cashBoxCategorySymbol: "CHF",
      cashBoxCategoryName: "فرنك سويسري",
      CurrentBalance: "12000",
      countryFlag: <CH style={{ width: "40px", borderRadius: 4 }} />,
    },
  ];
  return (
    <Box
      sx={{
        p: 3,
        mt: 3,
      }}
    >
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
          variant="outlined"
          sx={{
            p: "10px 25px",
            ml: 2,
            borderColor: "rgba(250, 229, 110, 0.992)",
            color: "rgba(250, 229, 110, 0.992)",
            "&:hover": {
              backgroundColor: "rgba(250, 229, 110, 0.16)"
            }
          }}
        >
         <Typography sx={{fontFamily: "'Alyamama', sans-serif", pl: 1}}>
          إضافة صندوق
         </Typography>
         <FaVault style={{fontSize: 15}}/>
        </Button>
      </Box>

      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          my: 3,
        }}
      >
        {information.map((item, index) => (
          <Card
            sx={{
              width: "31.5%",
              display: "flex",
              justifyContent: "flex-end",
              backgroundColor: "rgba(250, 229, 110, 0.992)",
              borderRadius: 4,
              border: "1px solid rgba(250, 229, 110, 0.992)",
            }}
          >
            <Card
              key={index}
              sx={{
                width: "94%",
                height: "240px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundColor: "#232323",
                p: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 25, fontWeight: "bold", color: "white" }}
                  >
                    {item.cashBoxCategorySymbol}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#c8c8c8",
                      backgroundColor: "#4e4e4e",
                      p: 1,
                      borderRadius: 25,
                      fontSize: 13,
                    }}
                  >
                    {item.cashBoxCategoryName}
                  </Typography>
                </Box>
                {item.countryFlag}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 18,
                      color: "white",
                      fontFamily: "'Alyamama', sans-serif",
                    }}
                  >
                    الرصيد الحالي:
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 35,
                        fontWeight: "bold",
                        color: "rgba(250, 229, 110, 0.992)",
                      }}
                    >
                      {Number(
                        item.CurrentBalance.replace(/,/g, ""),
                      ).toLocaleString()}
                    </Typography>
                    <Typography sx={{ fontSize: 25, color: "white" }}>
                      {item.cashBoxCategorySymbol}
                    </Typography>
                  </Box>
                </Box>
                <Divider color={"white"} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    my: 1,
                  }}
                >
                  <Typography
                    sx={{
                      backgroundColor: "#00d443",
                      p: 0.7,
                      borderRadius: 6,
                      fontFamily: "'Alyamama', sans-serif",
                    }}
                  >
                    رصيد طبيعي
                  </Typography>
                  <Button
                    sx={{
                      fontFamily: "'Alyamama', sans-serif",
                    }}
                  >
                    تفاصيل ←
                  </Button>
                </Box>
              </Box>
            </Card>
          </Card>
        ))}
      </Grid>
    </Box>
  );
}
