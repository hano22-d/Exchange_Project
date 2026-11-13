import { useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
  Fade,
  Zoom,
} from "@mui/material";
import {
  ContentCopyRounded,
  CheckCircleRounded,
  UploadFileRounded,
  CurrencyExchangeRounded,
  KeyRounded,
  LockOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";
import { useLicense } from "../../context/LicenseContext";

function getArabicErrorMessage(error) {
  if (!error) return "";

  switch (error.code) {
    case "INVALID_STRUCTURE":
    case "INVALID_JSON":
      return "ملف الترخيص غير سليم أو لا يتبع صيغة التراخيص المعتمدة.";
    case "INVALID_SIGNATURE":
      return "التوقيع الرقمي غير صحيح. قد يكون الملف معدّلًا أو لم يصدر من الجهة المعتمدة.";
    case "INSTALLATION_MISMATCH":
      return "هذا الترخيص مرتبط بتثبيت آخر من التطبيق، ولا يمكن استخدامه هنا.";
    case "SIGNATURE_VERIFICATION_ERROR":
      return "تعذر إجراء التحقق التشفيري. استخدم متصفحًا حديثًا وافتح التطبيق عبر HTTPS.";
    case "INSTALLATION_ID_UNAVAILABLE":
    case "INVALID_LOCAL_INSTALLATION_ID":
      return "تعذر قراءة معرّف هذا التثبيت أو إنشاؤه. تحقق من إعدادات تخزين الموقع في المتصفح.";
    case "FILE_NOT_SELECTED":
      return "اختر ملف الترخيص أولًا.";
    case "FILE_TOO_LARGE":
      return "حجم الملف أكبر من الحجم المتوقع لملف الترخيص.";
    case "FILE_READ_ERROR":
      return "تعذرت قراءة الملف المحدد.";
    case "LICENSE_STORAGE_ERROR":
      return "الترخيص صحيح، لكن تعذر حفظه في المتصفح. تحقق من إعدادات التخزين.";
    case "LICENSE_INITIALIZATION_ERROR":
      return "حدثت مشكلة أثناء تهيئة نظام الترخيص. يمكنك اختيار ملف ترخيص صالح للمحاولة مجددًا.";
    default:
      return error.reason || "حدث خطأ غير متوقع أثناء التفعيل.";
  }
}

export function ActivationPage() {
  const { installationId, status, error, activateLicenseFile } = useLicense();

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localError, setLocalError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const isActivating = status === "activating";
  const errorMessage = localError || getArabicErrorMessage(error);
  const isCopied = copyMessage === "تم نسخ معرّف التثبيت.";

  async function handleCopyInstallationId() {
    if (!installationId) {
      setCopyMessage("معرّف التثبيت غير متاح حاليًا.");
      return;
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable.");
      }

      await navigator.clipboard.writeText(installationId);
      setCopyMessage("تم نسخ معرّف التثبيت.");
    } catch {
      setCopyMessage("تعذر النسخ تلقائيًا. يمكنك تحديد المعرّف ونسخه يدويًا.");
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setLocalError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");

    if (!selectedFile) {
      setLocalError("يرجى اختيار ملف الترخيص الذي أرسلناه إليك.");
      return;
    }

    const result = await activateLicenseFile(selectedFile);

    if (!result.valid) {
      setLocalError(getArabicErrorMessage(result));
      return;
    }
  }

  return (
    <Box
      component="main"
      dir="rtl"
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
        background:
          "radial-gradient(circle at 15% 20%, rgba(214, 181, 109, 0.12) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(0, 217, 255, 0.1) 0%, transparent 45%), linear-gradient(145deg, #0b0f17 0%, #121622 50%, #0d1018 100%)",
        "@keyframes floatSlow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-18px) rotate(4deg)" },
        },
        "@keyframes gridMove": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "40px 40px" },
        },
      }}
    >
      {/* خلفية الشبكة الهندسية الدقيقة */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(214, 181, 109, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 217, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          animation: "gridMove 20s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* رموز عملات وصرافة عائمة في الخلفية */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <Typography
          sx={{
            position: "absolute",
            top: "12%",
            right: "10%",
            fontSize: { xs: "4rem", md: "6.5rem" },
            fontWeight: 800,
            color: "rgba(214, 181, 109, 0.05)",
            animation: "floatSlow 7s ease-in-out infinite",
          }}
        >
          $
        </Typography>
        <Typography
          sx={{
            position: "absolute",
            bottom: "15%",
            left: "12%",
            fontSize: { xs: "4rem", md: "6rem" },
            fontWeight: 800,
            color: "rgba(0, 217, 255, 0.05)",
            animation: "floatSlow 9s ease-in-out infinite reverse",
          }}
        >
          €
        </Typography>
        <CurrencyExchangeRounded
          sx={{
            position: "absolute",
            top: "18%",
            left: "16%",
            fontSize: { xs: "3.5rem", md: "5rem" },
            color: "rgba(214, 181, 109, 0.04)",
            animation: "floatSlow 8s ease-in-out infinite 1s",
          }}
        />
        <Typography
          sx={{
            position: "absolute",
            bottom: "18%",
            right: "15%",
            fontSize: { xs: "3rem", md: "4.5rem" },
            fontWeight: 700,
            color: "rgba(255, 255, 255, 0.03)",
            animation: "floatSlow 10s ease-in-out infinite 2s",
          }}
        >
          SYP / TRY
        </Typography>
      </Box>

      {/* البطاقة الرئيسية للتفعيل */}
      <Zoom in timeout={600}>
        <Paper
          elevation={24}
          component="section"
          aria-labelledby="license-title"
          sx={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: 800,
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: "rgba(22, 27, 39, 0.85)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(214, 181, 109, 0.25)",
            boxShadow:
              "0 25px 60px -15px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            textAlign: "center",
          }}
        >
          {/* الشريط العلوي المتوهج */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, #D6B56D, #00d9ff, #D6B56D, transparent)",
            }}
          />

          {/* الشعار / العلامة المميزة */}
          <Box
            aria-hidden="true"
            sx={{
              width: 400,
              p: 1,
              mx: "auto",
              mb: 2,
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              background:
                "linear-gradient(135deg, rgba(214, 181, 109, 0.2) 0%, rgba(18, 22, 34, 0.9) 100%)",
              border: "1.5px solid rgba(214, 181, 109, 0.55)",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Alyamama', sans-serif",
                fontSize: "1.50rem",
                fontWeight: 900,
                letterSpacing: "1px",
                background: "linear-gradient(135deg, #f3d796 0%, #D6B56D 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              تفعيل نظام الصرافة والحوالات
            </Typography>
            <Box
              sx={{
                position: "absolute",
                bottom: -6,
                right: -6,
                width: 26,
                height: 26,
                borderRadius: "50%",
                bgcolor: "#121622",
                border: "1px solid #00d9ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CurrencyExchangeRounded
                sx={{ fontSize: 15, color: "#00d9ff" }}
              />
            </Box>
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Alyamama', sans-serif",
              color: "#94a3b8",
              lineHeight: 1.7,
              mb: 3,
              px: { xs: 0, sm: 1 },
            }}
          >
            لإتمام التفعيل، أرسل معرّف التثبيت إلى الجهة المسؤولة، ثم اختر ملف
            الترخيص الذي تستلمه.
          </Typography>

          {/* قسم معرّف التثبيت */}
          <Box sx={{ textAlign: "right", mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 0.8,
              }}
            >
              <Typography
                component="label"
                htmlFor="license-installation-id"
                variant="caption"
                sx={{
                  color: "#cbd5e1",
                  fontFamily: "'Alyamama', sans-serif",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                  fontSize: "0.85rem",
                }}
              >
                <KeyRounded sx={{ fontSize: 17, color: "#D6B56D" }} />
                معرّف هذا التثبيت
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 0.75,
                pl: 1.5,
                borderRadius: 2.5,
                bgcolor: "rgba(11, 15, 23, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                transition: "border-color 0.25s ease",
                "&:hover": {
                  borderColor: "rgba(214, 181, 109, 0.45)",
                },
              }}
            >
              <Box
                component="input"
                id="license-installation-id"
                type="text"
                value={installationId ?? "جارٍ تجهيز المعرّف..."}
                readOnly
                dir="ltr"
                spellCheck="false"
                onFocus={(event) => event.target.select()}
                sx={{
                  flex: 1,
                  width: "100%",
                  border: "none",
                  outline: "none",
                  bgcolor: "transparent",
                  color: installationId ? "#00d9ff" : "#64748b",
                  fontFamily: "monospace",
                  fontSize: "1rem",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  cursor: "text",
                }}
              />

              <Tooltip title="نسخ معرّف التثبيت" arrow>
                <span>
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    onClick={handleCopyInstallationId}
                    disabled={!installationId}
                    startIcon={
                      isCopied ? (
                        <CheckCircleRounded sx={{ fontSize: 16 }} />
                      ) : (
                        <ContentCopyRounded sx={{ fontSize: 16 }} />
                      )
                    }
                    sx={{
                      minWidth: "auto",
                      whiteSpace: "nowrap",
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.7,
                      fontFamily: "'Alyamama', sans-serif",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: isCopied ? "#34d399" : "#D6B56D",
                      borderColor: isCopied
                        ? "rgba(52, 211, 153, 0.4)"
                        : "rgba(214, 181, 109, 0.4)",
                      bgcolor: isCopied
                        ? "rgba(52, 211, 153, 0.08)"
                        : "rgba(214, 181, 109, 0.08)",
                      "& .MuiButton-startIcon": {
                        ml: 0.7,
                        mr: 0,
                      },
                      "&:hover": {
                        borderColor: isCopied ? "#34d399" : "#D6B56D",
                        bgcolor: isCopied
                          ? "rgba(52, 211, 153, 0.16)"
                          : "rgba(214, 181, 109, 0.16)",
                      },
                    }}
                  >
                    نسخ المعرّف
                  </Button>
                </span>
              </Tooltip>
            </Box>

            {copyMessage && (
              <Fade in>
                <Typography
                  role="status"
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.8,
                    color: isCopied ? "#34d399" : "#fbbf24",
                    fontWeight: 600,
                    fontFamily: "'Alyamama', sans-serif",
                  }}
                >
                  {copyMessage}
                </Typography>
              </Fade>
            )}
          </Box>

          {/* نموذج رفع ملف الترخيص */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ textAlign: "right" }}
          >
            <Typography
              component="label"
              htmlFor="license-file"
              variant="caption"
              sx={{
                color: "#cbd5e1",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 0.6,
                mb: 0.8,
                fontFamily: "'Alyamama', sans-serif",
                fontSize: "0.85rem",
              }}
            >
              <DescriptionOutlined sx={{ fontSize: 17, color: "#00d9ff" }} />
              ملف الترخيص
            </Typography>

            <Box
              onClick={() => {
                if (!isActivating) fileInputRef.current?.click();
              }}
              sx={{
                position: "relative",
                p: 2.2,
                mb: 2,
                borderRadius: 3,
                border: selectedFile
                  ? "1.5px solid rgba(0, 217, 255, 0.55)"
                  : "1.5px dashed rgba(148, 163, 184, 0.35)",
                bgcolor: selectedFile
                  ? "rgba(0, 217, 255, 0.06)"
                  : "rgba(11, 15, 23, 0.55)",
                cursor: isActivating ? "not-allowed" : "pointer",
                transition: "all 0.25s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                "&:hover": {
                  borderColor: isActivating
                    ? undefined
                    : "rgba(214, 181, 109, 0.7)",
                  bgcolor: isActivating
                    ? undefined
                    : "rgba(214, 181, 109, 0.06)",
                },
              }}
            >
              <Box
                component="input"
                ref={fileInputRef}
                id="license-file"
                type="file"
                accept=".license.json,application/json,.json"
                onChange={handleFileChange}
                disabled={isActivating}
                sx={{
                  display: "none",
                }}
              />

              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: selectedFile
                    ? "rgba(0, 217, 255, 0.15)"
                    : "rgba(214, 181, 109, 0.12)",
                  color: selectedFile ? "#00d9ff" : "#D6B56D",
                }}
              >
                <UploadFileRounded />
              </Box>

              {selectedFile ? (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#f8fafc",
                    fontWeight: 700,
                    fontFamily: "'Alyamama', sans-serif",
                    wordBreak: "break-all",
                  }}
                >
                  الملف المحدد: {selectedFile.name}
                </Typography>
              ) : (
                <>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#e2e8f0",
                      fontWeight: 600,
                      fontFamily: "'Alyamama', sans-serif",
                    }}
                  >
                    اضغط لاختيار ملف الترخيص من جهازك
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                      mt: 0.3,
                      fontFamily: "'Alyamama', sans-serif",
                    }}
                  >
                    الصيغ المدعومة: (.license.json أو .json)
                  </Typography>
                </>
              )}
            </Box>

            {/* عرض رسائل الخطأ */}
            {errorMessage && (
              <Fade in>
                <Alert
                  severity="error"
                  role="alert"
                  sx={{
                    fontFamily: "'Alyamama', sans-serif",
                    mb: 2.5,
                    borderRadius: 2.5,
                    bgcolor: "rgba(239, 68, 68, 0.12)",
                    color: "#fca5a5",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    "& .MuiAlert-icon": {
                      color: "#f87171",
                      ml: 1.5,
                      mr: 0,
                    },
                  }}
                >
                  {errorMessage}
                </Alert>
              </Fade>
            )}

            {/* زر التفعيل الرئيسي */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isActivating || !installationId}
              startIcon={
                isActivating ? (
                  <CircularProgress size={18} sx={{ color: "#0b0f17" }} />
                ) : (
                  <LockOutlined />
                )
              }
              sx={{
                py: 1.4,
                borderRadius: 2.5,
                fontFamily: "'Alyamama', sans-serif",
                fontWeight: 800,
                fontSize: "0.98rem",
                color: "#0b0f17",
                background:
                  "linear-gradient(135deg, #f3d796 0%, #D6B56D 50%, #b89448 100%)",
                boxShadow: "0 10px 25px -5px rgba(214, 181, 109, 0.4)",
                transition: "all 0.25s ease",
                "& .MuiButton-startIcon": {
                  ml: 1,
                  mr: 0,
                },
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #f8e2ad 0%, #dfc07a 50%, #c5a052 100%)",
                  transform: "translateY(-1.5px)",
                  boxShadow: "0 14px 30px -5px rgba(214, 181, 109, 0.55)",
                },
                "&.Mui-disabled": {
                  background: "rgba(148, 163, 184, 0.18)",
                  color: "rgba(255, 255, 255, 0.35)",
                },
              }}
            >
              {isActivating ? "جارٍ التحقق والتفعيل..." : "تفعيل التطبيق"}
            </Button>
          </Box>

          <Divider
            sx={{
              my: 2.5,
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          />

          {/* التذييل */}
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "#64748b",
              lineHeight: 1.6,
              fontFamily: "'Alyamama', sans-serif",
            }}
          >
            الترخيص مرتبط بمعرّف هذا التثبيت. احتفظ بملف الترخيص في مكان آمن.
          </Typography>
        </Paper>
      </Zoom>
    </Box>
  );
}
