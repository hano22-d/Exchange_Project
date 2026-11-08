import { useParams } from "react-router-dom";
import { Typography } from "@mui/material";
import ExchangeDetails from "./exchange_details_archive";
import TransferDetails from "./transfers_details_archive";

export default function ArchiveDetailsSwitcher() {
  const { type } = useParams();

  if (type === "exchange") {
    return <ExchangeDetails />;
  }

  if (type === "transfer") {
    return <TransferDetails />;
  }

  return (
    <Typography sx={{ color: "red", textAlign: "center", mt: 5 }}>
      عذراً، هذا القسم غير موجود بالأرشيف.
    </Typography>
  );
}
