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
