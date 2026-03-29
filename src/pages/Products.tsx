"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Stack,
  IconButton,
  Avatar,
  InputAdornment,
  Chip,
  Divider,
  Snackbar,
  Alert,
  Slide,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import type { AlertColor, SlideProps } from "@mui/material";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";

import { formatCurrency } from "../utils/format";

interface Product {
  id: number;
  barcode: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  cost: number;
  stockQty: number;
  minStock: number;
  supplier: string;
  location: string;
  description: string;
  status: "active" | "inactive";
}

const emptyForm: Product = {
  id: 0,
  barcode: "",
  sku: "",
  name: "",
  category: "",
  unit: "ชิ้น",
  price: 0,
  cost: 0,
  stockQty: 1,
  minStock: 0,
  supplier: "",
  location: "",
  description: "",
  status: "active",
};

const unitOptions = ["ชิ้น", "ขวด", "กล่อง", "แพ็ก", "ถุง", "ชิ้น/ชุด"];
const categoryOptions = [
  "เครื่องดื่ม",
  "อาหาร",
  "ของใช้",
  "เครื่องเขียน",
  "สินค้าเบ็ดเตล็ด",
];
const statusOptions: Array<{ value: Product["status"]; label: string }> = [
  { value: "active", label: "ขายอยู่" },
  { value: "inactive", label: "งดขาย" },
];

function SlideDownTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Product>(emptyForm);

  const [scanBarcode, setScanBarcode] = useState("");
  const scanInputRef = useRef<HTMLInputElement | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message: string, severity: AlertColor = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = (
    _: Event | React.SyntheticEvent<any, Event>,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const focusScanInput = () => {
    requestAnimationFrame(() => {
      scanInputRef.current?.focus();
      scanInputRef.current?.select?.();
    });
  };

  const openAdd = () => {
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = (product: Product) => {
    setForm(product);
    setOpenForm(true);
  };

  const askDelete = (product: Product) => {
    setSelectedProduct(product);
    setOpenDelete(true);
  };

  const closeForm = () => {
    setOpenForm(false);
    setForm(emptyForm);
  };

  const closeDelete = () => {
    setOpenDelete(false);
    setSelectedProduct(null);
  };

  const updateForm = <K extends keyof Product>(key: K, value: Product[K]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const increaseStockByBarcode = (barcodeValue: string, amount = 1) => {
    const trimmed = barcodeValue.trim();

    if (!trimmed) return;

    const found = products.find((item) => item.barcode.trim() === trimmed);

    if (!found) {
      setScanBarcode("");
      showSnackbar("ไม่พบบาร์โค้ดนี้ในระบบ กรุณาเพิ่มสินค้าใหม่ก่อน", "warning");
      focusScanInput();
      return;
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === found.id
          ? {
              ...item,
              stockQty: item.stockQty + amount,
            }
          : item
      )
    );

    setScanBarcode("");
    showSnackbar(
      `เพิ่มจำนวนสินค้า ${found.name} +${amount} ${found.unit}`,
      "success"
    );
    focusScanInput();
  };

  useEffect(() => {
    const trimmed = scanBarcode.trim();

    if (!trimmed) return;

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    scanTimeoutRef.current = setTimeout(() => {
      increaseStockByBarcode(trimmed, 1);
    }, 150);

    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [scanBarcode, products]);

  const saveProduct = () => {
    if (!form.barcode.trim()) {
      showSnackbar("กรุณากรอกบาร์โค้ดสินค้า", "warning");
      return;
    }

    if (!form.sku.trim()) {
      showSnackbar("กรุณากรอกรหัสสินค้า", "warning");
      return;
    }

    if (!form.name.trim()) {
      showSnackbar("กรุณากรอกชื่อสินค้า", "warning");
      return;
    }

    if (!form.category.trim()) {
      showSnackbar("กรุณาเลือกหมวดหมู่สินค้า", "warning");
      return;
    }

    if (!form.unit.trim()) {
      showSnackbar("กรุณาเลือกหน่วยสินค้า", "warning");
      return;
    }

    if (form.price <= 0) {
      showSnackbar("ราคาขายต้องมากกว่า 0", "warning");
      return;
    }

    if (form.cost < 0) {
      showSnackbar("ต้นทุนต้องไม่ติดลบ", "warning");
      return;
    }

    if (form.stockQty < 0) {
      showSnackbar("จำนวนสินค้าในสต๊อกต้องไม่ติดลบ", "warning");
      return;
    }

    if (form.minStock < 0) {
      showSnackbar("สต๊อกขั้นต่ำต้องไม่ติดลบ", "warning");
      return;
    }

    if (
      products.some(
        (p) => p.barcode.trim() === form.barcode.trim() && p.id !== form.id
      )
    ) {
      showSnackbar("บาร์โค้ดนี้มีอยู่ในระบบแล้ว", "error");
      return;
    }

    if (
      products.some((p) => p.sku.trim() === form.sku.trim() && p.id !== form.id)
    ) {
      showSnackbar("รหัสสินค้านี้มีอยู่ในระบบแล้ว", "error");
      return;
    }

    const normalized: Product = {
      ...form,
      barcode: form.barcode.trim(),
      sku: form.sku.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      unit: form.unit.trim(),
      supplier: form.supplier.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
    };

    if (form.id === 0) {
      setProducts((prev) => [
        ...prev,
        {
          ...normalized,
          id: Date.now(),
        },
      ]);
      showSnackbar("เพิ่มสินค้าใหม่เข้าระบบเรียบร้อย", "success");
    } else {
      setProducts((prev) => prev.map((p) => (p.id === form.id ? normalized : p)));
      showSnackbar("แก้ไขสินค้าเรียบร้อย", "success");
    }

    closeForm();
    focusScanInput();
  };

  const confirmDelete = () => {
    if (!selectedProduct) return;

    setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
    showSnackbar(`ลบสินค้า "${selectedProduct.name}" เรียบร้อย`, "success");
    closeDelete();
  };

  const filteredProducts = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return products;

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q) ||
        String(p.price).includes(q)
    );
  }, [products, keyword]);

  const totalStock = useMemo(
    () => products.reduce((sum, item) => sum + item.stockQty, 0),
    [products]
  );

  const lowStockCount = useMemo(
    () => products.filter((item) => item.stockQty <= item.minStock).length,
    [products]
  );

  return (
    <Box sx={{ minHeight: "100%" }}>
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 5,
          background:
            "linear-gradient(135deg, #0f172a 0%, #18253c 45%, #344256 100%)",
          color: "#fff",
          boxShadow: "0 18px 34px rgba(15, 23, 42, 0.14)",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", lg: "center" }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ minWidth: 0, flex: 1, }}
          >
            <Avatar
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.14)",
                flexShrink: 0,
              }}
            >
              <Inventory2RoundedIcon />
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                fontWeight={900}
                sx={{ lineHeight: 1.1, mb: 0.4 }}
              >
                จัดการสินค้า
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.84,
                  lineHeight: 1.45,
                  maxWidth: 520,
                }}
              >
                เพิ่มสินค้าเพียง 1 รายการต่อชนิด แล้วใช้เครื่องยิงบาร์โค้ดเพื่อเพิ่มจำนวนสต๊อกอัตโนมัติ
              </Typography>
            </Box>
          </Stack>

          <Stack
            spacing={1.4}
            alignItems={{ xs: "stretch", lg: "flex-end" }}
            sx={{ width: { xs: "100%", lg: "auto" } }}
          >
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              justifyContent={{ xs: "flex-start", lg: "flex-end" }}
            >
              <Chip
                label={`${products.length} รายการ`}
                sx={{
                  height: 36,
                  borderRadius: 999,
                  fontWeight: 800,
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              />
              <Chip
                label={`สต๊อกรวม ${totalStock}`}
                sx={{
                  height: 36,
                  borderRadius: 999,
                  fontWeight: 800,
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              />
              <Chip
                label={`ใกล้หมด ${lowStockCount}`}
                sx={{
                  height: 36,
                  borderRadius: 999,
                  fontWeight: 800,
                  color: "#fff",
                  bgcolor:
                    lowStockCount > 0
                      ? "rgba(245,158,11,0.22)"
                      : "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              />
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              justifyContent={{ xs: "stretch", lg: "flex-end" }}
            >
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openAdd}
                sx={{
                  borderRadius: 4,
                  px: 2.4,
                  py: 1.2,
                  minWidth: 150,
                  fontWeight: 900,
                  textTransform: "none",
                  color: "#111827",
                  background: "#fff",
                  boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
                  "&:hover": {
                    background: "#f8fafc",
                  },
                }}
              >
                เพิ่มสินค้า
              </Button>

              <Button
                variant="outlined"
                startIcon={<QrCodeScannerRoundedIcon />}
                onClick={focusScanInput}
                sx={{
                  borderRadius: 4,
                  px: 2.4,
                  py: 1.2,
                  minWidth: 170,
                  fontWeight: 800,
                  textTransform: "none",
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.04)",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.35)",
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                โฟกัสช่องยิงบาร์โค้ด
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      <Paper
        elevation={0}
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 5,
          border: "1px solid #e5e7eb",
          background: "#fff",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <TextField
              fullWidth
              placeholder="ค้นหาด้วยชื่อสินค้า บาร์โค้ด รหัสสินค้า หมวดหมู่ ผู้จำหน่าย หรือราคา"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 4,
                  backgroundColor: "#fafafa",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: "#6b7280" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              inputRef={scanInputRef}
              label="ยิงบาร์โค้ดเพื่อเพิ่มจำนวนสินค้า"
              placeholder="สแกนบาร์โค้ดได้ทันที"
              value={scanBarcode}
              onChange={(e) => setScanBarcode(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 4,
                  backgroundColor: "#fafafa",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QrCodeScannerRoundedIcon sx={{ color: "#2563eb" }} />
                  </InputAdornment>
                ),
              }}
              helperText="ยิงเสร็จแล้วระบบจะเพิ่มจำนวนสินค้าให้อัตโนมัติ"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          borderRadius: 5,
          border: "1px solid #e5e7eb",
          background: "#fff",
          boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
          }}
        >
          <Typography fontSize={18} fontWeight={800} color="#111827">
            รายการสินค้าในระบบ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            สินค้าแต่ละชนิดมี 1 รายการ และใช้การยิงบาร์โค้ดเพื่อเพิ่มจำนวนสต๊อก
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: "#f9fafb",
                  "& .MuiTableCell-root": {
                    borderBottom: "1px solid #e5e7eb",
                    fontWeight: 800,
                    color: "#374151",
                    py: 1.8,
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <TableCell>สินค้า</TableCell>
                <TableCell>หมวดหมู่</TableCell>
                <TableCell>ราคาขาย</TableCell>
                <TableCell>ต้นทุน</TableCell>
                <TableCell>สต๊อก</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell width={180} align="center">
                  จัดการ
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredProducts.map((p) => {
                const isLowStock = p.stockQty <= p.minStock;

                return (
                  <TableRow
                    key={p.id}
                    hover
                    sx={{
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: "#fcfcfd",
                      },
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #f1f5f9",
                        py: 1.8,
                        verticalAlign: "top",
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.2} alignItems="flex-start">
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 3,
                            bgcolor: "#f3f4f6",
                            color: "#6b7280",
                          }}
                        >
                          <QrCode2RoundedIcon fontSize="small" />
                        </Avatar>

                        <Box minWidth={220}>
                          <Typography fontWeight={800} color="#111827">
                            {p.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            SKU: {p.sku}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Barcode: {p.barcode}
                          </Typography>
                          {p.supplier && (
                            <Typography variant="body2" color="text.secondary">
                              Supplier: {p.supplier}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={<CategoryRoundedIcon />}
                        label={p.category || "-"}
                        sx={{
                          borderRadius: 999,
                          fontWeight: 700,
                          bgcolor: "#f8fafc",
                          border: "1px solid #e5e7eb",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={<SellRoundedIcon />}
                        label={formatCurrency(p.price)}
                        sx={{
                          borderRadius: 999,
                          fontWeight: 800,
                          bgcolor: "#ecfeff",
                          color: "#0f172a",
                          border: "1px solid #bae6fd",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={<PaymentsRoundedIcon />}
                        label={formatCurrency(p.cost)}
                        sx={{
                          borderRadius: 999,
                          fontWeight: 700,
                          bgcolor: "#f8fafc",
                          color: "#111827",
                          border: "1px solid #e5e7eb",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.8}>
                        <Typography fontWeight={800} color="#111827">
                          {p.stockQty} {p.unit}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ขั้นต่ำ {p.minStock} {p.unit}
                        </Typography>
                        {isLowStock && (
                          <Chip
                            size="small"
                            label="สต๊อกใกล้หมด"
                            sx={{
                              width: "fit-content",
                              fontWeight: 800,
                              bgcolor: "#fff7ed",
                              color: "#c2410c",
                              border: "1px solid #fed7aa",
                            }}
                          />
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={p.status === "active" ? "ขายอยู่" : "งดขาย"}
                        sx={{
                          borderRadius: 999,
                          fontWeight: 800,
                          color: p.status === "active" ? "#166534" : "#991b1b",
                          bgcolor: p.status === "active" ? "#f0fdf4" : "#fef2f2",
                          border:
                            p.status === "active"
                              ? "1px solid #bbf7d0"
                              : "1px solid #fecaca",
                        }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <IconButton
                          onClick={() => increaseStockByBarcode(p.barcode, 1)}
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 3,
                            bgcolor: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            color: "#2563eb",
                            "&:hover": {
                              bgcolor: "#dbeafe",
                            },
                          }}
                        >
                          <AddCircleOutlineRoundedIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          onClick={() => openEdit(p)}
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 3,
                            bgcolor: "#eef2ff",
                            border: "1px solid #c7d2fe",
                            color: "#4f46e5",
                            "&:hover": {
                              bgcolor: "#e0e7ff",
                            },
                          }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          onClick={() => askDelete(p)}
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 3,
                            bgcolor: "#fef2f2",
                            border: "1px solid #fecaca",
                            color: "#ef4444",
                            "&:hover": {
                              bgcolor: "#fee2e2",
                            },
                          }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Stack spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: 4,
                          bgcolor: "#f3f4f6",
                          color: "#9ca3af",
                        }}
                      >
                        <Inventory2RoundedIcon sx={{ fontSize: 34 }} />
                      </Avatar>

                      <Typography variant="h6" fontWeight={800} color="#111827">
                        {products.length === 0 ? "ยังไม่มีสินค้าในระบบ" : "ไม่พบข้อมูลสินค้า"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {products.length === 0
                          ? "เริ่มต้นด้วยการเพิ่มสินค้าใหม่ แล้วใช้การยิงบาร์โค้ดเพิ่มจำนวน"
                          : "ลองค้นหาด้วยชื่อสินค้า บาร์โค้ด รหัสสินค้า หรือหมวดหมู่"}
                      </Typography>

                      {products.length === 0 && (
                        <Button
                          variant="contained"
                          startIcon={<AddRoundedIcon />}
                          onClick={openAdd}
                          sx={{
                            mt: 1,
                            borderRadius: 4,
                            px: 2.5,
                            py: 1.1,
                            textTransform: "none",
                            fontWeight: 800,
                            background:
                              "linear-gradient(135deg, #111827 0%, #000000 100%)",
                          }}
                        >
                          เพิ่มสินค้า
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <Dialog
        open={openForm}
        onClose={closeForm}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 6,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2.5,
            fontWeight: 900,
            background:
              "linear-gradient(135deg, #111827 0%, #1f2937 55%, #374151 100%)",
            color: "#fff",
          }}
        >
          {form.id === 0 ? "เพิ่มสินค้าใหม่" : "แก้ไขข้อมูลสินค้า"}
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.2} sx={{ mt: 1 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                background: "linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%)",
                border: "1px solid #dbeafe",
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 3,
                    bgcolor: "#dbeafe",
                    color: "#1d4ed8",
                  }}
                >
                  <ChecklistRoundedIcon fontSize="small" />
                </Avatar>

                <Box>
                  <Typography fontWeight={900} color="#111827" mb={0.6}>
                    แนวทางใช้งานสต๊อก
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    สินค้า 1 ชนิดควรมี 1 รายการในระบบเท่านั้น จากนั้นใช้เครื่องยิงบาร์โค้ดยิงซ้ำเพื่อเพิ่มจำนวนสินค้าในสต๊อก
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                border: "1px solid #e5e7eb",
                background: "#fff",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 3,
                    bgcolor: "#f3f4f6",
                    color: "#111827",
                  }}
                >
                  <InfoRoundedIcon fontSize="small" />
                </Avatar>
                <Typography fontWeight={900}>ข้อมูลหลักสินค้า</Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="บาร์โค้ด"
                    value={form.barcode}
                    onChange={(e) => updateForm("barcode", e.target.value)}
                    fullWidth
                    required
                    helperText="ใช้ยิงเพื่อเพิ่มสต๊อกและใช้ขายสินค้า"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="รหัสสินค้า (SKU)"
                    value={form.sku}
                    onChange={(e) => updateForm("sku", e.target.value)}
                    fullWidth
                    required
                    helperText="รหัสอ้างอิงสินค้าในระบบ"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="ชื่อสินค้า"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    fullWidth
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="หมวดหมู่"
                    value={form.category}
                    onChange={(e) => updateForm("category", e.target.value)}
                    fullWidth
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                  >
                    {categoryOptions.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="หน่วยสินค้า"
                    value={form.unit}
                    onChange={(e) => updateForm("unit", e.target.value)}
                    fullWidth
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                  >
                    {unitOptions.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                border: "1px solid #e5e7eb",
                background: "#fff",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 3,
                    bgcolor: "#f3f4f6",
                    color: "#111827",
                  }}
                >
                  <PaymentsRoundedIcon fontSize="small" />
                </Avatar>
                <Typography fontWeight={900}>ราคาและสต๊อก</Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="ราคาขาย"
                    type="number"
                    value={form.price}
                    onChange={(e) => updateForm("price", Number(e.target.value))}
                    fullWidth
                    required
                    helperText={
                      form.price > 0
                        ? `ราคาขาย: ${formatCurrency(form.price)}`
                        : "ราคาขายต้องมากกว่า 0"
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">บาท</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="ต้นทุน"
                    type="number"
                    value={form.cost}
                    onChange={(e) => updateForm("cost", Number(e.target.value))}
                    fullWidth
                    helperText={
                      form.cost > 0 ? `ต้นทุน: ${formatCurrency(form.cost)}` : "ใส่ 0 ได้"
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">บาท</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="จำนวนเริ่มต้นในสต๊อก"
                    type="number"
                    value={form.stockQty}
                    onChange={(e) => updateForm("stockQty", Number(e.target.value))}
                    fullWidth
                    required
                    helperText="เพิ่มสินค้าใหม่ครั้งแรกใส่จำนวนเริ่มต้นได้"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">{form.unit || "ชิ้น"}</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="สต๊อกขั้นต่ำ"
                    type="number"
                    value={form.minStock}
                    onChange={(e) => updateForm("minStock", Number(e.target.value))}
                    fullWidth
                    helperText="ถ้าต่ำกว่าหรือเท่าจะแจ้งว่าใกล้หมด"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">{form.unit || "ชิ้น"}</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="สถานะสินค้า"
                    value={form.status}
                    onChange={(e) =>
                      updateForm("status", e.target.value as Product["status"])
                    }
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                  >
                    {statusOptions.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                border: "1px solid #e5e7eb",
                background: "#fff",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 3,
                    bgcolor: "#f3f4f6",
                    color: "#111827",
                  }}
                >
                  <WarehouseRoundedIcon fontSize="small" />
                </Avatar>
                <Typography fontWeight={900}>ข้อมูลเสริม</Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="ผู้จำหน่าย"
                    value={form.supplier}
                    onChange={(e) => updateForm("supplier", e.target.value)}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalShippingRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="ตำแหน่งจัดเก็บ"
                    value={form.location}
                    onChange={(e) => updateForm("location", e.target.value)}
                    fullWidth
                    helperText="เช่น ชั้น A2 / ห้องเก็บของ"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InventoryRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="รายละเอียดสินค้า"
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    fullWidth
                    multiline
                    minRows={3}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 2,
            gap: 1,
            borderTop: "1px solid #e5e7eb",
            background: "#fff",
          }}
        >
          <Button
            onClick={closeForm}
            sx={{
              borderRadius: 3,
              px: 2.2,
              fontWeight: 700,
              textTransform: "none",
              color: "#374151",
            }}
          >
            ยกเลิก
          </Button>

          <Button
            variant="contained"
            onClick={saveProduct}
            sx={{
              borderRadius: 3,
              px: 2.8,
              fontWeight: 800,
              textTransform: "none",
              background: "#111827",
              "&:hover": {
                background: "#000",
              },
            }}
          >
            {form.id === 0 ? "บันทึกสินค้า" : "บันทึกการแก้ไข"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDelete}
        onClose={closeDelete}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 6,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2.5,
            fontWeight: 900,
            background: "linear-gradient(135deg, #fff7ed 0%, #fff1f2 100%)",
            color: "#9a3412",
            borderBottom: "1px solid #fed7aa",
          }}
        >
          ยืนยันการลบสินค้า
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.2} sx={{ mt: 0.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "#fff1f2",
                  color: "#ef4444",
                  borderRadius: 3,
                }}
              >
                <WarningAmberRoundedIcon />
              </Avatar>

              <Box>
                <Typography fontWeight={900} color="#111827" mb={0.5}>
                  คุณกำลังจะลบสินค้านี้ออกจากระบบ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เมื่อลบแล้ว รายการนี้จะหายจากหน้าจัดการสินค้า
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                border: "1px solid #fee2e2",
                background: "linear-gradient(180deg, #ffffff 0%, #fffafa 100%)",
              }}
            >
              <Stack direction="row" spacing={1.4} alignItems="flex-start">
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    bgcolor: "#fef2f2",
                    color: "#ef4444",
                  }}
                >
                  <Inventory2RoundedIcon />
                </Avatar>

                <Box flex={1}>
                  <Typography fontWeight={900} color="#111827">
                    {selectedProduct?.name || "-"}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1}>
                    <Chip
                      size="small"
                      label={`SKU: ${selectedProduct?.sku || "-"}`}
                      sx={{ borderRadius: 999, fontWeight: 700 }}
                    />
                    <Chip
                      size="small"
                      label={`Barcode: ${selectedProduct?.barcode || "-"}`}
                      sx={{ borderRadius: 999, fontWeight: 700 }}
                    />
                    <Chip
                      size="small"
                      label={`ราคา ${
                        selectedProduct ? formatCurrency(selectedProduct.price) : "-"
                      }`}
                      sx={{ borderRadius: 999, fontWeight: 700 }}
                    />
                    <Chip
                      size="small"
                      label={`สต๊อก ${selectedProduct?.stockQty ?? "-"} ${
                        selectedProduct?.unit || ""
                      }`}
                      sx={{ borderRadius: 999, fontWeight: 700 }}
                    />
                  </Stack>

                  <Grid container spacing={1.5} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        หมวดหมู่
                      </Typography>
                      <Typography fontWeight={700}>
                        {selectedProduct?.category || "-"}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        ผู้จำหน่าย
                      </Typography>
                      <Typography fontWeight={700}>
                        {selectedProduct?.supplier || "-"}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        ตำแหน่งจัดเก็บ
                      </Typography>
                      <Typography fontWeight={700}>
                        {selectedProduct?.location || "-"}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        สถานะ
                      </Typography>
                      <Typography fontWeight={700}>
                        {selectedProduct?.status === "active" ? "ขายอยู่" : "งดขาย"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </Box>

            <Box
              sx={{
                p: 1.6,
                borderRadius: 4,
                border: "1px solid #fed7aa",
                bgcolor: "#fff7ed",
              }}
            >
              <Typography fontSize={14} fontWeight={800} color="#9a3412">
                ตรวจสอบให้แน่ใจก่อนลบ โดยเฉพาะสินค้าที่กำลังขายอยู่หรือยังมีสต๊อกคงเหลือ
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 2,
            gap: 1,
            borderTop: "1px solid #f3f4f6",
            background: "#fff",
          }}
        >
          <Button
            onClick={closeDelete}
            sx={{
              borderRadius: 3,
              px: 2.4,
              fontWeight: 700,
              textTransform: "none",
              color: "#374151",
            }}
          >
            ยกเลิก
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            sx={{
              borderRadius: 3,
              px: 2.8,
              fontWeight: 800,
              textTransform: "none",
              boxShadow: "0 10px 20px rgba(239,68,68,0.18)",
            }}
          >
            ยืนยันการลบสินค้า
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={SlideDownTransition}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{
            width: "100%",
            minWidth: { xs: "calc(100vw - 24px)", sm: 420 },
            borderRadius: 3,
            fontWeight: 700,
            boxShadow: "0 16px 36px rgba(15, 23, 42, 0.18)",
            alignItems: "center",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}