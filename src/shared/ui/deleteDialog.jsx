import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

const fontFamily = "'Alyamama', sans-serif";

export default function DeleteDialog({
  open,
  onClose,
  onConfirm,
  loading,
  title = "تأكيد الحذف",
  message = "هل أنت متأكد من رغبتك في حذف العملية لا يمكن التراجع عن هذا الإجراء بعد تنفيذه",
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1.5,
          maxWidth: "420px",
          width: "100%",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          pb: 1,
          color: "#fff",
          backgroundColor: "#242424",
          fontFamily: fontFamily,
        }}
      >
        <Box
          sx={{
            backgroundColor: (theme) =>
              theme.palette.error.lighter || "rgb(255, 255, 255)",
            borderRadius: "50%",
            p: 1.2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "error.main",
          }}
        >
          <WarningAmberRoundedIcon fontSize="medium" />
        </Box>
        <Typography
          variant="h6"
          component="span"
          sx={{ fontWeight: "bold", color: "rgba(255, 202, 95, 0.96)" }}
        >
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 1,
          pb: 2,
          backgroundColor: "#242424",
          fontFamily: fontFamily,
        }}
      >
        <DialogContentText
          sx={{ fontSize: "0.95rem", lineHeight: 1.6, color: "#fff" }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          gap: 1.5,
          background: "#242424",
          color: "#fff",
          fontFamily: fontFamily,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          fullWidth
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            borderColor: "rgba(226, 204, 159, 0.65)",
            py: 1,
            "&:hover": {
              borderColor: "rgba(233,184,88,.65)",
              backgroundColor: "action.hover",
            },
          }}
        >
          إلغاء
        </Button>
        <Button
        disabled={loading}
          onClick={onConfirm}
          variant="contained"
          color="error"
          fullWidth
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            py: 1,
            "&:hover": {
              boxShadow: "none",
              backgroundColor: "error.dark",
            },
          }}
        >
        {loading? "جار الحذف..": "تأكيد الحذف"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
