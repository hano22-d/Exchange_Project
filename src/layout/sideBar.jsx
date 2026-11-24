import { Box, Button, Typography } from "@mui/material";
import {
  FaCheckCircle,
  FaCloudUploadAlt,
  FaFolder,
  FaGoogleDrive,
  FaHistory,
} from "react-icons/fa";
import { FaTimesCircle } from "react-icons/fa";
import { useBackup } from "../context/BackupContext";
export default function SideBar() {
  const primary = "rgba(255, 229, 110, 0.992)";
  const secondary = "#ffffff";
  const paragraph = "#b0b0b0";
  const text = "black";
  const background = "#00000042";
  const fontFamily = "'Alyamama', sans-serif";

  const {
    // states
    authReady,
    isBusy,
    busyAction,
    lastAction,
    error,
    needsReload,
    message,
    connected,
    lastBackupAt,
    // functions
    backupNow,
    restoreFromDrive,
    reloadApplication,
  } = useBackup();

  return (
    <Box sx={{ mt: 7 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <FaCloudUploadAlt
          size={40}
          style={{ color: "rgba(255, 229, 110, 0.992)" }}
        />
        <Box>
          <Typography
            sx={{
              fontSize: 17,
              fontWeight: "bold",
              fontFamily: "'Alyamama', sans-serif",
              color: "rgba(255, 229, 110, 0.992)",
            }}
          >
            إعدادات النسخ الاحتياطي
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              fontFamily: "'Alyamama', sans-serif",
              color: "#ffffff",
            }}
          >
            إدارة النسخ الاحتياطية واستعادة البيانات
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          backgroundColor: background,
          border: `1px solid rgba(255, 229, 110, 0.992)`,
          borderRadius: 2,
          p: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              color: connected ? "lightgreen" : "#ff4b4b",
              fontFamily: "'Alyamama', sans-serif",
            }}
          >
            {connected ? "النسخ التلقائي مفعل" : "النسخ التلقائي غير مفعل"}
          </Typography>
          {connected ? (
            <FaCheckCircle size={20} style={{ color: "lightgreen" }} />
          ) : (
            <FaTimesCircle size={20} style={{ color: "#ff4b4b" }} />
          )}
        </Box>
      </Box>
      <Box
        sx={{
          border: `1px solid rgba(255, 229, 110, 0.992)`,
          borderRadius: 2,
          p: 2,
          backgroundColor: background,
          mt: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <FaHistory
            size={17}
            style={{ color: "rgba(255, 229, 110, 0.992)" }}
          />
          <Typography
            sx={{
              color: "rgba(255, 229, 110, 0.992)",
              fontFamily: "'Alyamama', sans-serif",
              fontSize: 15,
            }}
          >
            آخر نسخة احتياطية
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FaGoogleDrive size={30} style={{ color: "green" }} />
          <Box>
            <Typography
              sx={{
                color: "#ffffff",
                fontSize: 13,
                fontFamily: "'Alyamama', sans-serif",
              }}
            >
              {lastBackupAt?.split("T")[0] || ""}
            </Typography>
            <Typography
              sx={{
                color: paragraph,
                fontFamily: "'Alyamama', sans-serif",
                fontSize: 10,
              }}
            >
              على Google Drive
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          border: `1px solid rgba(255, 229, 110, 0.992)`,
          borderRadius: 2,
          p: 2,
          backgroundColor: background,
          mt: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <FaCloudUploadAlt size={17} style={{ color: primary }} />
          <Typography
            sx={{
              color: primary,
              fontFamily: fontFamily,
              fontSize: 15,
            }}
          >
            إنشاء نسخة احتياطية الآن
          </Typography>
        </Box>
        <Typography sx={{ color: secondary, fontFamily, fontSize: 12, mr: 3 }}>
          حفظ نسخة جديدة من بيانات التطبيق
        </Typography>
        <Button
          onClick={backupNow}
          variant="contained"
          fullWidth
          disabled={!authReady || isBusy}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: text,
            backgroundColor: primary,
            gap: 1,
            mt: 1,
          }}
        >
          <FaCloudUploadAlt size={15} />

          <Typography sx={{ fontSize: 12, fontFamily }}>
            {busyAction === "backup"
              ? "جار إنشاء النسخة الاحتياطية..."
              : "إنشاء نسخة احتياطية"}
          </Typography>
        </Button>

        {lastAction === "backup" && (error || message) && (
          <Box
            sx={{
              mt: 1.5,
              p: 1,
              borderRadius: 2,
              backgroundColor: error
                ? "rgba(244,67,54,0.08)"
                : "rgba(0,200,83,0.08)",
              border: `1px solid ${
                error ? "rgba(244,67,54,0.3)" : "rgba(0,200,83,0.3)"
              }`,
            }}
          >
            <Typography
              sx={{
                color: error ? "#ff7070" : "#00ff80",
                fontFamily,
                fontSize: 12,
              }}
            >
              {error ? `فشل إنشاء النسخة: ${error}` : message}
            </Typography>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          border: `1px solid rgba(255, 229, 110, 0.992)`,
          borderRadius: 2,
          p: 2,
          backgroundColor: background,
          mt: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <FaHistory size={17} style={{ color: primary }} />
          <Typography
            sx={{
              color: primary,
              fontFamily: fontFamily,
              fontSize: 15,
            }}
          >
            استعادة اخر نسخة احتياطية
          </Typography>
        </Box>
        <Button
          onClick={() => restoreFromDrive("current")}
          variant="outlined"
          fullWidth
          disabled={!authReady || isBusy || needsReload}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: primary,
            borderColor: primary,
            gap: 1,
            mt: 1,
            "&:hover": {
              backgroundColor: "rgba(255, 228, 110, 0.09)",
            },
          }}
        >
          <FaFolder size={15} />

          <Typography sx={{ color: primary, fontFamily, fontSize: 12 }}>
            {busyAction === "restore" ? "جار استعادة النسخة..." : "استعادة"}
          </Typography>
        </Button>

        {/* نتيجة عملية الاستعادة */}
        {lastAction === "restore" && error && (
          <Box
            sx={{
              mt: 1.5,
              p: 1,
              borderRadius: 2,
              backgroundColor: "rgba(244,67,54,0.08)",
              border: "1px solid rgba(244,67,54,0.3)",
            }}
          >
            <Typography
              sx={{
                color: "#ff7070",
                fontFamily,
                fontSize: 12,
                overflowWrap: "anywhere",
              }}
            >
              فشلت الاستعادة: {error}
            </Typography>
          </Box>
        )}

        {lastAction === "restore" && needsReload && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "rgba(0,200,83,0.08)",
              border: "1px solid rgba(0,200,83,0.3)",
            }}
          >
            <Typography
              sx={{
                color: "#00ff80",
                fontFamily,
                fontSize: 12,
                mb: 1,
              }}
            >
              {message}
            </Typography>

            <Button
              fullWidth
              variant="contained"
              onClick={reloadApplication}
              sx={{
                backgroundColor: "#00c853",
                color: "#000",
                fontFamily,
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#00e676",
                },
              }}
            >
              إعادة تحميل التطبيق
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
