import { Box, Button, IconButton, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import "../styles/navbar.css";
import websiteLogo from "../assets/websiteLogo.png";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import { useBackup } from "../context/BackupContext";
import SideBar from "./sideBar";
import { MdClose } from "react-icons/md";
import { useState } from "react";

function Navbar() {
  const [open, setOpen] = useState(false);

  const { schedulerStatus, isDirty, backupNow } = useBackup();

  const resumeBackup = schedulerStatus.status === "auth-required" && isDirty;

  return (
    <Box className="navbar-box">
      <Box className="navbar-links">
        <Link to="/">الصفحة الرئيسية</Link>
        <Link to="/operations">إجراء عملية</Link>
        <Link to="/depts">الديون</Link>
        <Link to="/electronic-wallets">المحافظ الإلكترونية</Link>
        <Link to="/archive">الأرشيف</Link>
        <Link to="/inventory">الجرد</Link>
      </Box>

      <Button
        disabled={!resumeBackup}
        onClick={backupNow}
        variant="contained"
        sx={{
          position: "relative",
          right: "80px",
          background: resumeBackup
            ? "linear-gradient(135deg, #ff4b4b 0%, #d32f2f 100%)"
            : "linear-gradient(135deg,rgb(97, 230, 44) 0%,rgb(24, 201, 62) 100%)",
          color: "#fff",
          fontFamily: `'Alyamama', 'sans-serif'`,
          fontWeight: 600,
          fontSize: "0.75rem",
          padding: "2px 8px",
          borderRadius: "10px",
          textTransform: "none",
          transition: "all 0.25s ease-in-out",
          "&:hover": {
            background: resumeBackup
              ? "linear-gradient(135deg,rgb(245, 34, 34) 0%, #d32f2f 100%)"
              : "linear-gradient(135deg,rgb(51, 156, 10) 0%,rgb(24, 201, 62) 100%)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        }}
      >
        <Typography component={"span"}>
          {resumeBackup ? (
            <RestoreRoundedIcon sx={{ fontSize: "1.5rem", pl: 0.5 }} />
          ) : (
            <CloudSyncRoundedIcon sx={{ fontSize: "1.5rem", pl: 0.5 }} />
          )}
        </Typography>
        {resumeBackup ? "استئناف النسخ" : "النسخ يعمل"}
      </Button>
      <Box
        className="logo"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img src={websiteLogo} style={{ width: "100px" }} />
      </Box>
      <Box
        onClick={() => setOpen(false)}
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 1300,
          backgroundColor: "rgba(0, 0, 0, 0.66)",
          visibility: open ? "visible" : "hidden",
          opacity: open ? 1 : 0,
          transition: "all 0.3s ease",
        }}
      />
      <Box
        dir="rtl"
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 300,
          height: "100vh",
          zIndex: 1300,

          background: `
            radial-gradient(
            circle at top left,
          rgba(250,229,110,0.08),
            transparent 35%
            ),
            linear-gradient(145deg, #17181c, #0c0d10)
          `,

          borderLeft: "2px solid rgba(250,229,110,0.992)",
          boxShadow: "-15px 0 50px rgba(0,0,0,0.65)",

          transform: open ? "translateX(0)" : "translateX(100%)",

          visibility: open ? "visible" : "hidden",
          transition: "transform 0.35s ease, visibility 0.35s",

          p: 1.5,
        }}
      >
        {/* Close Button */}

        <IconButton
          onClick={() => setOpen(false)}
          sx={{
            position: "relative",
            right: 270,
            bottom: 5,
            color: "#fff",
            border: "1px solid #555",
            backgroundColor: "#25262a",
            "&:hover": {
              color: "rgba(250,229,110,0.992)",
              borderColor: "rgba(250,229,110,0.992)",
            },
          }}
        >
          <MdClose size={15} />
        </IconButton>
        <SideBar />
      </Box>
    </Box>
  );
}
export default Navbar;
