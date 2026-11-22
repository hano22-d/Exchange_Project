import { Box, Grid, Typography, Button, Card, Divider } from "@mui/material";
import { FaCheckCircle, FaDatabase } from "react-icons/fa";
import {
  FaVault,
  FaTriangleExclamation,
  FaScaleBalanced,
} from "react-icons/fa6";
import { MdFactCheck, MdHistory } from "react-icons/md";
import { Link } from "react-router-dom";
import "../../app/App.css";
import { formatSyriaDateTime } from "../../shared/utilsDate";

const cardColor = {
  exchange: {
    accent: "#29B6F6",
    border: "rgba(41, 182, 246, 0.38)",
    background: "linear-gradient(115deg, rgba(41,182,246,0.13), #383838 65%)",
    badgeBackground: "rgba(41,182,246,0.16)",
    badgeColor: "#81D4FA",
    dateBackground: "rgba(41,182,246,0.10)",
  },

  transfer: {
    accent: "#AB47BC",
    border: "rgba(171,71,188,0.38)",
    background: "linear-gradient(115deg, rgba(171,71,188,0.14), #383838 65%)",
    badgeBackground: "rgba(171,71,188,0.17)",
    badgeColor: "#E1BEE7",
    dateBackground: "rgba(171,71,188,0.10)",
  },

  debt: {
    accent: "#FFB74D",
    border: "rgba(255,183,77,0.38)",
    background: "linear-gradient(115deg, rgba(255,183,77,0.13), #383838 65%)",
    badgeBackground: "rgba(255,183,77,0.16)",
    badgeColor: "#FFE0B2",
    dateBackground: "rgba(255,183,77,0.10)",
  },

  wallet: {
    accent: "#26A69A",
    border: "rgba(38,166,154,0.38)",
    background: "linear-gradient(115deg, rgba(38,166,154,0.14), #383838 65%)",
    badgeBackground: "rgba(38,166,154,0.17)",
    badgeColor: "#B2DFDB",
    dateBackground: "rgba(38,166,154,0.10)",
  },

  default: {
    accent: "#aaaaaa",
    border: "rgba(170,170,170,0.3)",
    background: "#383838",
    badgeBackground: "rgba(170,170,170,0.12)",
    badgeColor: "#dddddd",
    dateBackground: "rgba(170,170,170,0.08)",
  },
};

export default function LastOper({
  cashboxes = [],
  operations = [],
  loading,
  error,
}) {
  // الصناديق الموجبة & السالبة
  const positiveBalance = cashboxes.filter(
    (cashbox) => cashbox.balance > 0
  ).length;

  const negativeBalance = cashboxes.length - positiveBalance;

  return (
    <Grid
      spacing={2}
      columns={16}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        p: 0.5,
        mt: 7,
      }}
    >
      <Grid size={11} sx={{ width: "63%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <MdHistory
              style={{
                color: "#008cff",
                fontSize: 30,
                marginLeft: 10,
              }}
            />

            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontFamily: "'Alyamama', sans-serif",
              }}
            >
              آخر العمليات المنفذة
            </Typography>
          </Box>

          <Link
            to={"/archive"}
            style={{
              textDecoration: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "2px solid rgba(250, 229, 110, 0.992)",
              color: "rgba(250, 229, 110, 0.992)",
              fontFamily: "'Alyamama', sans-serif",
            }}
            className="btnhover"
          >
            عرض الأرشيف الكامل
          </Link>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            p: 3,
            backgroundColor: "#232323",
            border: "1px solid rgba(250, 229, 110, 0.992)",
            borderRadius: 4,
            minHeight: 300,
            justifyContent:
              loading || error || operations.length === 0
                ? "center"
                : "flex-start",
          }}
        >
          {/* حالة التحميل */}
          {loading && (
            <Typography
              sx={{
                color: "#c5c2c2",
                fontFamily: "'Alyamama', sans-serif",
                textAlign: "center",
                fontSize: 17,
                py: 5,
              }}
            >
              جار تحميل أحدث العمليات...
            </Typography>
          )}

          {/* حالة الخطأ */}
          {!loading && error && (
            <Typography
              sx={{
                color: "#ff7070",
                fontFamily: "'Alyamama', sans-serif",
                textAlign: "center",
                fontSize: 17,
                py: 5,
              }}
            >
              تعذر تحميل أحدث العمليات: {error.message}
            </Typography>
          )}

          {/* عدم وجود عمليات */}
          {!loading && !error && operations.length === 0 && (
            <Typography
              sx={{
                color: "#aaaaaa",
                fontFamily: "'Alyamama', sans-serif",
                textAlign: "center",
                fontSize: 17,
                py: 5,
              }}
            >
              لا توجد عمليات مسجلة حتى الآن
            </Typography>
          )}

          {/* عرض العمليات */}
          {!loading &&
            !error &&
            operations.map((item) => {
              const style = cardColor[item.type] ?? cardColor.default;

              return (
                <Card
                  key={item.key}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    background: style.background,
                    border: `1px solid ${style.border}`,
                    borderRight: `4px solid ${style.accent}`,
                    borderRadius: 3,
                    py: 1.3,
                    px: 2,
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* التاريخ */}
                  <Typography
                    sx={{
                      color: style.accent,
                      backgroundColor: style.dateBackground,
                      border: `1px solid ${style.border}`,
                      borderRadius: 2,
                      fontFamily: "'Alyamama', sans-serif",
                      fontSize: 15,
                      fontWeight: 800,
                      p: 1,
                      ml: 3,
                      minWidth: 145,
                      textAlign: "center",
                      direction: "ltr",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatSyriaDateTime(item.date).replace(",", " -")}
                  </Typography>

                  {/* تفاصيل الحركة */}
                  <Box
                    sx={{
                      width: "100%",
                      minWidth: 0,
                    }}
                  >
                    {/* العنوان والشارة */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          color: "white",
                          fontFamily: "'Alyamama', sans-serif",
                          fontSize: 20,
                          fontWeight: 600,
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        sx={{
                          color: style.badgeColor,
                          backgroundColor: style.badgeBackground,
                          border: `1px solid ${style.border}`,
                          borderRadius: 2,
                          fontFamily: "'Alyamama', sans-serif",
                          fontSize: 11,
                          p: "5px 9px",
                        }}
                      >
                        {item.subtitle}
                      </Typography>
                    </Box>

                    {/* الوصف */}
                    <Typography
                      sx={{
                        color: "#c5c2c2",
                        fontFamily: "'Alyamama', sans-serif",
                        fontSize: 13,
                        mt: 0.5,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </Card>
              );
            })}
        </Box>
      </Grid>

      {/* ======================================================================== */}
      {/* ======================================================================== */}
      {/* ======================================================================== */}

      <Grid size={5} sx={{ width: "35%" }}>
        {/* ========================================== */}
        {/* =========== البطاقة اليسرى الأولى ======= */}
        {/* ========================================== */}

        <Card
          sx={{
            backgroundColor: "#232323",
            borderRadius: 4,
            border: "1px solid rgba(250, 229, 110, 0.992)",
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <MdFactCheck style={{ color: "#00ff62", fontSize: 20 }} />
            <Typography
              sx={{
                color: "white",
                fontFamily: "'Alyamama', sans-serif",
                mr: 1,
                py: 1,
              }}
            >
              حالة الجرد والمطابقة
            </Typography>
          </Box>

          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#383838",
              borderRadius: 3,
              p: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: "white",
                  fontFamily: "'Alyamama', sans-serif",
                }}
              >
                نتيجة آخر مطابقة:
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FaCheckCircle style={{ color: "#00ff80" }} />
                <Typography
                  sx={{
                    color: "#00ff80",
                    fontFamily: "'Alyamama', sans-serif",
                    mr: 0.5,
                  }}
                >
                  الجرد مطابق تماما
                </Typography>
              </Box>
            </Box>

            <Button
              variant="outlined"
              sx={{
                color: "#00ff80",
                borderRadius: 2,
                borderColor: "#00ff80",
                fontFamily: "'Alyamama', sans-serif",
                fontSize: 10,
                p: "7.5px 15px",
                "&:hover": {
                  backgroundColor: "#00ff802c",
                },
              }}
            >
              عرض الجرد
            </Button>
          </Card>
        </Card>

        {/* ========================================== */}
        {/* ========= البطاقة اليسرى الثانية ======= */}
        {/* ========================================== */}

        <Card
          sx={{
            backgroundColor: "#232323",
            borderRadius: 4,
            border: "1px solid rgba(250, 229, 110, 0.992)",
            p: 2,
            mt: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FaDatabase style={{ color: "#00ddff", fontSize: 20 }} />
            <Typography
              sx={{
                color: "white",
                fontFamily: "'Alyamama', sans-serif",
                mr: 1,
                py: 1,
              }}
            >
              النسخ الاحتياطي للأرشيف
            </Typography>
          </Box>

          <Card
            sx={{
              backgroundColor: "#383838",
              borderRadius: 3,
              p: 2,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                sx={{ color: "#c5c2c2", fontFamily: "'Alyamama', sans-serif" }}
              >
                آخر نسخة حفظ:
              </Typography>

              <Typography
                sx={{
                  color: "white",
                  fontFamily: "'Alyamama', sans-serif",
                  fontWeight: "bold",
                }}
              >
                18:36 - 22/10/2026
              </Typography>
            </Box>

            <Divider style={{ backgroundColor: "#c5c2c2", margin: 3 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                sx={{ color: "#c5c2c2", fontFamily: "'Alyamama', sans-serif" }}
              >
                الحالة:{" "}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FaCheckCircle style={{ color: "#00ff80" }} />
                <Typography
                  sx={{
                    color: "#00ff80",
                    fontFamily: "'Alyamama', sans-serif",
                    fontWeight: "bold",
                    mr: 0.5,
                  }}
                >
                  محفوظة بنجاح
                </Typography>
              </Box>
            </Box>
          </Card>
        </Card>

        {/* ========================================== */}
        {/* ========= البطاقة اليسرى الثالثة ======= */}
        {/* ========================================== */}

        <Card
          sx={{
            backgroundColor: "#232323",
            borderRadius: 4,
            border: "1px solid rgba(250, 229, 110, 0.992)",
            p: 2,
            mt: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FaVault style={{ color: "#eaff00", fontSize: 20 }} />
            <Typography
              sx={{
                color: "white",
                fontFamily: "'Alyamama', sans-serif",
                mr: 1,
                py: 1,
              }}
            >
              ملخص صحة الصناديق
            </Typography>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "space-around", mt: 0.5 }}
          >
            <Card
              sx={{
                backgroundColor: "#383838",
                borderRadius: 3,
                px: 3,
                pt: 1,
                textAlign: "center",
              }}
            >
              <FaScaleBalanced style={{ color: "#00ff00", fontSize: 30 }} />
              <Typography
                sx={{ color: "#00ff00", fontFamily: "'Alyamama', sans-serif" }}
              >
                صناديق برصيد طبيعي
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: "#00ff00",
                  fontFamily: "'Alyamama', sans-serif",
                  fontWeight: "bold",
                  mt: 1,
                }}
              >
                {positiveBalance}
              </Typography>
            </Card>

            <Card
              sx={{
                backgroundColor: "#383838",
                borderRadius: 3,
                px: 3,
                pt: 1,
                textAlign: "center",
              }}
            >
              <FaTriangleExclamation style={{ color: "red", fontSize: 30 }} />
              <Typography
                sx={{ color: "red", fontFamily: "'Alyamama', sans-serif" }}
              >
                صناديق برصيد سالب
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: "#ff0000",
                  fontFamily: "'Alyamama', sans-serif",
                  fontWeight: "bold",
                  mt: 1,
                }}
              >
                {negativeBalance}
              </Typography>
            </Card>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
