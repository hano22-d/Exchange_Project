import { Alert, Snackbar } from "@mui/material";

function BasicToast({ open, message, saverity = "success" }) {
  return (
    <>
      <Snackbar open={open} autoHideDuration={3000} anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}>
        <Alert
          saverity={saverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
export default BasicToast;
