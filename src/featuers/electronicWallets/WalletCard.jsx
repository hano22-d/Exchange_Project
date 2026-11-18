import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Chip,
  Typography,
} from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import { useNavigate } from "react-router-dom";

import {
  WALLET_COLORS,
  WALLET_FONT,
  formatWalletNumber,
  getCurrencyInfo,
  useBlobObjectUrl,
} from "./walletUiUtils";

function WalletLogo({ logo, provider, size = 62 }) {
  const imageUrl = useBlobObjectUrl(logo);

  return (
    <Avatar
      variant="rounded"
      src={imageUrl || undefined}
      alt={provider || "شعار المحفظة"}
      sx={{
        width: size,
        height: size,
        borderRadius: 3,
        bgcolor: WALLET_COLORS.goldSoft,
        color: WALLET_COLORS.gold,
        border: `1px solid ${WALLET_COLORS.goldBorder}`,
        "& img": { objectFit: "contain", p: 0.5 },
      }}
    >
      <AccountBalanceWalletRoundedIcon sx={{ fontSize: size * 0.55 }} />
    </Avatar>
  );
}

export default function WalletCard({ wallet }) {
  const navigate = useNavigate();
  const balances = wallet.balances ?? [];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        border: `1px solid ${WALLET_COLORS.goldBorder}`,
        bgcolor: WALLET_COLORS.panel,
        color: WALLET_COLORS.text,
        overflow: "hidden",
        transition:
          "transform .2s ease, border-color .2s ease, box-shadow .2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: WALLET_COLORS.gold,
          boxShadow: "0 12px 28px rgba(0,0,0,.28)",
        },
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/electronic-wallets/${wallet.id}`)}
        sx={{ height: "100%", p: 2.5, display: "flex", alignItems: "stretch" }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.7 }}>
            <WalletLogo logo={wallet.logo} provider={wallet.provider} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  color: WALLET_COLORS.text,
                  fontFamily: WALLET_FONT,
                  fontSize: 19,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {wallet.name}
              </Typography>
              <Typography
                sx={{ color: WALLET_COLORS.muted, fontSize: 13, mt: 0.4 }}
              >
                {wallet.provider}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={wallet.active ? "نشطة" : "متوقفة"}
              sx={{
                color: wallet.active ? WALLET_COLORS.gold : "#bdbdbd",
                bgcolor: wallet.active
                  ? WALLET_COLORS.goldSoft
                  : "rgba(255,255,255,.07)",
                border: `1px solid ${
                  wallet.active
                    ? WALLET_COLORS.goldBorder
                    : "rgba(255,255,255,.12)"
                }`,
                fontFamily: WALLET_FONT,
              }}
            />
          </Box>

          <Box
            sx={{ borderTop: `1px solid ${WALLET_COLORS.goldBorder}`, pt: 1.8 }}
          >
            <Typography
              sx={{
                color: WALLET_COLORS.muted,
                fontSize: 12,
                mb: 1.2,
                fontFamily: WALLET_FONT,
              }}
            >
              أرصدة المحفظة
            </Typography>

            {balances.length === 0 ? (
              <Typography sx={{ color: "#bcbcbc", fontSize: 13, py: 1 }}>
                لم تُضف أي عملة بعد
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
                {balances.slice(0, 3).map((balance) => {
                  const currency = getCurrencyInfo(balance.currency);
                  const Flag = currency.FlagComponent;

                  return (
                    <Box
                      key={balance.currency}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {Flag ? (
                          <Flag
                            style={{ width: 23, height: 16, borderRadius: 3 }}
                          />
                        ) : null}
                        <Typography sx={{ color: "#ddd", fontSize: 13 }}>
                          {balance.currency}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          color: WALLET_COLORS.gold,
                          fontWeight: 700,
                          fontSize: 15,
                          direction: "ltr",
                        }}
                      >
                        {formatWalletNumber(balance.balance)}
                      </Typography>
                    </Box>
                  );
                })}
                {balances.length > 3 && (
                  <Typography sx={{ color: WALLET_COLORS.muted, fontSize: 12 }}>
                    + {balances.length - 3} عملات أخرى
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {wallet.note ? (
            <Typography
              sx={{ color: WALLET_COLORS.muted, fontSize: 12, mt: "auto" }}
              noWrap
            >
              {wallet.note}
            </Typography>
          ) : null}
        </Box>
      </CardActionArea>
    </Card>
  );
}
