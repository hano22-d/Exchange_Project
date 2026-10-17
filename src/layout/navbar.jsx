import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  return (
    <Box className="navbar-box">
      <Box className="navbar-links">
        <Link to="/">الصفحة الرئيسية</Link>
        <Link to="/operations">إجراء عملية</Link>
        <Link to="/depts">الديون</Link>
        <Link to="/inventory">الجرد</Link>
        <Link to="/archive">الأرشيف</Link>
      </Box>
      <Box className="logo">
        <img src="src\assets\logo.png" />
      </Box>
    </Box>
  );
}
export default Navbar;
