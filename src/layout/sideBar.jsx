import { Box, Button, Typography } from "@mui/material";
import {
  FaCheckCircle,
  FaCloudUploadAlt,
  FaFolder,
  FaGoogleDrive,
  FaHistory,
} from "react-icons/fa";
export default function SideBar() {
  const primary = "rgba(255, 229, 110, 0.992)";
  const secondary = "#ffffff";
  const paragraph = "#b0b0b0";
  const text = "black";
  const background = "#00000042";
  const fontFamily = "'Alyamama', sans-serif";

  return (
    <Box>
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
            sx={{ color: "lightgreen", fontFamily: "'Alyamama', sans-serif" }}
          >
            النسخ التلقائي مفعل
          </Typography>
          <FaCheckCircle size={20} style={{ color: "lightgreen" }} />
        </Box>
        <Typography
          sx={{
            color: "#ffffff",
            fontFamily: "'Alyamama', sans-serif",
            fontSize: 14,
            mt: 1,
          }}
        >
          يتم حفظ نسخة احتياطية تلقائياً بعد إغلاق اليوم
        </Typography>
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
              09:30 - 25/11/2026
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
          variant="contained"
          fullWidth
          sx={{
            display: "flex",
            alignItems: "start",
            justifyContent: "center",
            color: text,
            backgroundColor: primary,
            gap: 1,
            mt: 1,
          }}
        >
          <FaCloudUploadAlt size={15} />
          <Typography sx={{ fontSize: 12, fontFamily }}>
            إنشاء نسخة احتياطية
          </Typography>
        </Button>
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
            استعادة نسخة احتياطية
          </Typography>
        </Box>
        <Typography sx={{ color: secondary, fontFamily, fontSize: 12, mr: 3 }}>
          استعادة البيانات من ملف احتياطي
        </Typography>
        <Button
          variant="outlined"
          fullWidth
          sx={{
            display: "flex",
            alignItems: "start",
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
            اختيار ملف للاستعادة
          </Typography>
        </Button>
      </Box>
    </Box>
  );
}
