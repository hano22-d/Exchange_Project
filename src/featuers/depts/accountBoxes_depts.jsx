import { Box, Divider, Grid, Typography } from "@mui/material";
import { FaUser } from "react-icons/fa";
import usePartyDebtAccount from "../../hooks/debt_hooks/usePartyDebtAccount";
import { Link } from "react-router-dom";

export default function AccountBoxes({ party }) {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const text = "black";
  const darkBackground = "#232323";
  const fontFamily = "'Alyamama', sans-serif";

  const buttonStyle = {
    color: text,
    backgroundColor: primary,
    fontFamily,
    m: 0.5,
  };

  const { balances } = usePartyDebtAccount(party.id);

  return (
    <>
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
              {party.fullName}
            </Typography>
            <Typography sx={{ color: secondary, fontFamily, fontSize: 16 }}>
              {party.fhoneNumber}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ backgroundColor: primary, my: 2 }} />

      <Box sx={{ flexGrow: 1 }}>
        <Typography sx={{ color: secondary, fontFamily }}>
          الأرصدة الحالية:
        </Typography>

        {balances.length === 0 && (
          <Typography
            sx={{
              color: secondary,
              fontFamily,
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            لا توجد ارصدة حاليا
          </Typography>
        )}
        <Grid container rowSpacing={2} columnSpacing={3}>
          {balances.map((b) => (
            <Grid
              size={6}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#fff",
                border: "1px solid #f6bd00",
                borderLeft: "5px solid #f6bd00",
                borderRadius: 3,
                px: 2,
                py: 1.5,
                boxShadow: "0 2px 8px rgba(246, 189, 0, 0.12)",
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  color: "#111",
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 1.5,
                  letterSpacing: "0.5px",
                }}
              >
                {b.currency}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#fff",
                    backgroundColor:
                      balances.direction === "لنا" ? "#16a34a" : "#dc2626",
                    px: 1.5,
                    py: 0.2,
                    borderRadius: 1,
                  }}
                >
                  {b.direction}
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.3rem",
                    color: "#1a1a1a",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {b.amount}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ backgroundColor: primary, my: 2 }} />

      <Box sx={{ direction: "ltr",py: 0.5 }}>
        <Link
          to={`/debts/${party.id}`}
          variant="contained"
          style={{
            ...buttonStyle,
            textDecoration: "none",
            padding: "7px 20px",
            borderRadius: 3,
          }}
        >
          كشف حساب
        </Link>
      </Box>
    </>
  );
}
