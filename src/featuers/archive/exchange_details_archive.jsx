import { Box, Button, Grid, Typography } from "@mui/material";
import {
  FaPrint,
  FaEdit,
  FaTrash,
  FaExchangeAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { FaCoins, FaHashtag, FaMoneyBillWave } from "react-icons/fa6";
import { MdPayments } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useExchange } from "../../hooks/exchanges-Hooks/useExchange";
import { formatSyriaDateTime } from "../../shared/utilsDate";
import ExchangeReceipt from "../../printing/ExchangeReseipt";
import { useState } from "react";
import EditExchangeDialog from "./EditExchangeDialog";
import { useExchangeActions } from "../../hooks/exchanges-Hooks/useExchangeActions";
import BasicToast from "../../shared/ui/toast";
import DeleteDialog from "../../shared/ui/deleteDialog";

export default function ExchangeDetails() {
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

  const dataBox = {
    width: "320px",
    backgroundColor: "#2B2B2B",
    border: `1px solid ${border}`,
    borderRadius: 2,
    p: 2,
  };

  const titleStyle = {
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
  };

  const buttonStyle = {
    fontFamily,
    color: primary,
    borderColor: primary,
    fontSize: 15,
    gap: 1,
  };

  // get Id
  const { id } = useParams();

  const navigate = useNavigate();

  // states
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "",
  });

  // services
  const { exchange, loading, setExchangeData } = useExchange(
    Number(id)
  );
  const { updateExchange, updating, deleteExchange, deleting } =
    useExchangeActions();

  // ==== update function ==== //
  async function handleUpdateExchange(updateForm) {
    try {
      const updateResult = await updateExchange(exchange.id, updateForm);

      //تحديث حالة صفحة التفاصيل بعد نجاح التعديل
      setExchangeData(updateResult);

      setToast({
        open: true,
        message: "تم التعديل بنجاح",
        severity: "success",
      });

      setOpenDialog(false);
    } catch (error) {
      setToast({
        open: true,
        message: `فشل التعديل : ${error.message}`,
        severity: "error",
      });
    }
  }

  // ==== delete function ==== //
  async function handleDeleteExchange(id) {
    try {
      await deleteExchange(id);

      setToast({
        open: true,
        message: "تم حذف الحركة بنجاح",
        severity: "success",
      });

      setDeleteDialogOpen(false);
      navigate("/archive");
    } catch (error) {
      setToast({
        open: true,
        message: `فشل الحذف: ${error.message}`,
        severity: "error",
      });
    }
  }

  if (loading || !exchange) {
    return (
      <Typography
        sx={{
          color: "#FFFFFF",
          textAlign: "center",
          py: 5,
          fontFamily,
        }}
      >
        جاري تحميل تفاصيل حركة الصرف ..
      </Typography>
    );
  }

  return (
    <>
      {/* helpers components */}
      <ExchangeReceipt exchange={exchange} />

      {openDialog && (
        <EditExchangeDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          exchange={exchange}
          onEditConfirm={handleUpdateExchange}
          editLoading={updating}
        />
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => handleDeleteExchange(exchange.id)}
        loading={deleting}
      />

      <BasicToast
        open={toast.open}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        message={toast.message}
        severity={toast.severity}
      />

      {/* main components */}
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
              <FaExchangeAlt
                style={{
                  fontSize: 20,
                  color: primary,
                  backgroundColor: text,
                  borderRadius: 10,
                  padding: 6,
                }}
              />
              عملية صرافة
            </Typography>

            <Typography
              sx={{
                color: secondary,
                fontFamily,
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              تفاصيل العملية:
            </Typography>
          </Box>

          {/* رقم العملية والتاريخ */}

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* رقم العملية */}

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
                  رقم العملية
                </Typography>
              </Box>

              <Typography sx={valueStyle}>{exchange.id}</Typography>
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
                    fontSize: 20,
                  }}
                >
                  الوقت والتاريخ
                </Typography>
              </Box>

              <Typography sx={valueStyle}>
                {formatSyriaDateTime(exchange.date).replace(",", " -")}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ================= Details ================= */}

        <Grid
          container
          spacing={3}
          columns={12}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#191919",
            border: `1px solid ${border}`,
            borderRadius: 2,
            p: 2,
            my: 2,
          }}
        >
          {/* العملة المستلمة */}

          <Box sx={dataBox}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FaCoins style={iconStyle} />

              <Typography sx={titleStyle}>
                العملة المستلمة من الزبون:
              </Typography>
            </Box>

            <Typography sx={valueStyle}>{exchange.fromCurrency}</Typography>
          </Box>

          {/* العملة المدفوعة */}

          <Box sx={dataBox}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FaCoins style={iconStyle} />

              <Typography sx={titleStyle}>العملة المدفوعة للزبون:</Typography>
            </Box>

            <Typography sx={valueStyle}>{exchange.toCurrency}</Typography>
          </Box>

          {/* سعر الصرف */}

          <Box sx={dataBox}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FaExchangeAlt style={iconStyle} />

              <Typography sx={titleStyle}>سعر الصرف:</Typography>
            </Box>

            <Typography sx={valueStyle}>{exchange.rate}</Typography>
          </Box>

          {/* المبلغ المستلم */}

          <Box sx={dataBox}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FaMoneyBillWave style={iconStyle} />

              <Typography sx={titleStyle}>المبلغ المستلم من الزبون:</Typography>
            </Box>

            <Typography sx={valueStyle}>{exchange.fromAmount}</Typography>
          </Box>

          {/* المبلغ المدفوع */}

          <Box sx={dataBox}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FaMoneyBillWave style={iconStyle} />

              <Typography sx={titleStyle}>المبلغ المدفوع للزبون:</Typography>
            </Box>

            <Typography sx={valueStyle}>{exchange.toAmount}</Typography>
          </Box>

          {/* تاريخ التحديث */}

          <Box sx={dataBox}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FaCalendarAlt style={iconStyle} />

              <Typography sx={titleStyle}>تاريخ التحديث:</Typography>
            </Box>

            <Typography sx={valueStyle}>
              {formatSyriaDateTime(exchange.updatedAt)}
            </Typography>
          </Box>

          {/* الملاحظات */}

          <Box
            sx={{
              width: 1075,
              backgroundColor: "#202020",
              border: `1px solid ${border}`,
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MdPayments style={iconStyle} />

              <Typography sx={titleStyle}>الملاحظات:</Typography>
            </Box>

            <Typography sx={valueStyle}>{exchange.note}</Typography>
          </Box>
        </Grid>

        {/* ================= Buttons ================= */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            variant="outlined"
            sx={{ ...buttonStyle, background: "#E5E4E2", color: "#111" }}
            onClick={() => window.print()}
          >
            <FaPrint />
            طباعة
          </Button>

          <Box sx={{ display: "flex", gap: 4 }}>
            <Button
              variant="contained"
              sx={{ ...buttonStyle, background: primary, color: "#111" }}
              onClick={() => setOpenDialog(true)}
            >
              <FaEdit />
              تعديل
            </Button>

            <Button
              onClick={() => setDeleteDialogOpen(true)}
              variant="contained"
              sx={{
                ...buttonStyle,
                color: "white",
                backgroundColor: "rgb(211, 47, 47)",
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
