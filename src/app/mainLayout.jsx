import { Outlet } from "react-router-dom";
import Navbar from "../layout/navbar";
import { Box } from "@mui/material";
import SideBar from "../layout/sideBar";
import { useState } from "react";

const SIDEBAR_WIDTH = 300;

export default function MainLayout() {
  // حالة فتح وإغلاق sidebar
  const [open, setOpen] = useState(false);

  return (
    <Box
      dir="rtl"
      sx={{
        display: "flex",
        alignItems: "flex-start",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Box
        component="aside"
        sx={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: open ? SIDEBAR_WIDTH : 0,
          flexShrink: 0,
          overflow: "hidden",
          transition: "width 0.35s ease",
          borderLeft: open ? "2px solid rgba(250,229,110,0.992)" : "none",
          background: `
            radial-gradient(
              circle at top left,
              rgba(250,229,110,0.08),
              transparent 35%
            ),
            linear-gradient(145deg, #17181c, #0c0d10)
          `,
        }}
      >
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            height: "100%",
            overflowY: "auto",
            p: 1.5,
            boxSizing: "border-box",
          }}
        >
          <SideBar />
        </Box>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar onToggleSidebar={() => setOpen((prev) => !prev)} open={open} />

        <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
          <Outlet/>
        </Box>
      </Box>
    </Box>
  );
}