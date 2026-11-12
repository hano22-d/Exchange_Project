import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";

import { FaCheckDouble, FaTimes } from "react-icons/fa";

export default function Success({ openSuccess, setOpenSuccess }) {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const mutedColor = "#aaaaaa";
  const fontFamily = "'Alyamama', sans-serif";

  return (
    <Dialog
      open={openSuccess}
      onClose={() => setOpenSuccess(false)}
      slotProps={{
        paper: {
          sx: {
            width: 420,
            maxWidth: "90%",
            background: "linear-gradient(180deg, #353535 0%, #151515 100%)",
            backgroundColor: "#252525",
            backgroundImage: "none",
            border: `1px solid ${primary}`,
            borderRadius: 3,
            position: "relative",
            "&.MuiPaper-root": {
              background: "linear-gradient(180deg, #353535 0%, #151515 100%)",
            },
          },
        },
      }}
    >
      <IconButton
        onClick={() => setOpenSuccess(false)}
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
          color: mutedColor,
          "&:hover": {
            color: primary,
            backgroundColor: "rgba(250,229,110,0.1)",
          },
        }}
      >
        <FaTimes />
      </IconButton>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 5,
          gap: 2,
        }}
      >
        
        <Box
          sx={{
            width: 85,
            height: 85,
            borderRadius: "50%",
            backgroundColor: "rgba(46,125,50,0.15)",
            border: "2px solid #4caf50",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaCheckDouble
            style={{
              color: "#66d17a",
              fontSize: 38,
            }}
          />
        </Box>

        <Typography
          sx={{
            color: primary,
            fontFamily,
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          تمت المطابقة بنجاح
        </Typography>

        <Typography
          sx={{
            color: secondary,
            fontFamily,
            fontSize: 15,
          }}
        >
          جميع الأرصدة متطابقة مع الصناديق
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
