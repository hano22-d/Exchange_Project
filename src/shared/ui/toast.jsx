import { Alert, Snackbar } from "@mui/material";

function BasicToast({ open, onClose, message, severity = "success" }) {
  return (
    <>
      <Snackbar
        open={open}
        onClose={onClose}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          severity={severity}
          variant="filled"
          sx={{
            width: "100%",
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
export default BasicToast;
