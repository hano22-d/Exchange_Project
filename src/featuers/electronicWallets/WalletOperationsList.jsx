import {
  Alert,
  Box,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  OPERATION_LABELS,
  WALLET_COLORS,
  WALLET_FONT,
  formatWalletNumber,
} from "./walletUiUtils";
import { formatSyriaDateTime } from "../../shared/utilsDate";

function getTypeColor(type) {
  if (
    type === "withdrawal" ||
    type === "external_in" ||
    type === "opening_balance"
  )
    return "success";
  if (type === "deposit" || type === "external_out") return "warning";
  if (type === "adjustment") return "info";
  return "default";
}

function getAmountPrefix(operation) {
  if (operation.operationType === "adjustment") {
    return Number(operation.amount) > 0 ? "+" : "−";
  }

  if (
    ["withdrawal", "external_in", "opening_balance"].includes(
      operation.operationType
    )
  ) {
    return "+";
  }

  return "−";
}

export default function WalletOperationsList({
    operations = [],
    loading = false,
    error = null,
    onEdit,
    onDelete,
  }) {
  if (loading && operations.length === 0) {
    return (
      <Box sx={{ py: 5, textAlign: "center" }}>
        <Typography
          sx={{ color: WALLET_COLORS.muted, fontFamily: WALLET_FONT }}
        >
          جار تحميل الحركات...
        </Typography>
      </Box>
    );
  }

  if (error && operations.length === 0) {
    return (
      <Alert severity="error">تعذر تحميل سجل العمليات: {error.message}</Alert>
    );
  }

  if (operations.length === 0) {
    return (
      <Box
        sx={{
          py: 5,
          textAlign: "center",
          border: `1px dashed ${WALLET_COLORS.goldBorder}`,
          borderRadius: 3,
          bgcolor: "rgba(255,255,255,.015)",
        }}
      >
        <SwapHorizRoundedIcon sx={{ color: "#777", fontSize: 38, mb: 1 }} />
        <Typography
          sx={{ color: "#ddd", fontFamily: WALLET_FONT, fontWeight: 700 }}
        >
          لا توجد عمليات مسجلة
        </Typography>
        <Typography sx={{ color: WALLET_COLORS.muted, fontSize: 13, mt: 0.5 }}>
          ستظهر الحركات هنا بعد تسجيل أول عملية على هذه المحفظة.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.2,
          opacity: loading ? 0.65 : 1,
        }}
      >
        {operations.map((operation) => {
          const isIncoming = [
            "withdrawal",
            "external_in",
            "opening_balance",
          ].includes(operation.operationType);
          const DirectionIcon = isIncoming
            ? ArrowDownwardRoundedIcon
            : ArrowUpwardRoundedIcon;
          const amountColor =
            operation.operationType === "adjustment"
              ? Number(operation.amount) >= 0
                ? "#81c784"
                : "#ffb74d"
              : isIncoming
              ? "#81c784"
              : "#ffcc80";

          return (
            <Box
              key={operation.id}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr auto",
                  md: "minmax(150px,1fr) minmax(130px,1fr) minmax(150px,1fr) minmax(120px,auto)",
                },
                alignItems: "center",
                gap: { xs: 1, md: 2 },
                p: 1.7,
                borderRadius: 2.5,
                bgcolor: "#202020",
                border: "1px solid rgba(255,255,255,.07)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: isIncoming
                      ? "rgba(76,175,80,.12)"
                      : "rgba(255,183,77,.12)",
                  }}
                >
                  <DirectionIcon sx={{ color: amountColor, fontSize: 19 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      fontFamily: WALLET_FONT,
                      fontSize: 14,
                    }}
                  >
                    {OPERATION_LABELS[operation.operationType] ||
                      operation.operationType}
                  </Typography>
                  <Typography
                    sx={{ color: WALLET_COLORS.muted, fontSize: 11.5 }}
                  >
                    {formatSyriaDateTime(operation.date)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: { xs: "right", md: "center" } }}>
                <Typography
                  sx={{
                    color: amountColor,
                    fontWeight: 800,
                    fontSize: 17,
                    direction: "ltr",
                  }}
                >
                  {getAmountPrefix(operation)}
                  {formatWalletNumber(Math.abs(Number(operation.amount)))}
                  <Typography
                    component="span"
                    sx={{ color: "#bbb", fontSize: 12, ml: 0.7 }}
                  >
                    {operation.currency}
                  </Typography>
                </Typography>
                {Number(operation.feeAmount) > 0 && (
                  <Typography sx={{ color: WALLET_COLORS.muted, fontSize: 11 }}>
                    العمولة: {formatWalletNumber(operation.feeAmount)}{" "}
                    {operation.currency}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0 }}>
                {operation.note ? (
                  <Typography
                    sx={{
                      color: "#bdbdbd",
                      fontSize: 12.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={operation.note}
                  >
                    {operation.note}
                  </Typography>
                ) : (
                  <Typography sx={{ color: "#666", fontSize: 12 }}>
                    بدون ملاحظات
                  </Typography>
                )}
                <Chip
                  size="small"
                  color={getTypeColor(operation.operationType)}
                  label={
                    operation.feeMode === "included"
                      ? "العمولة مقتطعة"
                      : operation.feeMode === "separate" &&
                        operation.feeAmount > 0
                      ? "عمولة منفصلة"
                      : ""
                  }
                  sx={{
                    mt: 0.5,
                    height: 19,
                    fontSize: 10,
                    visibility: operation.feeAmount > 0 ? "visible" : "hidden",
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 0.3,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => onEdit(operation)}
                  title="تعديل العملية"
                  sx={{ color: WALLET_COLORS.gold }}
                >
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete(operation)}
                  title="حذف العملية"
                  sx={{ color: "#ef9a9a" }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
