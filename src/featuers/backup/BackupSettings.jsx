import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useBackup } from "../../context/BackupContext";



// ======================================================
// Status Text
// ======================================================

function getStatusText(status) {
  switch (status) {
    case "idle":
      return "لا توجد تغييرات بانتظار النسخ.";

    case "dirty":
      return "توجد تغييرات محلية بانتظار النسخ.";

    case "uploading":
      return "يتم رفع النسخة الاحتياطية الآن...";

    case "success":
      return "آخر عملية رفع اكتملت بنجاح.";

    case "offline":
      return "لا يوجد اتصال بالإنترنت. ستتم إعادة المحاولة عند عودته.";

    case "auth-required":
      return "انتهت صلاحية الاتصال. أعد ربط Google Drive.";

    case "error":
      return "حدث خطأ أثناء النسخ الاحتياطي.";

    default:
      return "حالة النسخ الاحتياطي غير معروفة.";
  }
}

// ======================================================
// Date Formatter
// ======================================================

function formatBackupDate(value) {
  if (!value) return "لا توجد عملية رفع مسجلة بعد.";

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

// ======================================================
// Component
// ======================================================

export default function BackupSettings() {
  const {
    authReady,
    connected,

    schedulerStatus,
    isDirty,
    isUploading,
    lastBackupAt,

    busyAction,
    isBusy,

    error,
    message,

    needsReload,

    connectGoogleDrive,
    backupNow,
    restoreFromDrive,
    reloadApplication,
  } = useBackup();


  const handleRestore = async (source) => {
    const sourceLabel =
      source === "current"
        ? "النسخة الحالية Current"
        : "النسخة السابقة Previous";

    const confirmed = window.confirm(
      `أنت على وشك استعادة ${sourceLabel}.\n\n` +
        "سيتم استبدال البيانات المحلية الحالية. " +
        "سيحفظ التطبيق نسخة أمان على Google Drive قبل الاستعادة.\n\n" +
        "هل تريد المتابعة؟"
    );

    if (!confirmed) return;

    await restoreFromDrive(source);
  };

  const statusSeverity =
    schedulerStatus.status === "success"
      ? "success"
      : schedulerStatus.status === "error" ||
        schedulerStatus.status === "auth-required"
      ? "error"
      : schedulerStatus.status === "offline"
      ? "warning"
      : "info";

  return (
    <Box
      dir="rtl"
      sx={{
        width: "100%",
        maxWidth: 850,
        mx: "auto",
        p: 3,
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            النسخ الاحتياطي والاستعادة
          </Typography>

          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            إدارة نسخ بيانات المكتب على Google Drive.
          </Typography>
        </Box>

        <Divider />

        {/* Google Drive Connection */}

        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            الاتصال بـ Google Drive
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            اربط حساب Google حتى يتمكن التطبيق من حفظ النسخ الاحتياطية
            واستعادتها.
          </Typography>

          <Button
            variant="contained"
            onClick={connectGoogleDrive}
            disabled={!authReady || isBusy}
          >
            {busyAction === "connect" ? (
              <CircularProgress size={20} color="inherit" />
            ) : connected ? (
              "إعادة فحص الاتصال ورفع نسخة"
            ) : (
              "ربط Google Drive"
            )}
          </Button>

          {!authReady && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              يتم تجهيز خدمة Google...
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Automatic Backup Status */}

        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            حالة النسخ التلقائي
          </Typography>

          <Alert severity={statusSeverity}>
            {getStatusText(schedulerStatus.status)}
          </Alert>

          <Stack spacing={0.5} sx={{ mt: 2 }}>
            <Typography variant="body2">
              التغييرات المعلقة: {isDirty ? "نعم" : "لا"}
            </Typography>

            <Typography variant="body2">
              حالة الرفع: {isUploading ? "جارٍ الرفع" : "متوقف"}
            </Typography>

            <Typography variant="body2">
              آخر رفع ناجح: {formatBackupDate(lastBackupAt)}
            </Typography>
          </Stack>

          {schedulerStatus.lastError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {schedulerStatus.lastError}
            </Typography>
          )}

          <Button
            variant="outlined"
            onClick={backupNow}
            disabled={!authReady || isBusy}
            sx={{ mt: 2 }}
          >
            {busyAction === "backup" ? (
              <CircularProgress size={20} />
            ) : (
              "إنشاء نسخة احتياطية الآن"
            )}
          </Button>
        </Box>

        <Divider />

        {/* Restore */}

        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            استعادة نسخة احتياطية
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            اختر النسخة التي تريد استعادتها. سيتم حفظ نسخة أمان من بياناتك
            المحلية الحالية قبل الاستعادة.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleRestore("current")}
              disabled={!authReady || isBusy}
            >
              {busyAction === "restore" ? (
                <CircularProgress size={20} />
              ) : (
                "استعادة Current"
              )}
            </Button>

            <Button
              variant="outlined"
              color="warning"
              onClick={() => handleRestore("previous")}
              disabled={!authReady || isBusy}
            >
              {busyAction === "restore" ? (
                <CircularProgress size={20} />
              ) : (
                "استعادة Previous"
              )}
            </Button>
          </Stack>
        </Box>

        {/* Messages */}

        {error && <Alert severity="error">{error}</Alert>}

        {message && <Alert severity="success">{message}</Alert>}

        {/* Reload After Restore */}

        {needsReload && (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={reloadApplication}>
                إعادة تحميل
              </Button>
            }
          >
            تمت الاستعادة. أعد تحميل التطبيق حتى تُحدّث جميع البيانات والحالات
            الموجودة في الذاكرة.
          </Alert>
        )}
      </Stack>
    </Box>
  );
}
