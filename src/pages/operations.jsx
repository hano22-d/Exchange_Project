import { Box, Typography } from "@mui/material";
import { Link, Outlet, useLocation } from "react-router-dom";
import "../styles/operations.css";
import { MdCurrencyExchange } from "react-icons/md";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FaFileInvoice } from "react-icons/fa";

export default function Operations() {
  const location = useLocation();
  return (
    <Box className="container">
      <Typography
        variant="h6"
        sx={{
          fontFamily: "'Alyamama', sans-serif",
          fontWeight: 800,
          color: "white",
          py: 1,
        }}
      >
        اختر نوع العملية:
      </Typography>
      <Box className="linksBox">
        <Box
          className={`linkAndIcon ${location.pathname === "/operations" ? "active" : ""}`}
        >
          <MdCurrencyExchange className="icon" />

          <Link to="" className={`link`}>
            صرف
          </Link>
        </Box>
        <Box
          className={`linkAndIcon ${location.pathname.endsWith("/transfer") ? "active" : ""}`}
        >
          <FaMoneyBillTransfer className="icon" />

          <Link to="transfer" className={`link`}>
            حوالة
          </Link>
        </Box>
        <Box
          className={`linkAndIcon ${location.pathname.endsWith("/dept") ? "active" : ""}`}
        >
          <FaFileInvoice className="icon" />

          <Link to="dept" className={`link`}>
            دين
          </Link>
        </Box>
      </Box>
      <Outlet />
    </Box>
  );
}
