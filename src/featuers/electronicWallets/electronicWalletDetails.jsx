import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import CallReceivedRoundedIcon from "@mui/icons-material/CallReceivedRounded";
import CallMadeRoundedIcon from "@mui/icons-material/CallMadeRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import {
  formatWalletNumber,
  getCurrencyInfo,
  OPERATION_LABELS,
  useBlobObjectUrl,
  WALLET_COLORS,
  WALLET_FONT,
} from "./walletUiUtils";
import { useElectronicWallet } from "../../hooks/electronicWallet_Hooks/useElectronicWallet";
import useElectronicWalletOperations from "../../hooks/electronicWallet_Hooks/useElectronicWalletOperations";
import useCashboxContext from "../../hooks/cashbox_Hooks/useCashboxContext";
import useElectronicWalletActions from "../../hooks/electronicWallet_Hooks/useElectronicWalletActions";
import WalletOperationsList from "./WalletOperationsList";
import AddWalletCurrencyDialog from "./AddWalletCurrencyDialog";
import WalletOperationDialog from "./WalletOperationDialog";
import AddWalletDialog from "./AddWalletDialog";
import DeleteDialog from "../../shared/ui/deleteDialog";
import BasicToast from "../../shared/ui/toast";

const FILTER_FIELD_SX = {
  minWidth: { xs: "100%", sm: 150 },
  "& .MuiInputLabel-root": { color: "#aaa", fontFamily: WALLET_FONT },
  "& .MuiInputLabel-root.Mui-focused": { color: WALLET_COLORS.gold },
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    bgcolor: "#151515",
    borderRadius: 2,
    fontFamily: WALLET_FONT,
    "& fieldset": { borderColor: WALLET_COLORS.goldBorder },
    "&:hover fieldset, &.Mui-focused fieldset": {
      borderColor: WALLET_COLORS.gold,
    },
  },
};

const EMPTY_FILTERS = {
  currency: "",
  operationType: "",
  dateFrom: "",
  dateTo: "",
  note: "",
};

function WalletHeaderLogo({ logo, provider }) {
  const imageUrl = useBlobObjectUrl(logo);

  return (
    <Avatar
      variant="rounded"
      src={imageUrl || undefined}
      alt={provider}
      sx={{
        width: 72,
        height: 72,
        borderRadius: 3,
        bgcolor: WALLET_COLORS.goldSoft,
        color: WALLET_COLORS.gold,
        border: `1px solid ${WALLET_COLORS.goldBorder}`,
        "& img": { objectFit: "contain", p: 0.5 },
      }}
    >
      <AccountBalanceWalletRoundedIcon sx={{ fontSize: 40 }} />
    </Avatar>
  );
}

function CurrencyBalanceCard({ balance }) {
  const currency = getCurrencyInfo(balance.currency);
  const Flag = currency.FlagComponent;

  return (
    <Box
      sx={{
        p: 2.3,
        borderRadius: 3,
        bgcolor: WALLET_COLORS.panel,
        border: `1px solid ${WALLET_COLORS.goldBorder}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {Flag ? (
            <Flag style={{ width: 30, height: 21, borderRadius: 4 }} />
          ) : null}
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>
              {balance.currency}
            </Typography>
            <Typography sx={{ color: WALLET_COLORS.muted, fontSize: 11.5 }}>
              {currency.nameAr}
            </Typography>
          </Box>
        </Box>
        <AccountBalanceWalletRoundedIcon
          sx={{ color: WALLET_COLORS.gold, opacity: 0.8 }}
        />
      </Box>
      <Typography
        sx={{
          color: WALLET_COLORS.gold,
          fontWeight: 900,
          fontSize: { xs: 23, md: 27 },
          direction: "ltr",
          textAlign: "right",
        }}
      >
        {formatWalletNumber(balance.balance)}
      </Typography>
    </Box>
  );
}

export default function ElectronicWalletDetails() {
  const { walletId } = useParams();
  const navigate = useNavigate();
  const {
    wallet,
    balances,
    loading: walletLoading,
    error: walletError,
    refetch: refetchWallet,
  } = useElectronicWallet(walletId);

  const {
    operations,
    loading: operationsLoading,
    error: operationsError,
    refetch: refetchOperations,
  } = useElectronicWalletOperations(walletId);

  const { cashboxes } = useCashboxContext();
  const actions = useElectronicWalletActions();

  const [addCurrencyOpen, setAddCurrencyOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [operationDialogOpen, setOperationDialogOpen] = useState(false);
  const [operationType, setOperationType] = useState("withdrawal");
  const [editingOperation, setEditingOperation] = useState(null);
  const [deletingOperation, setDeletingOperation] = useState(null);
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const walletIdNumber = Number(walletId);

  const actionButtons = [
    {
      type: "withdrawal",
      label: "سحب نقدي",
      icon: <ArrowDownwardRoundedIcon />,
    },
    { type: "deposit", label: "إيداع نقدي", icon: <ArrowUpwardRoundedIcon /> },
    {
      type: "external_in",
      label: "وارد خارجي",
      icon: <CallReceivedRoundedIcon />,
    },
    {
      type: "external_out",
      label: "صادر خارجي",
      icon: <CallMadeRoundedIcon />,
    },
    { type: "adjustment", label: "تسوية", icon: <TuneRoundedIcon /> },
  ];

  const currencyFilterOptions = useMemo(
    () => balances.map((item) => item.currency),
    [balances]
  );

  function showToast(message, severity = "success") {
    setToast({ open: true, message, severity });
  }

  async function refreshWalletAndOperations() {
    await Promise.all([refetchWallet(), refetchOperations(filters)]);
  }

  async function handleAddCurrency(formData) {
    const result = await actions.addWalletCurrency(walletIdNumber, formData);
    await refreshWalletAndOperations();
    setAddCurrencyOpen(false);
    showToast("تمت إضافة العملة إلى المحفظة.");
    return result;
  }

  async function handleUpdateWallet(formData) {
    const result = await actions.updateWallet(walletIdNumber, formData);
    await refetchWallet();
    setWalletDialogOpen(false);
    showToast("تم تحديث بيانات المحفظة.");
    return result;
  }

  async function handleToggleWallet() {
    try {
      await actions.setWalletActive(walletIdNumber, !wallet.active);
      await refetchWallet();
      showToast(wallet.active ? "تم إيقاف المحفظة." : "تم تفعيل المحفظة.");
    } catch (error) {
      showToast(error.message || "تعذر تغيير حالة المحفظة.", "error");
    }
  }

  function openCreateOperation(type) {
    setEditingOperation(null);
    setOperationType(type);
    setOperationDialogOpen(true);
  }

  function openEditOperation(operation) {
    setEditingOperation(operation);
    setOperationType(operation.operationType);
    setOperationDialogOpen(true);
  }

  async function handleSaveOperation(formData) {
    let result;

    if (editingOperation) {
      result = await actions.updateWalletOperation(
        walletIdNumber,
        editingOperation.id,
        formData
      );
    } else {
      const creators = {
        withdrawal: actions.createWithdrawal,
        deposit: actions.createDeposit,
        external_in: actions.createExternalIn,
        external_out: actions.createExternalOut,
        adjustment: actions.createWalletAdjustment,
      };

      const create = creators[formData.operationType];
      if (!create) throw new Error("نوع العملية غير مدعوم.");

      result = await create(walletIdNumber, formData);
    }

    await refreshWalletAndOperations();
    setOperationDialogOpen(false);
    setEditingOperation(null);
    showToast(
      editingOperation ? "تم تعديل العملية بنجاح." : "تم تسجيل العملية بنجاح."
    );
    return result;
  }

  async function handleDeleteOperation() {
    if (!deletingOperation) return;

    try {
      await actions.deleteWalletOperation(walletIdNumber, deletingOperation.id);
      await refreshWalletAndOperations();
      setDeletingOperation(null);
      showToast("تم حذف العملية وعكس أثرها المالي.");
    } catch (error) {
      showToast(error.message || "تعذر حذف العملية.", "error");
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    refetchOperations(filters).catch((error) =>
      showToast(error.message, "error")
    );
  }

  function handleResetFilters() {
    setFilters({ ...EMPTY_FILTERS });
    refetchOperations({}).catch((error) => showToast(error.message, "error"));
  }

  if (!wallet && !walletError) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#090909",
        }}
      >
        <CircularProgress sx={{ color: WALLET_COLORS.gold }} />
      </Box>
    );
  }

  if (walletError || !wallet) {
    return (
      <Box sx={{ minHeight: "70vh", bgcolor: "#090909", p: 4 }}>
        <Alert severity="error">
          {walletError?.message || "المحفظة المطلوبة غير موجودة."}
        </Alert>
        <Button
          onClick={() => navigate("/electronic-wallets")}
          sx={{ mt: 2, color: WALLET_COLORS.gold, fontFamily: WALLET_FONT }}
        >
          العودة إلى المحافظ
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 90px)",
        px: { xs: 2, md: 4 },
        py: 3.5,
        bgcolor: "#090909",
      }}
    >
      <Box sx={{ maxWidth: 1500, mx: "auto" }}>
        <Button
          onClick={() => navigate("/electronic-wallets")}
          startIcon={<ArrowForwardRoundedIcon />}
          sx={{
            color: "#c7c7c7",
            fontFamily: WALLET_FONT,
            mb: 2,
            textTransform: "none",
            "&:hover": { color: WALLET_COLORS.gold, bgcolor: "transparent" },
          }}
        >
          العودة إلى المحافظ
        </Button>

        {/* رأس المحفظة */}
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            bgcolor: WALLET_COLORS.panel,
            border: `1px solid ${WALLET_COLORS.goldBorder}`,
            borderRadius: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                minWidth: 0,
              }}
            >
              <WalletHeaderLogo logo={wallet.logo} provider={wallet.provider} />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    color: "#fff",
                    fontSize: { xs: 22, md: 28 },
                    fontWeight: 900,
                    fontFamily: WALLET_FONT,
                  }}
                >
                  {wallet.name}
                </Typography>
                <Typography sx={{ color: WALLET_COLORS.muted, mt: 0.4 }}>
                  {wallet.provider}
                </Typography>
                <Chip
                  size="small"
                  label={wallet.active ? "المحفظة نشطة" : "المحفظة متوقفة"}
                  sx={{
                    mt: 1,
                    color: wallet.active ? WALLET_COLORS.gold : "#ccc",
                    bgcolor: wallet.active
                      ? WALLET_COLORS.goldSoft
                      : "rgba(255,255,255,.07)",
                    border: `1px solid ${WALLET_COLORS.goldBorder}`,
                    fontFamily: WALLET_FONT,
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<EditRoundedIcon />}
                onClick={() => setWalletDialogOpen(true)}
                sx={{
                  borderColor: WALLET_COLORS.goldBorder,
                  color: WALLET_COLORS.gold,
                  fontFamily: WALLET_FONT,
                  textTransform: "none",
                }}
              >
                تعديل البيانات
              </Button>
              <Button
                variant="outlined"
                startIcon={<PowerSettingsNewRoundedIcon />}
                onClick={handleToggleWallet}
                disabled={actions.updatingWalletStatus}
                sx={{
                  borderColor: wallet.active
                    ? "rgba(239,154,154,.45)"
                    : "rgba(129,199,132,.45)",
                  color: wallet.active ? "#ef9a9a" : "#81c784",
                  fontFamily: WALLET_FONT,
                  textTransform: "none",
                }}
              >
                {actions.updatingWalletStatus
                  ? "جار التحديث..."
                  : wallet.active
                  ? "إيقاف المحفظة"
                  : "تفعيل المحفظة"}
              </Button>
            </Box>
          </Box>
          {wallet.note && (
            <Typography
              sx={{ color: WALLET_COLORS.muted, fontSize: 13, mt: 2 }}
            >
              {wallet.note}
            </Typography>
          )}
        </Box>

        {/* أرصدة العملات */}
        <Box sx={{ mt: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 800,
                  fontFamily: WALLET_FONT,
                }}
              >
                أرصدة العملات
              </Typography>
              <Typography
                sx={{ color: WALLET_COLORS.muted, fontSize: 12, mt: 0.3 }}
              >
                كل عملة لها رصيد مستقل ضمن هذه المحفظة
              </Typography>
            </Box>
            <Button
              onClick={() => setAddCurrencyOpen(true)}
              disabled={!wallet.active || actions.addingCurrency}
              variant="contained"
              startIcon={<AddRoundedIcon />}
              sx={{
                bgcolor: WALLET_COLORS.gold,
                color: "#111",
                fontWeight: 800,
                fontFamily: WALLET_FONT,
                textTransform: "none",
                "&:hover": { bgcolor: "#e5cf62" },
              }}
            >
              إضافة عملة
            </Button>
          </Box>

          {balances.length === 0 ? (
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px dashed ${WALLET_COLORS.goldBorder}`,
                textAlign: "center",
                bgcolor: "rgba(255,255,255,.015)",
              }}
            >
              <Typography
                sx={{ color: "#ddd", fontFamily: WALLET_FONT, fontWeight: 700 }}
              >
                لم تتم إضافة أي عملة إلى هذه المحفظة
              </Typography>
              <Typography
                sx={{ color: WALLET_COLORS.muted, fontSize: 13, mt: 0.5 }}
              >
                ابدأ بإضافة عملة ورصيدها الافتتاحي.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2,minmax(0,1fr))",
                  lg: "repeat(3,minmax(0,1fr))",
                },
                gap: 2,
              }}
            >
              {balances.map((balance) => (
                <CurrencyBalanceCard key={balance.currency} balance={balance} />
              ))}
            </Box>
          )}
        </Box>

        {/* أزرار العمليات */}
        <Box
          sx={{
            mt: 4,
            p: { xs: 2, md: 2.5 },
            bgcolor: WALLET_COLORS.panel,
            border: `1px solid ${WALLET_COLORS.goldBorder}`,
            borderRadius: 3,
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                color: "#fff",
                fontSize: 19,
                fontWeight: 800,
                fontFamily: WALLET_FONT,
              }}
            >
              تسجيل حركة جديدة
            </Typography>
            <Typography
              sx={{ color: WALLET_COLORS.muted, fontSize: 12, mt: 0.3 }}
            >
              اختر نوع الحركة التي حدثت فعليًا على المحفظة
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
            {actionButtons.map((item) => (
              <Button
                key={item.type}
                onClick={() => openCreateOperation(item.type)}
                disabled={!wallet.active || balances.length === 0}
                startIcon={item.icon}
                variant={
                  item.type === "withdrawal" || item.type === "deposit"
                    ? "contained"
                    : "outlined"
                }
                sx={{
                  bgcolor:
                    item.type === "withdrawal" || item.type === "deposit"
                      ? WALLET_COLORS.gold
                      : "transparent",
                  color:
                    item.type === "withdrawal" || item.type === "deposit"
                      ? "#111"
                      : WALLET_COLORS.gold,
                  borderColor: WALLET_COLORS.goldBorder,
                  fontFamily: WALLET_FONT,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor:
                      item.type === "withdrawal" || item.type === "deposit"
                        ? "#e5cf62"
                        : WALLET_COLORS.goldSoft,
                    borderColor: WALLET_COLORS.gold,
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          {!wallet.active && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              المحفظة متوقفة؛ أعد تفعيلها لتسجيل حركات جديدة.
            </Alert>
          )}
          {wallet.active && balances.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              أضف عملة واحدة على الأقل قبل تسجيل أي حركة.
            </Alert>
          )}
        </Box>

        {/* سجل العمليات */}
        <Box
          sx={{
            mt: 4,
            p: { xs: 2, md: 2.5 },
            bgcolor: WALLET_COLORS.panel,
            border: `1px solid ${WALLET_COLORS.goldBorder}`,
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 800,
                  fontFamily: WALLET_FONT,
                }}
              >
                سجل العمليات
              </Typography>
              <Typography
                sx={{ color: WALLET_COLORS.muted, fontSize: 12, mt: 0.3 }}
              >
                جميع الحركات المسجلة لهذه المحفظة
              </Typography>
            </Box>
            {operationsLoading && (
              <CircularProgress size={19} sx={{ color: WALLET_COLORS.gold }} />
            )}
          </Box>

          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1.2,
              mb: 2.5,
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: "#191919",
            }}
          >
            <FormControl size="small" sx={FILTER_FIELD_SX}>
              <InputLabel id="wallet-filter-currency-label">العملة</InputLabel>
              <Select
                labelId="wallet-filter-currency-label"
                value={filters.currency}
                label="العملة"
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    currency: event.target.value,
                  }))
                }
              >
                <MenuItem value="">كل العملات</MenuItem>
                {currencyFilterOptions.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={FILTER_FIELD_SX}>
              <InputLabel id="wallet-filter-type-label">نوع العملية</InputLabel>
              <Select
                labelId="wallet-filter-type-label"
                value={filters.operationType}
                label="نوع العملية"
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    operationType: event.target.value,
                  }))
                }
              >
                <MenuItem value="">كل الأنواع</MenuItem>
                {Object.entries(OPERATION_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="من تاريخ"
              type="date"
              value={filters.dateFrom}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  dateFrom: event.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              sx={FILTER_FIELD_SX}
            />
            <TextField
              size="small"
              label="إلى تاريخ"
              type="date"
              value={filters.dateTo}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  dateTo: event.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              sx={FILTER_FIELD_SX}
            />
            <TextField
              size="small"
              label="بحث في الملاحظات"
              value={filters.note}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  note: event.target.value,
                }))
              }
              sx={{ ...FILTER_FIELD_SX, flex: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<TuneRoundedIcon />}
              sx={{
                bgcolor: WALLET_COLORS.gold,
                color: "#111",
                fontFamily: WALLET_FONT,
                textTransform: "none",
                fontWeight: 800,
                "&:hover": { bgcolor: "#e5cf62" },
              }}
            >
              بحث
            </Button>
            <Button
              onClick={handleResetFilters}
              variant="text"
              sx={{
                color: "#bbb",
                fontFamily: WALLET_FONT,
                textTransform: "none",
              }}
            >
              إعادة ضبط
            </Button>
          </Box>

          {operationsError && operations.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              تعذر تحديث سجل العمليات: {operationsError.message}
            </Alert>
          )}
          <WalletOperationsList
            operations={operations}
            loading={operationsLoading}
            error={operationsError}
            onEdit={openEditOperation}
            onDelete={setDeletingOperation}
          />
        </Box>
      </Box>

      {/* نوافذ الإجراءات */}
      <AddWalletCurrencyDialog
        open={addCurrencyOpen}
        onClose={() => setAddCurrencyOpen(false)}
        onConfirm={handleAddCurrency}
        loading={actions.addingCurrency}
        cashboxes={cashboxes}
        existingBalances={balances}
      />

      <WalletOperationDialog
        open={operationDialogOpen}
        onClose={() => {
          setOperationDialogOpen(false);
          setEditingOperation(null);
        }}
        onConfirm={handleSaveOperation}
        loading={actions.creatingOperation || actions.updatingOperation}
        balances={balances}
        defaultOperationType={operationType}
        initialOperation={editingOperation}
      />

      <AddWalletDialog
        open={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        onConfirm={handleUpdateWallet}
        loading={actions.updatingWallet}
        initialWallet={wallet}
      />

      <DeleteDialog
        open={Boolean(deletingOperation)}
        onClose={() => setDeletingOperation(null)}
        onConfirm={handleDeleteOperation}
        loading={actions.deletingOperation}
        title="تأكيد حذف العملية"
        message={
          deletingOperation?.operationType === "opening_balance"
            ? "أنت على وشك حذف الرصيد الافتتاحي. سيُعكس أثره من رصيد المحفظة، وقد يرفض النظام الحذف إذا أدى ذلك إلى رصيد سالب. هل تريد المتابعة؟"
            : "سيتم حذف سجل العملية وعكس أثرها المالي على رصيد المحفظة والصندوق النقدي عند انطباق ذلك. لا يمكن التراجع عن هذا الإجراء."
        }
      />

      <BasicToast
        open={toast.open}
        onClose={() => setToast((previous) => ({ ...previous, open: false }))}
        message={toast.message}
        severity={toast.severity}
      />
    </Box>
  );
}
