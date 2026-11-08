import { Box, Button, Typography } from "@mui/material";
import {
  FaPrint,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaUser,
  FaUserCheck,
  FaMapMarkerAlt,
  FaCoins,
  FaWallet,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaCheckCircle,
} from "react-icons/fa";
import { FaHashtag, FaMoneyBillTransfer } from "react-icons/fa6";
import { MdPayments } from "react-icons/md";
import { useParams } from "react-router-dom";
import useTransfer from "../../hooks/transfer_Hooks/useTransfer";
import { formatSyriaDateTime } from "../../shared/utilsDate";
import TransferReceipt from "../../printing/transferReseipt";

export default function TransferDetails() {
  const primary = "#FAE56E";
  const secondary = "#F5F5F5";
  const text = "#151515";
  const border = "rgba(250, 229, 110, 0.45)";
  const fontFamily = "'Alyamama', sans-serif";

  const infoBox = {
    width: 150,
    height: 50,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    p: 2,
    backgroundColor: "#242424",
    border: `1px solid ${border}`,
    borderRadius: 2,
  };

  const titleStyle = {
    display: "flex",
    gap: 1,
    color: primary,
    fontFamily,
    fontWeight: "bold",
  };

  const valueStyle = {
    color: secondary,
    fontFamily,
  };

  const iconStyle = {
    color: primary,
    backgroundColor: text,
    fontSize: 16,
    borderRadius: 4,
    padding: 4,
  };

  const dataBox = {
    backgroundColor: "#2B2B2B",
    border: `1px solid ${border}`,
    borderRadius: 2,
    p: 2,
    gap: 1,
  };

  const buttonStyle = {
    color: primary,
    borderColor: primary,
    fontSize: 15,
    gap: 1,
  };

  const { id } = useParams();

  const { transfer, loading } = useTransfer(Number(id));

  if (loading || !transfer) {
    return (
      <Typography
        sx={{
          color: "#FFFFFF",
          textAlign: "center",
          py: 5,
          fontFamily,
        }}
      >
        جاري تحميل تفاصيل الحوالة..
      </Typography>
    );
  }

  return (
    <>
      {/*helper components */}
      <TransferReceipt transfer={transfer} />

      <Box
        sx={{
          backgroundColor: "#1E1E1E",
          border: `1px solid ${primary}`,
          borderRadius: 2,
          p: 3,
          mt: 2,
        }}
      >
        {/* ================= Header ================= */}

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* العنوان */}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
                color: text,
                backgroundColor: primary,
                fontFamily,
                fontSize: 20,
                fontWeight: "bold",
                borderRadius: 2,
                p: 1,
                gap: 1,
              }}
            >
              {/* تفاصيل الحوالات */}
              <FaMoneyBillTransfer
                style={{
                  fontSize: 20,
                  color: primary,
                  backgroundColor: text,
                  borderRadius: 10,
                  padding: 6,
                }}
              />
              حوالة مالية
            </Typography>

            <Typography
              sx={{
                color: secondary,
                fontFamily,
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              تفاصيل الحوالة:
            </Typography>
          </Box>

          {/* رقم الحوالة والتاريخ */}

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* رقم الحوالة */}

            <Box sx={infoBox}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FaHashtag style={{ color: primary, fontSize: 22 }} />

                <Typography
                  sx={{
                    color: primary,
                    fontFamily,
                    fontSize: 20,
                  }}
                >
                  رقم الحوالة
                </Typography>
              </Box>

              <Typography sx={valueStyle}>{transfer.id}</Typography>
            </Box>

            {/* الوقت والتاريخ */}

            <Box sx={infoBox}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FaCalendarAlt
                  style={{
                    color: primary,
                    fontSize: 22,
                  }}
                />

                <Typography
                  sx={{
                    color: primary,
                    fontFamily,
                    fontSize: 18,
                  }}
                >
                  التاريخ والوقت
                </Typography>
              </Box>

              <Typography sx={valueStyle}>
                {formatSyriaDateTime(transfer.date)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ================= Details ================= */}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#191919",
            border: `1px solid ${border}`,
            borderRadius: 2,
            p: 2,
            gap: 2,
            my: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box
              sx={{
                width: 330,
                ...dataBox,
              }}
            >
              <Typography
                sx={{
                  ...titleStyle,
                }}
              >
                <FaUser style={iconStyle} />
                اسم المرسل
              </Typography>
              <Typography sx={valueStyle}>{transfer.fullName}</Typography>
            </Box>

            <Box
              sx={{
                width: 330,
                ...dataBox,
              }}
            >
              <Typography
                sx={{
                  ...titleStyle,
                }}
              >
                <FaUserCheck style={iconStyle} />
                اسم المستلم
              </Typography>
              <Typography sx={valueStyle}>
                {transfer.receiverFullname}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 330,
                ...dataBox,
              }}
            >
              <Typography
                sx={{
                  ...titleStyle,
                }}
              >
                <FaMapMarkerAlt style={iconStyle} />
                الوجهة
              </Typography>
              <Typography sx={valueStyle}>{transfer.destination}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box
              sx={{
                width: 225,
                ...dataBox,
              }}
            >
              <Typography
                sx={{
                  ...titleStyle,
                }}
              >
                <FaCoins style={iconStyle} />
                العملة
              </Typography>
              <Typography sx={valueStyle}>{transfer.currency}</Typography>
            </Box>

            <Box
              sx={{
                width: 225,
                ...dataBox,
              }}
            >
              <Typography
                sx={{
                  ...titleStyle,
                }}
              >
                <FaWallet style={iconStyle} />
                المبلغ
              </Typography>
              <Typography sx={valueStyle}>{transfer.amount}</Typography>
            </Box>

            <Box
              sx={{
                width: 225,
                ...dataBox,
              }}
            >
              <Typography
                sx={{
                  ...titleStyle,
                }}
              >
                <FaMoneyBillWave style={iconStyle} />
                الأجور
              </Typography>
              <Typography sx={valueStyle}>{transfer.wages}</Typography>
            </Box>

            <Box
              sx={{
                width: 225,
                ...dataBox,
              }}
            >
              <Typography
                sx={{
                  ...titleStyle,
                }}
              >
                <FaFileInvoiceDollar style={iconStyle} />
                متضمن الأجور
              </Typography>
              <Typography>
                {transfer.wagesIncluded && (
                  <FaCheckCircle
                    style={{ color: "#26fe00", fontSize: 17, marginRight: 25 }}
                  />
                )}
                <Typography component="span" sx={{ ...valueStyle, pr: 2 }}>
                  {transfer.wagesIncluded ? "نعم" : "لا"}
                </Typography>
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              width: 1077,
              backgroundColor: "#202020",
              border: `1px solid ${border}`,
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <MdPayments style={iconStyle} />

              <Typography sx={titleStyle}>الملاحظات:</Typography>
            </Box>

            <Typography sx={valueStyle}>{transfer.note || "_"}</Typography>
          </Box>
        </Box>

        {/* ================= Buttons ================= */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={() => window.print()} variant="outlined" sx={buttonStyle}>
            <FaPrint />
            طباعة
          </Button>

          <Box sx={{ display: "flex", gap: 4 }}>
            <Button variant="outlined" sx={buttonStyle}>
              <FaEdit />
              تعديل
            </Button>

            <Button
              variant="contained"
              sx={{
                ...buttonStyle,
                color: text,
                backgroundColor: primary,
              }}
            >
              <FaTrash />
              حذف
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
