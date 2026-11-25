import { useEffect, useState } from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import { DATABASE_CONNECTION_EVENTS } from "./database";

export default function DatabaseConnectionNotice() {
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const handleBlocked = () => {
      setNotice({
        type: "blocked",
        severity: "warning",
        message:
          "ترقية قاعدة البيانات متوقفة مؤقتاً بسبب تبويب آخر. أغلق التبويبات الأخرى من التطبيق أو حدّثها.",
      });
    };

    const handleVersionChange = () => {
      setNotice({
        type: "versionchange",
        severity: "warning",
        message:
          "تم طلب تحديث قاعدة البيانات من تبويب آخر. أُغلق اتصال هذه الصفحة لحماية البيانات؛ حدّث الصفحة لمتابعة العمل.",
      });
    };

    const handleReady = () => {
      setNotice((currentNotice) =>
        currentNotice?.type === "blocked" ? null : currentNotice
      );
    };

    window.addEventListener(DATABASE_CONNECTION_EVENTS.BLOCKED, handleBlocked);
    window.addEventListener(
      DATABASE_CONNECTION_EVENTS.VERSION_CHANGE,
      handleVersionChange
    );
    window.addEventListener(DATABASE_CONNECTION_EVENTS.READY, handleReady);

    return () => {
      window.removeEventListener(
        DATABASE_CONNECTION_EVENTS.BLOCKED,
        handleBlocked
      );
      window.removeEventListener(
        DATABASE_CONNECTION_EVENTS.VERSION_CHANGE,
        handleVersionChange
      );
      window.removeEventListener(DATABASE_CONNECTION_EVENTS.READY, handleReady);
    };
  }, []);

  if (!notice) {
    return null;
  }

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      autoHideDuration={null}
    >
      <Alert
        severity={notice.severity}
        variant="filled"
        action={
          notice.type === "versionchange" ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => window.location.reload()}
            >
              تحديث الصفحة
            </Button>
          ) : undefined
        }
        sx={{ width: "100%" }}
      >
        {notice.message}
      </Alert>
    </Snackbar>
  );
}
