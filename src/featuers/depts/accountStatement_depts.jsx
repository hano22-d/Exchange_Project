import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Divider,
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { FaFilter, FaPlus, FaUser } from "react-icons/fa";
import {
  MdAssignment,
  MdCalendarMonth,
  MdDeleteOutline,
  MdEdit,
  MdRestartAlt,
} from "react-icons/md";
import { useState } from "react";
import AddDeptAction from "../depts/addDeptAction_depts";
import { useParams } from "react-router-dom";
import usePartyDebtAccount from "../../hooks/debt_hooks/usePartyDebtAccount";
import { formatSyriaDateTime } from "../../shared/utilsDate";
import useDebtActions from "../../hooks/debt_hooks/useDebtActions";
import BasicToast from "../../shared/ui/toast";
import useDebts from "../../hooks/debt_hooks/useDebts";
import UpdateDeptAction from "./updateDebtDialog";
import DeleteDialog from "../../shared/ui/deleteDialog";

export default function PartyAccount() {
  const primary = "rgba(250,229,110,0.992)";
  const secondary = "#ffffff";
  const text = "black";
  const goldBorder = "#c9a342";
  const textColor = "#f5f5f5";
  const fontFamily = "'Alyamama', sans-serif";

  const cellStyle = {
    fontSize: 20,
    fontWeight: 600,
    color: textColor,
    borderBottom: "1px solid rgba(250,229,110,0.14)",
    fontFamily: fontFamily,
    whiteSpace: "nowrap",
    textAlign: "center",
  };

  const textStyle = {
    fontSize: 20,
    color: "#e5e5e5",
    fontFamily: fontFamily,
  };

  const filterField = {
    color: secondary,
    backgroundColor: "#252525",
    fontFamily,

    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(250,229,110,0.35)",
    },

    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: primary,
    },

    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: primary,
    },

    "& .MuiSvgIcon-root": {
      color: primary,
    },

    "& input": {
      color: secondary,
      fontFamily,
    },
  };

  const columns = [
    { id: "date", label: "التاريخ" },
    { id: "amount", label: "المبلغ" },
    { id: "currency", label: "العملة" },
    { id: "effect", label: "القيد / الأثر" },
    { id: "note", label: "الملاحظة" },
    { id: "actions", label: "الإجراءات" },
  ];

  const { partyId } = useParams();

  const emptyForm = {
    currency: "",
    dateFrom: "",
    dateTo: "",
  };

  // ==== states ==== //
  const [debtFilters, setDebtFilters] = useState(emptyForm);
  const [currentDebt, setCurrentDebt] = useState(null);
  const [openAddDept, setOpenAddDept] = useState(false);
  const [openUpdateDebt, setOpenUpdateDebt] = useState();
  const [openDeleteDebt, setOpenDeleteDebt] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "",
  });

  // ==== services ==== //
  const {
    party,
    balances,
    loading,
    refetch: accountRefetch,
  } = usePartyDebtAccount(Number(partyId));
  const { debts, refetch } = useDebts({ partyId, ...debtFilters });
  const { createDebt, creating, updateDebt, updating, deleteDebt, deleting } =
    useDebtActions();

  // ==== functions ==== //

  // دالة جمع قيم المدخلات
  function handleInputOnchange(event) {
    const { name, value } = event.target;

    setDebtFilters((prevValue) => {
      return { ...prevValue, [name]: value };
    });
  }

  // دالة إضافة دين جديد
  async function addDebt(formData) {
    try {
      await createDebt({ partyId, ...formData });

      refetch(); // تحديث سجل الحركات
      accountRefetch(); // تحديث ارصدة الحساب

      setToast({
        open: true,
        message: "تمت إضافة الدين بنجاح",
        severity: "success",
      });

      setOpenAddDept(false);
    } catch (error) {
      setToast({
        open: true,
        message: `فشل إضافة الدين: ${error.message}`,
        severity: "error",
      });
    }
  }

  // دالة تعديل حركة دين
  async function updateDebtFun(updateForm) {
    try {
      await updateDebt(currentDebt.id, updateForm);

      refetch(); // تحديث سجل الحركات
      accountRefetch(); // تحديث ارصدة الحساب

      setToast({
        open: true,
        message: "تم تعديل الدين بنجاح",
        severity: "success",
      });

      setOpenUpdateDebt(false);
    } catch (error) {
      setToast({
        open: true,
        message: `فشل تعديل الدين: ${error.message}`,
        severity: "error",
      });
    }
  }

  // دالة حذف حركة دين
  async function deleteDebtFun() {
    try {
      await deleteDebt(currentDebt.id);

      refetch(); // تحديث سجل الحركات
      accountRefetch(); // تحديث ارصدة الحساب

      setToast({
        open: true,
        message: "تم حذف الدين بنجاح",
        severity: "success",
      });

      setOpenDeleteDebt(false);
    } catch (error) {
      setToast({
        open: true,
        message: `فشل حذف الدين: ${error.message}`,
        severity: "error",
      });
    }
  }

  if (loading || !party)
    return (
      <Typography
        sx={{
          color: "#fff",
          my: 5,
          textAlign: "center",
          fontSize: "1.5rem",
          fontFamily: fontFamily,
        }}
      >
        جار تحميل الحساب..
      </Typography>
    );

  return (
    <Paper
      sx={{
        overflow: "hidden",
        borderRadius: 2,
        border: `1px solid ${goldBorder}`,
        background: "linear-gradient(145deg, #191919, #101010)",
        fontFamily: fontFamily,
      }}
    >
      {/*helper components*/}
      <AddDeptAction
        open={openAddDept}
        onClose={() => setOpenAddDept(false)}
        onAdd={addDebt}
        loading={creating}
      />

      <UpdateDeptAction
        open={openUpdateDebt}
        onClose={() => {
          setOpenUpdateDebt(false);
          setCurrentDebt(null);
        }}
        onUpdate={updateDebtFun}
        debt={currentDebt}
        loading={updating}
      />

      <DeleteDialog
        open={openDeleteDebt}
        onClose={() => setOpenDeleteDebt(false)}
        onConfirm={deleteDebtFun}
        loading={deleting}
      />

      <BasicToast
        open={toast.open}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        message={toast.message}
        severity={toast.severity}
      />

      {/*main component*/}
      <Box
        sx={{
          background: "linear-gradient(145deg, #191919, #101010)",
          border: `1px solid ${primary}`,
          borderRadius: 2,
          m: 2,
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
          <Box sx={{ display: "flex", gap: 1 }}>
            <FaUser
              style={{
                color: primary,
                fontSize: 30,
                borderRadius: 10,
                padding: 10,
              }}
            />
            <Box>
              <Typography
                sx={{
                  color: secondary,
                  fontFamily,
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                {party.fullName}
              </Typography>
              <Typography sx={{ color: secondary, fontFamily, fontSize: 16 }}>
                {party.phoneNumber}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={() => setOpenAddDept(true)}
            sx={{
              color: text,
              display: "flex",
              backgroundColor: primary,
              gap: 0.5,
            }}
          >
            <FaPlus style={{ color: text }} />
            <Typography sx={{ fontFamily, fontWeight: 500 }}>
              إضافة حركة دين
            </Typography>
          </Button>
        </Box>
        <Divider sx={{ backgroundColor: primary, opacity: 0.5, my: 2 }} />
        <Grid container rowSpacing={2} columnSpacing={3}>
          {balances.map((balance) => (
            <Grid
              size={4}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#fff",
                borderRadius: 4,
                p: 2,
                px: 3,
                border: "1px solid #f6bd00",
                borderLeft: "5px solid #f6bd00",
              }}
            >
              <Typography
                sx={{ fontSize: "20px", color: "#111", fontWeight: 700 }}
              >
                {balance.currency}
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Typography
                  sx={{
                    ...cellStyle,
                    px: 2.5,
                    borderRadius: 2,

                    background:
                      balance.direction === "لنا" ? "#00A651" : "#FF0000",

                    fontFamily: fontFamily,
                  }}
                >
                  {balance.direction}
                </Typography>
                <Typography
                  sx={{ fontSize: "20px", color: "#111", fontWeight: 700 }}
                >
                  {balance.amount}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Filters */}

      <Box sx={{ p: 4 }}>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", gap: 0.5 }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <FaFilter style={{ color: primary, fontSize: 20 }} />
            <Typography sx={{ color: primary, fontFamily, fontSize: 20 }}>
              تصفية كشف الحساب:
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => setDebtFilters(emptyForm)}
            sx={{
              color: primary,
              fontFamily,
              borderColor: primary,
              gap: 0.5,

              "&:hover": {
                backgroundColor: "rgba(250, 229, 110, 0.16)",
                borderColor: primary,
              },
            }}
          >
            <MdRestartAlt
              style={{
                fontSize: 25,
                padding: 1,
              }}
            />

            <Typography
              sx={{
                fontFamily,
                alignSelf: "end",
              }}
            >
              إعادة ضبط الفلاتر
            </Typography>
          </Button>
        </Box>
        <Grid container rowSpacing={2} columnSpacing={3}>
          <Grid size={4}>
            <Typography sx={{ color: secondary, fontFamily, my: 0.4 }}>
              العملة:
            </Typography>
            <Select
              name="currency"
              value={debtFilters.currency}
              onChange={handleInputOnchange}
              fullWidth
              displayEmpty
              sx={filterField}
            >
              {balances.map((balance) => (
                <MenuItem value={balance.currency}>{balance.currency}</MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid size={4}>
            <Typography sx={{ color: secondary, fontFamily, my: 0.4 }}>
              من تاريخ:
            </Typography>
            <TextField
              fullWidth
              name="dateFrom"
              value={debtFilters.dateFrom}
              onChange={handleInputOnchange}
              type="date"
              sx={filterField}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid size={4}>
            <Typography sx={{ color: secondary, fontFamily, my: 0.4 }}>
              إلى تاريخ:
            </Typography>
            <TextField
              fullWidth
              type="date"
              name="dateTo"
              value={debtFilters.dateTo}
              onChange={handleInputOnchange}
              sx={filterField}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* =================Details HEADER ================= */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, #1b1b1b, #111111)",
          p: 2,
        }}
      >
        {/* Title */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <MdAssignment
            style={{
              fontSize: 32,
              color: primary,
            }}
          />

          <Typography
            sx={{
              fontSize: 26,
              fontWeight: 700,
              color: primary,
            }}
          >
            سجل حركات الصرف التفصيلي
          </Typography>
        </Box>

        {/* Movements Count */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            padding: "7px 14px",
            borderRadius: 2,
            border: `1px solid ${goldBorder}`,
            backgroundColor: "rgba(250,229,110,0.06)",
          }}
        >
          <Typography
            sx={{
              color: primary,
              fontSize: 21,
              fontWeight: 600,
            }}
          >
            عدد الحركات:
          </Typography>
          <Typography
            sx={{
              color: "#fff",
              fontSize: 21,
              fontWeight: 600,
            }}
          >
            {debts.length}
          </Typography>
        </Box>
      </Box>

      <Divider
        sx={{
          borderColor: goldBorder,
          opacity: 0.8,
        }}
      />

      {/* ================= TABLE ================= */}

      <TableContainer>
        <Table>
          {/* Table Head */}

          <TableHead>
            <TableRow
              sx={{
                background: "linear-gradient(180deg, #453719, #292216)",
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: primary,
                    borderBottom: `2px solid ${goldBorder}`,
                    borderLeft: "1px solid rgba(250,229,110,0.15)",
                    fontFamily: fontFamily,
                    textAlign: "center",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body */}

          <TableBody>
            {debts.map((debt) => (
              <TableRow key={debt.id}>
                {/* Date */}

                <TableCell sx={cellStyle}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <MdCalendarMonth
                      style={{
                        color: primary,
                        fontSize: 24,
                      }}
                    />

                    <Typography sx={textStyle}>
                      {formatSyriaDateTime(debt.date).replace(",", "-")}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Amount */}

                <TableCell
                  sx={{
                    ...cellStyle,
                  }}
                >
                  {debt.amount}
                </TableCell>

                {/* Currency */}

                <TableCell
                  sx={{
                    ...cellStyle,
                  }}
                >
                  {debt.currency}
                </TableCell>

                {/* Effect */}

                <TableCell align="center" sx={cellStyle}>
                  <Chip
                    label={debt.direction}
                    sx={{
                      ...cellStyle,
                      p: 2.5,
                      borderRadius: 10,

                      background:
                        debt.direction === "لنا" ? "#00A651" : "#FF0000",

                      fontFamily: fontFamily,
                    }}
                  />
                </TableCell>

                {/* Note */}

                <TableCell
                  sx={{
                    ...cellStyle,
                    color: secondary,
                  }}
                >
                  {debt.note || "—"}
                </TableCell>

                {/* Actions */}

                <TableCell sx={cellStyle}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    {/* Edit */}

                    <IconButton
                      onClick={() => {
                        setOpenUpdateDebt(true);
                        setCurrentDebt(debt);
                      }}
                      sx={{
                        width: 50,
                        height: 50,
                        color: primary,
                        border: "1px solid rgba(250,229,110,0.35)",
                        backgroundColor: "rgba(250,229,110,0.07)",

                        "&:hover": {
                          backgroundColor: "rgba(250,229,110,0.2)",
                          borderColor: primary,
                        },
                      }}
                    >
                      <MdEdit sx={{ fontSize: 32 }} />
                    </IconButton>

                    {/* Delete */}

                    <IconButton
                      onClick={() => {
                        setOpenDeleteDebt(true);
                        setCurrentDebt(debt);
                      }}
                      sx={{
                        width: 50,
                        height: 50,
                        color: "#ff5252",
                        border: "1px solid rgba(244,67,54,0.25)",
                        backgroundColor: "rgba(244,67,54,0.12)",

                        "&:hover": {
                          backgroundColor: "rgba(244,67,54,0.25)",
                        },
                      }}
                    >
                      <MdDeleteOutline style={{ fontSize: 32 }} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
