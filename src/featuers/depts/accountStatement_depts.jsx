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
  MdFormatListBulleted,
} from "react-icons/md";

export default function ExchangeHistory() {
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

  const movements = [
    {
      id: 1,
      date: "01/10/2026",
      operation: "أخذ من المكتب",
      amount: "1,000",
      currency: "USD",
      effect: "لنا (دين على الطرف)",
      effectType: "pending",
      note: "تعليق بدل نشر",
    },
    {
      id: 2,
      date: "03/10/2026",
      operation: "دفع للمكتب",
      amount: "300",
      currency: "USD",
      effect: "له (مستحق للطرف)",
      effectType: "completed",
      note: "تسديد لمبلغ من طرف عمولة",
    },
    {
      id: 3,
      date: "05/10/2026",
      operation: "أخذ من المكتب",
      amount: "200",
      currency: "EUR",
      effect: "له (مستحق للطرف)",
      effectType: "completed",
      note: "أخلة للمدين كنت",
    },
  ];

  const columns = [
    { id: "date", label: "التاريخ" },
    { id: "amount", label: "المبلغ" },
    { id: "currency", label: "العملة" },
    { id: "effect", label: "القيد / الأثر" },
    { id: "note", label: "الملاحظة" },
    { id: "actions", label: "الإجراءات" },
  ];
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
                أحمد محمد علي
              </Typography>
              <Typography sx={{ color: secondary, fontFamily, fontSize: 16 }}>
                رقم الهاتف
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            sx={{
              color: text,
              display: "flex",
              backgroundColor: primary,
              gap: 0.5
            }}
          >
            <FaPlus style={{ color: text }} />
            <Typography sx={{fontFamily, fontWeight: 500}}>إضافة حركة دين</Typography>
          </Button>
        </Box>
        <Divider sx={{ backgroundColor: primary, opacity: 0.5, my: 2 }} />
        <Grid container rowSpacing={2} columnSpacing={3}>
          <Grid
            size={4}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "#f6bc0078",
              border: `1px solid #f6bd00`,
              borderRadius: 4,
              p: 1.5,
            }}
          >
            <Typography>680 USD</Typography>
            <Typography>لنا</Typography>
          </Grid>

          <Grid
            size={4}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "#00f6f278",
              border: `1px solid #00f6f2`,
              borderRadius: 4,
              p: 1.5,
            }}
          >
            <Typography>400 EUR</Typography>
            <Typography>له</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Filters */}

      <Box sx={{ p: 4 }}>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <FaFilter style={{ color: primary, fontSize: 20 }} />
          <Typography sx={{ color: primary, fontFamily, fontSize: 20 }}>
            تصفية كشف الحساب:
          </Typography>
        </Box>
        <Grid container rowSpacing={2} columnSpacing={3}>
          <Grid size={4}>
            <Typography sx={{ color: secondary, fontFamily, my: 0.4 }}>
              العملة:
            </Typography>
            <Select fullWidth defaultValue="all" displayEmpty sx={filterField}>
              <MenuItem value="all">جميع العملات</MenuItem>
              <MenuItem value="USD">USD - دولار أمريكي</MenuItem>
              <MenuItem value="EUR">EUR - يورو</MenuItem>
              <MenuItem value="SYP">SYP - ليرة سورية</MenuItem>
              <MenuItem value="TRY">TRY - ليرة تركية</MenuItem>
            </Select>
          </Grid>
          <Grid size={4}>
            <Typography sx={{ color: secondary, fontFamily, my: 0.4 }}>
              من تاريخ:
            </Typography>
            <TextField
              fullWidth
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
            gap: 0.5,
            padding: "7px 14px",
            borderRadius: 6,
            border: `1px solid ${goldBorder}`,
            backgroundColor: "rgba(250,229,110,0.06)",
          }}
        >
          <MdFormatListBulleted
            style={{
              color: primary,
              fontSize: 30,
            }}
          />

          <Typography
            sx={{
              color: primary,
              fontSize: 21,
              fontWeight: 600,
            }}
          >
            عدد الحركات
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
            {movements.map((row) => (
              <TableRow key={row.id}>
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

                    <Typography sx={textStyle}>{row.date}</Typography>
                  </Box>
                </TableCell>

                {/* Amount */}

                <TableCell
                  sx={{
                    ...cellStyle,
                  }}
                >
                  {row.amount}
                </TableCell>

                {/* Currency */}

                <TableCell
                  sx={{
                    ...cellStyle,
                  }}
                >
                  {row.currency}
                </TableCell>

                {/* Effect */}

                <TableCell align="center" sx={cellStyle}>
                  <Chip
                    label={row.effect}
                    sx={{
                      ...cellStyle,
                      p: 2.5,
                      borderRadius: 10,

                      background:
                        row.effectType === "pending"
                          ? "linear-gradient(135deg, #f9dc86, #eabf4c)"
                          : "linear-gradient(135deg, #424750, #303640)",

                      color:
                        row.effectType === "pending" ? "#211800" : "#dce7ff",

                      border:
                        row.effectType === "pending"
                          ? "1px solid #e6c15c"
                          : "1px solid #606b7c",

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
                  {row.note || "—"}
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
