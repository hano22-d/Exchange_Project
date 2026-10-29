import { Box, Grid, Typography, Button, Card, Divider } from "@mui/material";
import { FaCheckCircle, FaDatabase } from "react-icons/fa";
import {
  FaVault,
  FaTriangleExclamation,
  FaScaleBalanced,
} from "react-icons/fa6";
import { MdFactCheck, MdHistory } from "react-icons/md";
export default function LastOper({cashboxes}) {

  // الصناديق الموجبة & السالبة
  const positiveBalance = cashboxes.filter(cashbox => cashbox.balance > 0).length;
  const negativeBalance = cashboxes.length - positiveBalance

  const oper = [
    {
      operType: "تسجيل دين جديد",
      operTypePart: "دين مستحق",
      operDetails: "التفاصيل",
      time: "09:30",
    },
    {
      operType: "حوالة صادرة",
      operTypePart: "حوالة صادرة",
      operDetails: "التفاصيل",
      time: "12:15",
    },
    {
      operType: "عملية صرف",
      operTypePart: "صرف مباشر",
      operDetails: "التفاصيل",
      time: "17:48",
    },
    {
      operType: "عملية صرف",
      operTypePart: "صرف مباشر",
      operDetails: "التفاصيل",
      time: "17:48",
    },
    {
      operType: "عملية صرف",
      operTypePart: "صرف مباشر",
      operDetails: "التفاصيل",
      time: "17:48",
    },
  ];
  return (
    <Grid
      spacing={2}
      columns={16}
      sx={{ display: "flex", justifyContent: "space-between", p: 0.5, mt: 7 }}
    >
      <Grid size={11} sx={{ width: "63%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <MdHistory
              style={{ color: "#008cff", fontSize: 30, marginLeft: 10 }}
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
          <Button
            variant="outlined"
            sx={{
              color: "rgba(250, 229, 110, 0.992)",
              borderRadius: 2,
              borderColor: "rgba(250, 229, 110, 0.992)",
              fontFamily: "'Alyamama', sans-serif",
              fontSize: 10,
              p: "8px 16px",
              "&:hover": {
                backgroundColor: "rgba(250, 229, 110, 0.16)",
              },
            }}
          >
            عرض الأرشيف الكامل
          </Button>
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
          }}
        >
          {oper.map((item, index) => (
            <Card
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#383838",
                borderRadius: 4,
                p: 2,
              }}
            >
              <Typography
                sx={{
                  color: "white",
                  backgroundColor: "#232323",
                  borderRadius: 4,
                  fontFamily: "'Alyamama', sans-serif",
                  p: 0.9,
                  ml: 3,
                }}
              >
                {item.time}
              </Typography>
              <Box sx={{ width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    sx={{
                      color: "white",
                      fontFamily: "'Alyamama', sans-serif",
                      fontSize: 20,
                    }}
                  >
                    {item.operType}
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(250, 229, 110, 0.992)",
                      backgroundColor: "rgba(255, 217, 0, 0.18)",
                      borderRadius: 2,
                      border: "1px solid",
                      fontFamily: "'Alyamama', sans-serif",
                      fontSize: 10,
                      mr: 1,
                      p: "5px 9px",
                    }}
                  >
                    {item.operTypePart}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    color: "#c5c2c2",
                    fontFamily: "'Alyamama', sans-serif",
                    fontSize: 13,
                  }}
                >
                  {item.operDetails}
                </Typography>
              </Box>
            </Card>
          ))}
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 6,
              backgroundColor: "#383838",
              gap: 1,
              p: 1,
              mt: 1,
            }}
          >
            <Typography
              sx={{
                color: "rgba(250, 229, 110, 0.992)",
                fontFamily: "'Alyamama', sans-serif",
              }}
            >
              الحالة العامة:
            </Typography>
            <Typography
              sx={{ color: "#00ff80", fontFamily: "'Alyamama', sans-serif" }}
            >
              ممتازة
            </Typography>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
