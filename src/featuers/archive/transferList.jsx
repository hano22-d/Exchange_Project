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
  incoming: "#00BFA5",
  outgoing: "#FB7185",
};

const fontFamily = "'Alyamama', sans-serif";

const cellSx = {
  color: COLORS.text,
  px: 1.5,
  py: 2.2,
  borderBottom: `1px solid ${COLORS.rowBorder}`,
  whiteSpace: "nowrap",
};

export default function TransferList({
  transfers = [],
  loading,
  emptyMessage = "لا توجد حوالات لعرضها",
}) {
  
  if (loading) {
    return (
      <Typography
        sx={{
          color: COLORS.text,
          textAlign: "center",
          py: 5,
          fontFamily,
        }}
      >
        جاري تحميل الحوالات...
      </Typography>
    );
  }

  return (
    <Box
      dir="rtl"
      sx={{
        width: "100%",
        color: COLORS.text,
        bgcolor: COLORS.background,
      }}
    >
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
          aria-label="قائمة الحوالات"
          sx={{
            minWidth: 1150,
            direction: "rtl",
            borderSpacing: 0,
          }}
        >
          {/* عناوين الأعمدة */}

          <TableHead>
            <TableRow>
              {[
                "رقم الحوالة",
                "التاريخ والوقت",
                "الاسم الثلاثي",
                "الوجهة",
                "المبلغ",
                "الاتجاه",
                "الملاحظة",
                "الإجراءات",
              ].map((heading) => (
                <TableCell
                  key={heading}
                  align="center"
                  sx={{
                    color: COLORS.goldLight,
                    fontFamily,
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

          {/* بيانات الحوالات */}

          <TableBody>
            {transfers.length > 0 ? (
              transfers.map((transfer) => {
                // دعم الاسم القديم والجديد
                const fullName = transfer.fullName ?? transfer.fullname ?? "—";

                // تحديد اتجاه الحوالة
                const isIncoming =
                  transfer.direction === "وارد" ||
                  transfer.direction === "incoming";

                const isOutgoing =
                  transfer.direction === "صادر" ||
                  transfer.direction === "outgoing";

                const directionLabel = isIncoming
                  ? "وارد"
                  : isOutgoing
                  ? "صادر"
                  : transfer.direction || "غير محدد";

                const directionColor = isIncoming
                  ? COLORS.incoming
                  : isOutgoing
                  ? COLORS.outgoing
                  : COLORS.muted;

                return (
                  <TableRow
                    key={transfer.id}
                    sx={{
                      transition: "background-color 160ms ease",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.035)",
                      },
                      "&:last-child td": {
                        borderBottom: 0,
                      },
                    }}
                  >
                    {/* رقم الحوالة */}

                    <TableCell align="center" sx={cellSx}>
                      <Typography
                        component="span"
                        sx={{
                          p: 1,
                          px: 1.2,
                          color: COLORS.goldLight,
                          bgcolor: "rgba(232, 205, 58, 0.10)",
                          border: "1px solid rgba(232, 205, 58, 0.55)",
                          borderRadius: 1.8,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {transfer.id}
                      </Typography>
                    </TableCell>

                    {/* التاريخ والوقت */}

                    <TableCell align="center" sx={cellSx}>
                      <Box
                        component="span"
                        dir="ltr"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                          color: COLORS.text,
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {formatSyriaDateTime(transfer.date).replace(",", " - ")}
                      </Box>
                    </TableCell>

                    {/* الاسم الثلاثي */}

                    <TableCell align="center" sx={cellSx}>
                      <Typography
                        title={fullName}
                        sx={{
                          color: COLORS.text,
                          fontFamily,
                          fontSize: 14,
                          fontWeight: 700,
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          mx: "auto",
                        }}
                      >
                        {fullName}
                      </Typography>
                    </TableCell>

                    {/* الوجهة */}

                    <TableCell align="center" sx={cellSx}>
                      <Typography
                        sx={{
                          color: COLORS.text,
                          fontFamily,
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {transfer.destination || "—"}
                      </Typography>
                    </TableCell>

                    {/* المبلغ والعملة */}

                    <TableCell align="center" sx={cellSx}>
                      <Typography
                        component="span"
                        dir="ltr"
                        sx={{
                          color: COLORS.goldLight,
                          fontSize: 15,
                          fontWeight: 800,
                        }}
                      >
                        {`${transfer.amount ?? 0} ${transfer.currency ?? ""}`}
                      </Typography>
                    </TableCell>

                    {/* اتجاه الحوالة */}

                    <TableCell align="center" sx={cellSx}>
                      <Typography
                        component="span"
                        sx={{
                          display: "inline-block",
                          minWidth: 65,
                          py: 0.6,
                          px: 1.2,
                          borderRadius: 1.5,
                          color: directionColor,
                          bgcolor: isIncoming
                            ? "rgba(0, 191, 165, 0.10)"
                            : isOutgoing
                            ? "rgba(251, 113, 133, 0.10)"
                            : "rgba(189, 189, 189, 0.10)",
                          border: `1px solid ${directionColor}`,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {directionLabel}
                      </Typography>
                    </TableCell>

                    {/* الملاحظة */}

                    <TableCell
                      align="center"
                      sx={{
                        ...cellSx,
                        maxWidth: 190,
                      }}
                    >
                      <Typography
                        title={transfer.note || ""}
                        sx={{
                          color: transfer.note ? COLORS.text : COLORS.muted,
                          fontSize: 14,
                          fontFamily,
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 180,
                          mx: "auto",
                        }}
                      >
                        {transfer.note || "—"}
                      </Typography>
                    </TableCell>

                    {/* تفاصيل الحوالة */}

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
                          fontFamily,
                          fontSize: 14,
                          fontWeight: 700,
                          whiteSpace: "nowrap",

                          "& .MuiButton-startIcon": {
                            ml: 0.7,
                            mr: 0,
                          },

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
                  colSpan={8}
                  align="center"
                  sx={{
                    borderBottom: 0,
                    py: 6,
                  }}
                >
                  <Typography
                    sx={{
                      color: COLORS.muted,
                      fontSize: 16,
                      fontWeight: 600,
                      fontFamily,
                    }}
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
