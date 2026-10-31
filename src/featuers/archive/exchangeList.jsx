import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { formatSyriaDateTime } from "../../shared/utilsDate";

const COLORS = {
  background: "#000000",
  surface: "#242424",
  gold: "#E8CD3A",
  goldLight: "#F5DF55",
  text: "#FFFFFF",
  muted: "#BDBDBD",
  rowBorder: "rgba(232, 205, 58, 0.13)",
  exchange: "#00BFA5",
};

const cellSx = {
  color: COLORS.text,
  px: 1.5,
  py: 2.2,
  borderBottom: `1px solid ${COLORS.rowBorder}`,
  whiteSpace: "nowrap",
};
const fontFamily = "'Alyamama', sans-serif";

export default function ExchangeList({
  exchanges = [],
  loading,
  emptyMessage = "لا توجد حركات صرف لعرضها",
}) {
  if (loading) return <h1>Loading...</h1>;

  return (
    <Box
      dir="rtl"
      sx={{ width: "100%", color: COLORS.text, bgcolor: COLORS.background }}
    >
      {/* جدول الحركات */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          width: "100%",
          bgcolor: COLORS.surface,
          color: COLORS.text,
          border: "none",
          borderRadius: 0,
        }}
      >
        <Table
          aria-label="قائمة حركات الصرافة"
          sx={{
            minWidth: 900,
            direction: "rtl",
            borderSpacing: 0,
          }}
        >
          <TableHead>
            <TableRow>
              {[
                "رقم العملية",
                "التاريخ والوقت",
                "تفاصيل الصرف",
                "سعر الصرف",
                "الملاحظة",
                "الإجراءات",
              ].map((heading) => (
                <TableCell
                  key={heading}
                  align="center"
                  sx={{
                    color: COLORS.goldLight,
                    fontFamily: fontFamily,
                    fontSize: 17,
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                    py: 2.6,
                    px: 1.5,
                    borderBottom: `1px solid ${COLORS.gold}`,
                  }}
                >
                  {heading}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {exchanges.length > 0 ? (
              exchanges.map((exchange) => {
                return (
                  <TableRow
                    key={exchange.id}
                    sx={{
                      transition: "background-color 160ms ease",
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 0.035)" },
                      "&:last-child td": { borderBottom: 0 },
                    }}
                  >
                    {/* رقم الحركة*/}
                    <TableCell align="center" sx={cellSx}>
                      <Typography
                        component={"span"}
                        sx={{
                          p: 1,
                          px: 1.2,
                          color: COLORS.exchange,
                          bgcolor: "rgba(0, 191, 165, 0.10)",
                          border: "1px solid rgba(0, 191, 165, 0.65)",
                          borderRadius: 1.8,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {exchange.id}
                      </Typography>
                    </TableCell>

                    {/* التاريخ والوقت */}
                    <TableCell align="center" sx={cellSx}>
                      <Box
                        component="span"
                        dir="ltr"
                        sx={{
                          display: "inline-flex",
                          gap: 0.8,
                          alignItems: "center",
                          whiteSpace: "nowrap",
                          color: COLORS.text,
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{ fontSize: "inherit", fontWeight: "inherit" }}
                        >
                          {formatSyriaDateTime(exchange.date).replace(
                            ",",
                            " - "
                          )}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* المبلغ المحوّل من العملة الأولى إلى الثانية */}
                    <TableCell align="center" sx={cellSx}>
                      <Box
                        component="span"
                        dir="ltr"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          whiteSpace: "nowrap",
                          color: COLORS.goldLight,
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{ fontSize: "inherit", fontWeight: "inherit" }}
                        >
                          {`${exchange.toAmount} ${exchange.toCurrency}`}
                        </Typography>

                        <Typography sx={{ color: COLORS.muted, fontSize: 13 }}>
                          <ArrowBackIcon />
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ fontSize: "inherit", fontWeight: "inherit" }}
                        >
                          {`${exchange.fromAmount} ${exchange.fromCurrency}`}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* سعر الصرف */}
                    <TableCell align="center" sx={cellSx}>
                      <Typography
                        component="span"
                        dir="ltr"
                        sx={{
                          color: COLORS.text,
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {exchange.rate}
                      </Typography>
                    </TableCell>

                    {/* الملاحظة */}
                    <TableCell align="center" sx={{ ...cellSx, maxWidth: 190 }}>
                      <Typography
                        title={exchange.note || ""}
                        sx={{
                          color: exchange.note ? COLORS.text : COLORS.muted,
                          fontSize: 14,
                          fontFamily: fontFamily,
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 180,
                          mx: "auto",
                        }}
                      >
                        {exchange.note || "—"}
                      </Typography>
                    </TableCell>

                    {/* فتح تفاصيل الحركة */}
                    <TableCell align="center" sx={cellSx}>
                      <Button
                        variant="outlined"
                        startIcon={
                          <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                        }
                        sx={{
                          minWidth: 100,
                          px: 1.3,
                          py: 0.65,
                          color: COLORS.goldLight,
                          borderColor: COLORS.gold,
                          borderRadius: 1.2,
                          fontFamily: fontFamily,
                          fontSize: 14,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          "& .MuiButton-startIcon": { ml: 0.7, mr: 0 },
                          "&:hover": {
                            borderColor: COLORS.goldLight,
                            bgcolor: "rgba(232, 205, 58, 0.10)",
                          },
                        }}
                      >
                        التفاصيل
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ borderBottom: 0, py: 6 }}
                >
                  <Typography
                    sx={{ color: COLORS.muted, fontSize: 16, fontWeight: 600 }}
                  >
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
