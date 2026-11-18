import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";

import {
  FaExclamationTriangle,
  FaTimes,
  FaArrowDown,
} from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa6";

export default function FailedMatching({
  openFailed,
  onClose,
  mismatchedBalances,
}) {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const mutedColor = "#aaaaaa";
  const fontFamily = "'Alyamama', sans-serif";

  const currencyCard = {
    backgroundColor: "#252525",
    border: "1px solid rgba(250,229,110,0.25)",
    borderRadius: 2,
    p: 2,
    textAlign: "right",
  };

  const amountLabel = {
    color: mutedColor,
    fontFamily,
    fontSize: 12,
  };

  const amountValue = {
    color: secondary,
    fontSize: 17,
    fontWeight: 600,
    textAlign: "center",
  };

  return (
    <Dialog
      open={openFailed}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 520,
            maxHeight: "75vh",
            background: "linear-gradient(180deg, #353535 0%, #151515 100%)",
            border: `1px solid ${primary}`,
            borderRadius: 3,
            position: "relative",
          },
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 2,
          color: mutedColor,
          "&:hover": {
            color: primary,
            backgroundColor: "rgba(250,229,110,0.1)",
          },
        }}
      >
        <FaTimes />
      </IconButton>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",

          gap: 2,
          overflowY: "auto",
          overflowX: "hidden",

          /* Scrollbar */
          "&::-webkit-scrollbar": {
            width: "7px",
          },

          "&::-webkit-scrollbar-track": {
            backgroundColor: "#151515",
            borderRadius: 10,
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(250,229,110,0.5)",
            borderRadius: 10,
            border: "1px solid #252525",
          },

          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: primary,
          },

          scrollbarWidth: "thin",
          scrollbarColor: `${primary} #151515`,
        }}
      >
        <Box
          sx={{
            width: 65,
            height: 65,
            flexShrink: 0,
            borderRadius: "50%",
            backgroundColor: "rgba(211,47,47,0.15)",
            border: "2px solid #e53935",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaExclamationTriangle
            style={{
              color: "#ff5252",
              fontSize: 28,
            }}
          />
        </Box>

        <Typography
          sx={{
            color: "#ff5252",
            fontFamily,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          تعذرت المطابقة
        </Typography>

        <Typography
          sx={{
            color: secondary,
            fontFamily,
            fontSize: 13,
          }}
        >
          تم العثور على اختلاف في الأرصدة التالية:
        </Typography>

        {mismatchedBalances.map((misBalance) => (
          <Box sx={{ ...currencyCard, width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: primary,
                    fontSize: 19,
                    fontWeight: 700,
                  }}
                >
                  {misBalance.currency}
                </Typography>

                <Typography
                  sx={{ color: mutedColor, fontSize: 12, fontFamily }}
                >
                  {misBalance.currencyName}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  backgroundColor: '#333',
                  border:
                    misBalance.difference !== null && misBalance.difference > 0
                      ? "1px solid rgb(253, 184, 65)"
                      : "1px solid #e53935",
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.7,
                }}
              >
                {misBalance.difference !== null && misBalance.difference > 0 ? (
                  <FaArrowUp style={{ color: "rgb(253, 184, 65)" }} />
                ) : (
                  <FaArrowDown style={{ color: "#ff5252" }} />
                )}

                <Typography
                  sx={{
                    color:
                      misBalance.difference > 0
                        ? "rgb(253, 184, 65)"
                        : "#ff5252",
                    fontFamily,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {misBalance.difference !== null && misBalance.difference > 0
                    ? "زيادة"
                    : "عجز"}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", my: 1 }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-evenly", gap: 1.5 }}
            >
              <Box>
                <Typography sx={amountLabel}>رصيد البرنامج</Typography>
                <Typography sx={amountValue}>
                  {misBalance.balance.toFixed(2)}
                </Typography>
              </Box>

              <Box>
                <Typography sx={amountLabel}>الرصيد الفعلي</Typography>
                <Typography sx={amountValue}>
                  {misBalance.formBalance || 0}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 1.5,
                p: 1.2,
              }}
            >
              <Typography sx={{ color: mutedColor, fontFamily, fontSize: 13 }}>
                قيمة الفرق
              </Typography>

              <Typography
                sx={{ color: "#ff5252", fontSize: 19, fontWeight: 700 }}
              >
                {misBalance.difference !== null
                  ? misBalance.difference
                  : "لم يتم إدخال الرصيد"}
              </Typography>
            </Box>
          </Box>
        ))}

        <Typography
          sx={{
            color: mutedColor,
            fontFamily,
            fontSize: 12,
            my: 0.5,
          }}
        >
          يرجى مراجعة الأرصدة وتصحيح الاختلافات قبل اعتماد المطابقة
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
