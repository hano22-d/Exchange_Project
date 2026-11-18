import { useEffect, useState } from "react";
import { getSupportedCurrency } from "../../shared/currencydata/currencies";

export const WALLET_COLORS = {
  gold: "rgba(250,229,110,0.992)",
  goldSoft: "rgba(250,229,110,0.14)",
  goldBorder: "rgba(250,229,110,0.32)",
  background: "#171717",
  panel: "#232323",
  panelLight: "#2b2b2b",
  text: "#ffffff",
  muted: "#a7a7a7",
};

export const WALLET_FONT = "'Alyamama', sans-serif";

export const OPERATION_TYPES = [
  { value: "withdrawal", label: "سحب نقدي" },
  { value: "deposit", label: "إيداع نقدي" },
  { value: "external_in", label: "وارد خارجي" },
  { value: "external_out", label: "صادر خارجي" },
  { value: "adjustment", label: "تسوية رصيد" },
];

export const OPERATION_LABELS = {
  opening_balance: "رصيد افتتاحي",
  withdrawal: "سحب نقدي",
  deposit: "إيداع نقدي",
  external_in: "وارد خارجي",
  external_out: "صادر خارجي",
  adjustment: "تسوية رصيد",
};

export function getCurrencyInfo(currency) {
  return (
    getSupportedCurrency(currency) ?? {
      code: currency,
      nameAr: currency,
      FlagComponent: null,
    }
  );
}

export function formatWalletNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
  }).format(number);
}

export function toDamascusDateTimeLocal(timestamp = Date.now()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Damascus",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function useBlobObjectUrl(blob) {
  // This is intentionally a tiny reusable hook for wallet logos stored as Blob.
  // The object URL must be revoked when the logo changes or the component unmounts.
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!(blob instanceof Blob)) {
      setUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url;
}
