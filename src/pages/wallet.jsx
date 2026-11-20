import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import useElectronicWallets from "../hooks/electronicWallet_Hooks/useElectronicWallets";
import useElectronicWalletActions from "../hooks/electronicWallet_Hooks/useElectronicWalletActions";
import {
  WALLET_COLORS,
  WALLET_FONT,
} from "../shared/ui/walletUiUtils";
import WalletCard from "../featuers/electronicWallets/WalletCard";
import AddWalletDialog from "../featuers/electronicWallets/AddWalletDialog";
import BasicToast from "../shared/ui/toast";

export default function ElectronicWallets() {

  // ==== services ==== //
  const { wallets, loading, error, refetch } = useElectronicWallets();
  const { createWallet, creatingWallet } = useElectronicWalletActions();

  // ==== states ====
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ==== functions ==== //
  async function handleCreateWallet(formData) {
    const createdWallet = await createWallet(formData);
    await refetch();
    setAddDialogOpen(false);
    setToast({
      open: true,
      message: "تمت إضافة المحفظة بنجاح.",
      severity: "success",
    });
    return createdWallet;
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 90px)",
        px: { xs: 2, md: 4 },
        py: 4,
        bgcolor: "#090909",
      }}
    >
      {/*helper Components*/}
      <AddWalletDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onConfirm={handleCreateWallet}
        loading={creatingWallet}
      />

      <BasicToast
        open={toast.open}
        onClose={() => setToast((previous) => ({ ...previous, open: false }))}
        message={toast.message}
        severity={toast.severity}
      />

      {/*main Component*/}
      <Box
        sx={{
          maxWidth: 1450,
          mx: "auto",
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          p: { xs: 2.2, md: 3 },
          bgcolor: WALLET_COLORS.panel,
          border: `1px solid ${WALLET_COLORS.goldBorder}`,
          borderRadius: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: WALLET_COLORS.goldSoft,
              color: WALLET_COLORS.gold,
            }}
          >
            <AccountBalanceWalletRoundedIcon sx={{ fontSize: 31 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                color: "#fff",
                fontFamily: WALLET_FONT,
                fontSize: { xs: 22, md: 27 },
                fontWeight: 800,
              }}
            >
              المحافظ الإلكترونية
            </Typography>
            <Typography
              sx={{
                color: WALLET_COLORS.muted,
                fontFamily: WALLET_FONT,
                fontSize: 13,
                mt: 0.3,
              }}
            >
              إدارة المحافظ وأرصدتها وحركاتها المالية
            </Typography>
          </Box>
        </Box>

        {wallets.length > 0 && (
          <Button
            onClick={() => setAddDialogOpen(true)}
            variant="contained"
            startIcon={<AddRoundedIcon />}
            sx={{
              bgcolor: WALLET_COLORS.gold,
              color: "#111",
              fontWeight: 800,
              fontFamily: WALLET_FONT,
              px: 2.5,
              py: 1.1,
              borderRadius: 2.5,
              textTransform: "none",
              "&:hover": { bgcolor: "#e5cf62" },
            }}
          >
            إضافة محفظة
          </Button>
        )}
      </Box>

      <Box sx={{ maxWidth: 1450, mx: "auto", mt: 4 }}>
        {loading && wallets.length === 0 ? (
          <Box sx={{ py: 12, display: "flex", justifyContent: "center" }}>
            <CircularProgress sx={{ color: WALLET_COLORS.gold }} />
          </Box>
        ) : error && wallets.length === 0 ? (
          <Alert severity="error">تعذر تحميل المحافظ: {error.message}</Alert>
        ) : wallets.length === 0 ? (
          <Box
            sx={{
              minHeight: { xs: 360, md: 470 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              p: 3,
              border: `1px dashed ${WALLET_COLORS.goldBorder}`,
              borderRadius: 4,
              bgcolor: "rgba(255,255,255,.018)",
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: WALLET_COLORS.goldSoft,
                color: WALLET_COLORS.gold,
                display: "grid",
                placeItems: "center",
                mb: 2.5,
              }}
            >
              <AccountBalanceWalletRoundedIcon sx={{ fontSize: 54 }} />
            </Box>
            <Typography
              sx={{
                color: "#fff",
                fontFamily: WALLET_FONT,
                fontSize: 23,
                fontWeight: 800,
              }}
            >
              لا توجد محافظ إلكترونية بعد
            </Typography>
            <Typography
              sx={{
                color: WALLET_COLORS.muted,
                fontFamily: WALLET_FONT,
                fontSize: 14,
                mt: 1,
                maxWidth: 440,
                lineHeight: 1.9,
              }}
            >
              ابدأ بإضافة محفظة إلكترونية. بعد إنشائها يمكنك فتح تفاصيلها وإضافة
              العملات وتسجيل عمليات السحب والإيداع والحركات الخارجية.
            </Typography>
            <Button
              onClick={() => setAddDialogOpen(true)}
              variant="contained"
              startIcon={<AddRoundedIcon sx={{ fontSize: 25 }} />}
              sx={{
                mt: 4,
                minWidth: { xs: "100%", sm: 280 },
                minHeight: 66,
                px: 4,
                borderRadius: 3,
                bgcolor: WALLET_COLORS.gold,
                color: "#111",
                fontFamily: WALLET_FONT,
                fontSize: 18,
                fontWeight: 900,
                boxShadow: "0 8px 28px rgba(250,229,110,.16)",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#e5cf62",
                  boxShadow: "0 10px 32px rgba(250,229,110,.24)",
                },
              }}
            >
              إضافة أول محفظة
            </Button>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2.5,
              }}
            >
              <Typography
                sx={{ color: "#ddd", fontFamily: WALLET_FONT, fontWeight: 700 }}
              >
                المحافظ المسجلة ({wallets.length})
              </Typography>
              {loading && (
                <CircularProgress
                  size={19}
                  sx={{ color: WALLET_COLORS.gold }}
                />
              )}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2.5,
              }}
            >
              {wallets.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} />
              ))}
            </Box>
            {error && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                تعذر تحديث قائمة المحافظ: {error.message}
              </Alert>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
