import { Grid, Card, Typography, Box, Divider } from "@mui/material";
import { formatSyriaDateTime } from "../../../shared/utilsDate";
import { MdAccessTime } from "react-icons/md";
import { getSupportedCurrency } from "../../../shared/currencydata/currencies";

export default function Boxes({ cashboxes, loading, error }) {
  if (loading) return <h1>Loading...</h1>;

  if (error) return <h1>error!</h1>;

  return (
    <>
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
        {cashboxes.length === 0 && (
          <h1 style={{ color: "white" }}>لا توجد صناديق متاحة</h1>
        )}
        {cashboxes.map((item) => {
          const currencyData = getSupportedCurrency(item.currency);
          const FlagComp = currencyData?.FlagComponent;
          return (
            <Card
              key={item.currency}
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
                      sx={{
                        color: "#c8c8c8",
                        p: 1,
                        borderRadius: 25,
                        fontSize: 25,
                      }}
                    >
                      {item.currency}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#ffffff",
                        backgroundColor: "#3a3a3a",
                        px: 1.8,
                        py: 0.6,
                        borderRadius: "20px",
                        fontSize: "12.5px",
                        fontWeight: 500,
                        letterSpacing: "0.5px",
                        display: "inline-block",
                        boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      {item.currencyNameAr}
                    </Typography>
                  </Box>
                  {FlagComp && (
                    <FlagComp style={{ width: "40px", borderRadius: 4 }} />
                  )}
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
                    <Box
                      sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}
                    >
                      <Typography
                        sx={{
                          fontSize: 35,
                          fontWeight: "bold",
                          color: "rgba(250, 229, 110, 0.992)",
                        }}
                      >
                        {item.balance}
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
                        backgroundColor:
                          item.balance < 0 ? "#F44336" : "#00d443",
                        p: 0.7,
                        borderRadius: 6,
                        fontFamily: "'Alyamama', sans-serif",
                      }}
                    >
                      {item.balance > 0 ? "رصيد طبيعي" : "رصيد سالب"}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: "#9e9e9e",
                        fontSize: "13px",
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        px: 1.5,
                        py: 0.75,
                        borderRadius: "10px",
                        width: "fit-content",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <MdAccessTime
                        sx={{ fontSize: "16px", color: "#bbbbbb" }}
                      />

                      <Typography
                        component="span"
                        sx={{ fontSize: "inherit", color: "inherit" }}
                      >
                        آخر تحديث:
                      </Typography>

                      <Typography
                        component="span"
                        sx={{
                          fontSize: "inherit",
                          color: "#e0e0e0",
                          fontWeight: 600,
                          letterSpacing: "0.3px",
                        }}
                      >
                        {formatSyriaDateTime(item.updatedAt).replace(
                          ",",
                          " - "
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Card>
          );
        })}
      </Grid>
    </>
  );
}
