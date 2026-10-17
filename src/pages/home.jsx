import { Grid, Card, Typography, Box, Divider, Button } from "@mui/material";
import { FaCoins } from "react-icons/fa";
import { FaVault } from "react-icons/fa6";

export default function Home() {
  const information = [
    {
      cashBoxCategorySymbol: "SYP",
      cashBoxCategoryName: "ليرة سورية",
      CurrentBalance: "85000000",
    },
    {
      cashBoxCategorySymbol: "USD",
      cashBoxCategoryName: "دولار أمريكي",
      CurrentBalance: "27200",
    },
    {
      cashBoxCategorySymbol: "EUR",
      cashBoxCategoryName: " يورو أوروبي",
      CurrentBalance: "8600",
    },
    {
      cashBoxCategorySymbol: "TUR",
      cashBoxCategoryName: "ليرة تركية",
      CurrentBalance: "15000",
    },
    {
      cashBoxCategorySymbol: "IQD",
      cashBoxCategoryName: "دينار عراقي",
      CurrentBalance: "158000",
    },
    {
      cashBoxCategorySymbol: "CHF",
      cashBoxCategoryName: "فرنك سويسري",
      CurrentBalance: "12000",
    },
  ];
  return (
    <Box
      sx={{
        p: 3,
        mt: 3,
      }}
    >
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
                height: "225px",
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
                <FaVault
                  style={{
                    fontSize: 25,
                    color: "rgba(250, 229, 110, 0.992)",
                    margin: 5,
                  }}
                />
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
                        fontSize: 22,
                        fontWeight: "bold",
                        color: "rgba(250, 229, 110, 0.992)",
                      }}
                    >
                      {Number(
                        item.CurrentBalance.replace(/,/g, ""),
                      ).toLocaleString('ar-SA')}
                    </Typography>
                    <Typography sx={{ color: "white" }}>
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
                      backgroundColor: "rgba(250, 229, 110, 0.992)",
                      p: 0.5,
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