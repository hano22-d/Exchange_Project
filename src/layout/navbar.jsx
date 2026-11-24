import { Box, Button, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import "../styles/navbar.css";
import websiteLogo from "../assets/websiteLogo.png";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import { useBackup } from "../context/BackupContext";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

function Navbar({ onToggleSidebar, open }) {
  const {
    schedulerStatus,
    isDirty,
    backupNow,
  } = useBackup();

  const resumeBackup = schedulerStatus.status === "auth-required" && isDirty;

  return (
    <Box className="navbar-box">
      <IconButton
        onClick={onToggleSidebar}
        aria-label={open ? "إغلاق القائمة الجانبية" : "فتح القائمة الجانبية"}
        edge="start"
        sx={{
          color: "rgba(250, 229, 110, 0.992)",
          transform: open ? "translateX(85px)" : "translateX(0)",
          transition: "transform 0.3s ease",
        }}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      <Button
        disabled={!resumeBackup}
        onClick={backupNow}
        variant="contained"
        sx={{
          minWidth: 0,
          width: 42,
          height: 42,
          padding: 0,
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: resumeBackup
            ? "linear-gradient(135deg, #ff4b4b 0%, #d32f2f 100%)"
            : "linear-gradient(135deg, rgb(97, 230, 44) 0%, rgb(24, 201, 62) 100%)",
          color: "#fff",
          fontWeight: 600,
          textTransform: "none",
          transition: "all 0.25s ease-in-out",
          "&:hover": {
            background: resumeBackup
              ? "linear-gradient(135deg, rgb(245, 34, 34) 0%, #d32f2f 100%)"
              : "linear-gradient(135deg, rgb(51, 156, 10) 0%, rgb(24, 201, 62) 100%)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        }}
      >
        {resumeBackup ? (
          <RestoreRoundedIcon sx={{ fontSize: "1.4rem" }} />
        ) : (
          <CloudSyncRoundedIcon sx={{ fontSize: "1.4rem" }} />
        )}
      </Button>

      <Box className="navbar-links">
        <Link to="/">الصفحة الرئيسية</Link>
        <Link to="/operations">إجراء عملية</Link>
        <Link to="/depts">الديون</Link>
        <Link to="/electronic-wallets">المحافظ الإلكترونية</Link>
        <Link to="/archive">الأرشيف</Link>
        <Link to="/inventory">الجرد</Link>
      </Box>

      <Box
        className="logo"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img src={websiteLogo} style={{ width: "90px" }} />
      </Box>
    </Box>
  );
}
export default Navbar;
