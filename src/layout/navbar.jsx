import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import "../styles/navbar.css";
import websiteLogo from "../assets/websiteLogo.png";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import { useBackup } from "../context/BackupContext";

function Navbar() {
  const { schedulerStatus, isDirty, backupNow } = useBackup();

  const resumeBackup = schedulerStatus.status === "auth-required" && isDirty;

  return (
    <Box className="navbar-box">
      <Box className="navbar-links">
        <Link to="/">الصفحة الرئيسية</Link>
        <Link to="/operations">إجراء عملية</Link>
        <Link to="/depts">الديون</Link>
        <Link to="/inventory">الجرد</Link>
        <Link to="/archive">الأرشيف</Link>
      </Box>

      <Button
        disabled={!resumeBackup}
        onClick={backupNow}
        variant="contained"
        sx={{
          position: "relative",
          right: "150px",
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
    </Box>
  );
}
export default Navbar;
