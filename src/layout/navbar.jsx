import { Box, Typography } from "@mui/material";
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
      <Box
        className="logo"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          dir="rtl"
          sx={{
            display: "inline-block",
            fontFamily: `'Alyamama', 'sans-serif'`,
            fontWeight: 900,
            fontSize: {
              md: "1.2rem",
            },
            lineHeight: 1.5,
            textAlign: "center",

            background:
              "linear-gradient(120deg, #8D6513 0%, #D4AF37 25%, rgba(250, 229, 110, 0.992) 50%, #E8C65A 75%, #A87918 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          علي كرازة للصرافة
        </Typography>

        <img src="src/assets/website-Logo.png" style={{ width: "100px" }} />
      </Box>
    </Box>
  );
}
export default Navbar;
