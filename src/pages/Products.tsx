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
  Snackbar,
  Alert,
  Slide,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import type { AlertColor, SlideProps } from "@mui/material";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";

import { formatCurrency } from "../utils/format";
import {
  posApi,
  type Product as ApiProduct,
  type ProductPayload,
} from "../lib/posApi";

type Product = ApiProduct;
type StockFilter = "all" | "low" | "out";

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
  createdAt: "",
  updatedAt: "",
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
  return (
    <Slide
      {...props}
      direction="down"
      timeout={{ enter: 260, exit: 180 }}
    />
  );
}

function generateSku(category?: string) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const prefixMap: Record<string, string> = {
    เครื่องดื่ม: "DRK",
    อาหาร: "FOD",
    ของใช้: "GEN",
    เครื่องเขียน: "STN",
    สินค้าเบ็ดเตล็ด: "MSC",
  };

  const prefix = prefixMap[category || ""] || "PRD";
  return `${prefix}-${code}`;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Product>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [scanBarcode, setScanBarcode] = useState("");
  const scanInputRef = useRef<HTMLInputElement | null>(null);
  const formBarcodeInputRef = useRef<HTMLInputElement | null>(null);
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

  const focusFormBarcodeInput = () => {
    requestAnimationFrame(() => {
      formBarcodeInputRef.current?.focus();
      formBarcodeInputRef.current?.select?.();
    });
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const rows = await posApi.listProducts();
      setProducts(rows);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "โหลดข้อมูลสินค้าไม่สำเร็จ";
      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
    focusScanInput();
  }, []);

  useEffect(() => {
    if (openForm) {
      focusFormBarcodeInput();
    }
  }, [openForm]);

  const openAdd = () => {
    setForm({
      ...emptyForm,
      sku: generateSku(),
    });
    setOpenForm(true);
  };

  const openEdit = (product: Product) => {
    setForm({
      ...emptyForm,
      ...product,
      sku: product.sku?.trim() ? product.sku : generateSku(),
    });
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

  const increaseStockByBarcode = async (barcodeValue: string, amount = 1) => {
    const trimmed = barcodeValue.trim();
    if (!trimmed) return;

    try {
      const updated = await posApi.increaseStockByBarcode(trimmed, amount);

      setProducts((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );

      setScanBarcode("");
      showSnackbar(
        `เพิ่มจำนวนสินค้า ${updated.name} +${amount} ${updated.unit}`,
        "success"
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "ไม่พบบาร์โค้ดนี้ในระบบ กรุณาเพิ่มสินค้าใหม่ก่อน";

      setScanBarcode("");
      showSnackbar(message, "warning");
    } finally {
      focusScanInput();
    }
  };

  useEffect(() => {
    const trimmed = scanBarcode.trim();
    if (!trimmed) return;

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    scanTimeoutRef.current = setTimeout(() => {
      void increaseStockByBarcode(trimmed, 1);
    }, 150);

    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [scanBarcode]);

  const saveProduct = async () => {
    if (!form.barcode.trim()) {
      showSnackbar("กรุณากรอกบาร์โค้ดสินค้า", "warning");
      return;
    }
    if (!form.sku.trim()) {
      showSnackbar("ไม่สามารถสร้างรหัสสินค้าอัตโนมัติได้", "warning");
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

    const normalized: ProductPayload = {
      barcode: form.barcode.trim(),
      sku: form.sku.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      unit: form.unit.trim(),
      price: Number(form.price),
      cost: Number(form.cost),
      stockQty: Number(form.stockQty),
      minStock: Number(form.minStock),
      supplier: form.supplier.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      status: form.status,
    };

    try {
      setSaving(true);

      if (form.id === 0) {
        const created = await posApi.createProduct(normalized);
        setProducts((prev) => [created, ...prev]);
        showSnackbar("เพิ่มสินค้าใหม่เข้าระบบเรียบร้อย", "success");
      } else {
        const updated = await posApi.updateProduct(form.id, normalized);
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        showSnackbar("แก้ไขสินค้าเรียบร้อย", "success");
      }

      closeForm();
      focusScanInput();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "บันทึกสินค้าไม่สำเร็จ";
      showSnackbar(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      await posApi.deleteProduct(selectedProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      showSnackbar(`ลบสินค้า "${selectedProduct.name}" เรียบร้อย`, "success");
      closeDelete();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ลบสินค้าไม่สำเร็จ";
      showSnackbar(message, "error");
    }
  };

  const totalStock = useMemo(
    () => products.reduce((sum, item) => sum + item.stockQty, 0),
    [products]
  );

  const outOfStockCount = useMemo(
    () => products.filter((item) => item.stockQty <= 0).length,
    [products]
  );

  const lowStockCount = useMemo(
    () =>
      products.filter(
        (item) => item.stockQty > 0 && item.stockQty <= item.minStock
      ).length,
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    let rows = products;

    if (stockFilter === "low") {
      rows = rows.filter((p) => p.stockQty > 0 && p.stockQty <= p.minStock);
    } else if (stockFilter === "out") {
      rows = rows.filter((p) => p.stockQty <= 0);
    }

    if (!q) return rows;

    return rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        String(p.price).includes(q)
    );
  }, [products, keyword, stockFilter]);

  const tableTitleText =
    stockFilter === "all"
      ? "แสดงข้อมูลสินค้าแบบย่อและเลื่อนดูเฉพาะในตาราง"
      : stockFilter === "low"
      ? "กำลังแสดงสินค้าใกล้หมด"
      : "กำลังแสดงสินค้าหมดสต๊อก";

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          mb: 2,
          p: 3,
          borderRadius: "25px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #18253c 45%, #344256 100%)",
          color: "#fff",
          flexShrink: 0,
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
            sx={{ minWidth: 0, flex: 1 }}
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
                เพิ่มสินค้า 1 ครั้ง แล้วสแกนเพิ่มสต๊อก
              </Typography>
            </Box>
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
      </Box>

      <Paper
        elevation={0}
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 5,
          border: "1px solid #e5e7eb",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <TextField
              fullWidth
              placeholder="ค้นหาด้วยชื่อสินค้า บาร์โค้ด หรือราคา"
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
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 5,
          border: "1px solid #e5e7eb",
          background: "#fff",
          minHeight: 0,
          flex: 1,
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.8,
            background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
            borderBottom: "1px solid #eef2f7",
            flexShrink: 0,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{
              minWidth: 0,
              flexWrap: "nowrap",
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography fontSize={18} fontWeight={800} color="#111827" noWrap>
                รายการสินค้าในระบบ
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {tableTitleText}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="flex-end"
              sx={{
                flexShrink: 0,
                flexWrap: "nowrap",
                whiteSpace: "nowrap",
              }}
            >
              {loading && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mr: 0.5 }}
                >
                  <CircularProgress size={16} />
                </Stack>
              )}

              <Chip
                clickable
                label={`${products.length} รายการ`}
                onClick={() => setStockFilter("all")}
                sx={{
                  height: 34,
                  borderRadius: 999,
                  fontWeight: 800,
                  bgcolor: stockFilter === "all" ? "#e2e8f0" : "#f8fafc",
                  color: "#0f172a",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
              />

              <Chip
                label={`สต๊อกรวม ${totalStock}`}
                sx={{
                  height: 34,
                  borderRadius: 999,
                  fontWeight: 800,
                  bgcolor: "#f8fafc",
                  color: "#0f172a",
                  border: "1px solid #e2e8f0",
                }}
              />

              <Chip
                clickable
                label={`ใกล้หมด ${lowStockCount}`}
                onClick={() => setStockFilter("low")}
                sx={{
                  height: 34,
                  borderRadius: 999,
                  fontWeight: 800,
                  color: "#c2410c",
                  bgcolor: stockFilter === "low" ? "#fed7aa" : "#fff7ed",
                  border: "1px solid #fed7aa",
                  cursor: "pointer",
                }}
              />

              <Chip
                clickable
                label={`หมด ${outOfStockCount}`}
                onClick={() => setStockFilter("out")}
                sx={{
                  height: 34,
                  borderRadius: 999,
                  fontWeight: 800,
                  color: "#991b1b",
                  bgcolor: stockFilter === "out" ? "#fecaca" : "#fef2f2",
                  border: "1px solid #fecaca",
                  cursor: "pointer",
                }}
              />
            </Stack>
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
          }}
        >
          <Table
            stickyHeader
            sx={{
              width: "100%",
              tableLayout: "fixed",
              minWidth: 0,
              "& .MuiTableCell-root": {
                overflow: "hidden",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  "& .MuiTableCell-root": {
                    background: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                    fontWeight: 800,
                    color: "#374151",
                    py: 1.6,
                    whiteSpace: "nowrap",
                    textAlign: "left",
                  },
                }}
              >
                <TableCell sx={{ width: "38%" }}>ชื่อสินค้า</TableCell>
                <TableCell sx={{ width: "24%" }}>Barcode</TableCell>
                <TableCell sx={{ width: "16%" }}>ราคาขาย</TableCell>
                <TableCell sx={{ width: "12%" }}>สต๊อก</TableCell>
                <TableCell sx={{ width: "20%" }} align="left">
                  จัดการ
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stockQty <= 0;
                const isLowStock = !isOutOfStock && p.stockQty <= p.minStock;

                return (
                  <TableRow
                    key={p.id}
                    hover
                    sx={{
                      backgroundColor: isOutOfStock
                        ? "#fef2f2"
                        : isLowStock
                        ? "#fff7ed"
                        : "transparent",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: isOutOfStock
                          ? "#fee2e2"
                          : isLowStock
                          ? "#ffedd5"
                          : "#fcfcfd",
                      },
                      "& .MuiTableCell-root": {
                        backgroundColor: "inherit",
                        borderBottom: "1px solid #f1f5f9",
                        py: 1.4,
                        verticalAlign: "middle",
                        textAlign: "left",
                      },
                    }}
                  >
                    <TableCell sx={{ minWidth: 0 }}>
                      <Typography
                        fontWeight={800}
                        color="#111827"
                        noWrap
                        title={p.name}
                        sx={{ textAlign: "left" }}
                      >
                        {p.name}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        title={p.barcode}
                        sx={{ textAlign: "left", fontWeight: 600 }}
                      >
                        {p.barcode}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        fontWeight={700}
                        color="#111827"
                        noWrap
                        sx={{ textAlign: "left" }}
                      >
                        {formatCurrency(p.price)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        fontWeight={800}
                        noWrap
                        sx={{
                          textAlign: "left",
                          color: isOutOfStock
                            ? "#991b1b"
                            : isLowStock
                            ? "#c2410c"
                            : "#111827",
                        }}
                      >
                        {p.stockQty} {p.unit}
                      </Typography>
                    </TableCell>

                    <TableCell align="left">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-start"
                        alignItems="center"
                        flexWrap="nowrap"
                      >
                        <IconButton
                          onClick={() => openEdit(p)}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 3,
                            color: "#4338ca",
                            backgroundColor: "#eef2ff",
                            border: "1px solid #c7d2fe",
                            boxShadow: "0 4px 10px rgba(79,70,229,0.12)",
                            "&:hover": {
                              backgroundColor: "#e0e7ff",
                              transform: "translateY(-1px)",
                            },
                            transition: "all 0.18s ease",
                          }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          onClick={() => askDelete(p)}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 3,
                            color: "#dc2626",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            boxShadow: "0 4px 10px rgba(239,68,68,0.12)",
                            "&:hover": {
                              backgroundColor: "#fee2e2",
                              transform: "translateY(-1px)",
                            },
                            transition: "all 0.18s ease",
                          }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!loading && filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
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
                        {products.length === 0
                          ? "ยังไม่มีสินค้าในระบบ"
                          : "ไม่พบข้อมูลสินค้า"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {products.length === 0
                          ? "เริ่มต้นด้วยการเพิ่มสินค้าใหม่"
                          : "ลองค้นหาด้วยชื่อสินค้า หรือบาร์โค้ด"}
                      </Typography>

                      {products.length === 0 && (
                        <Button
                          variant="contained"
                          onClick={openAdd}
                          sx={{
                            mt: 1,
                            borderRadius: 3,
                            px: 2.5,
                            py: 1,
                            textTransform: "none",
                            fontWeight: 800,
                            boxShadow: "none",
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
        onClose={saving ? undefined : closeForm}
        fullWidth
        maxWidth="md"
        keepMounted
        TransitionComponent={SlideDownTransition}
        transitionDuration={{ appear: 260, enter: 260, exit: 180 }}
        sx={{
          "& .MuiDialog-container": {
            justifyContent: "center",
            alignItems: "flex-start",
            pt: { xs: 6, sm: 8, md: 10 },
          },
        }}
        BackdropProps={{
          timeout: 260,
          sx: {
            background:
              "linear-gradient(180deg, rgba(2,6,23,0.25) 0%, rgba(15,23,42,0.40) 100%)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          },
        }}
        PaperProps={{
          sx: {
            m: 0,
            width: "100%",
            borderRadius: 6,
            overflow: "hidden",
            background: "rgba(255,255,255,0.90)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 30px 80px rgba(15,23,42,0.25)",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2.5,
            fontWeight: 900,
            background:
              "linear-gradient(135deg, rgba(17,24,39,0.96) 0%, rgba(31,41,55,0.94) 55%, rgba(55,65,81,0.92) 100%)",
            color: "#fff",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          {form.id === 0 ? "เพิ่มสินค้าใหม่" : "แก้ไขข้อมูลสินค้า"}
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
            background:
              "linear-gradient(180deg, rgba(248,250,252,0.72) 0%, rgba(255,255,255,0.85) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
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
                    สินค้า 1 ชนิดควรมี 1 รายการในระบบเท่านั้น
                    จากนั้นใช้เครื่องยิงบาร์โค้ดยิงซ้ำเพื่อเพิ่มจำนวนสินค้าในสต๊อก
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                border: "1px solid #e5e7eb",
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <Typography fontWeight={900} mb={2}>
                ข้อมูลหลักสินค้า
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    inputRef={formBarcodeInputRef}
                    label="บาร์โค้ด"
                    value={form.barcode}
                    onChange={(e) => updateForm("barcode", e.target.value)}
                    fullWidth
                    required
                    helperText="ใช้ยิงเพื่อเพิ่มสต๊อกและใช้ขายสินค้า"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="รหัสสินค้า (SKU)"
                    value={form.sku}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    helperText="ระบบสร้างให้อัตโนมัติ"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="ชื่อสินค้า"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    fullWidth
                    required
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
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
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
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
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
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
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <Typography fontWeight={900} mb={2}>
                ราคาและสต๊อก
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="ราคาขาย"
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      updateForm("price", Number(e.target.value))
                    }
                    fullWidth
                    required
                    helperText={
                      form.price > 0
                        ? `ราคาขาย: ${formatCurrency(form.price)}`
                        : "ราคาขายต้องมากกว่า 0"
                    }
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">บาท</InputAdornment>
                      ),
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
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">บาท</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="จำนวนสต๊อก"
                    type="number"
                    value={form.stockQty}
                    onChange={(e) =>
                      updateForm("stockQty", Number(e.target.value))
                    }
                    fullWidth
                    required
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="สต๊อกขั้นต่ำ"
                    type="number"
                    value={form.minStock}
                    onChange={(e) =>
                      updateForm("minStock", Number(e.target.value))
                    }
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    label="สถานะสินค้า"
                    value={form.status}
                    onChange={(e) =>
                      updateForm(
                        "status",
                        e.target.value as Product["status"]
                      )
                    }
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
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
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.2,
            borderTop: "1px solid rgba(241,245,249,0.85)",
            background:
              "linear-gradient(180deg, rgba(248,250,252,0.70) 0%, rgba(255,255,255,0.84) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <Button
            onClick={closeForm}
            disabled={saving}
            variant="outlined"
            sx={{
              borderRadius: 3,
              px: 2.2,
              textTransform: "none",
              fontWeight: 700,
              color: "#475569",
              borderColor: "#cbd5e1",
              "&:hover": {
                borderColor: "#94a3b8",
                backgroundColor: "#f8fafc",
              },
            }}
          >
            ยกเลิก
          </Button>

          <Button
            variant="contained"
            onClick={saveProduct}
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={16} color="inherit" /> : undefined
            }
            sx={{
              borderRadius: 3,
              px: 2.5,
              textTransform: "none",
              fontWeight: 800,
              boxShadow: "none",
            }}
          >
            {saving
              ? "กำลังบันทึก..."
              : form.id === 0
              ? "บันทึกสินค้า"
              : "บันทึกการแก้ไข"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDelete}
        onClose={closeDelete}
        fullWidth
        maxWidth="xs"
        TransitionComponent={SlideDownTransition}
        keepMounted
        sx={{
          "& .MuiDialog-container": {
            justifyContent: "center",
            alignItems: "flex-start",
            pt: { xs: 8, sm: 10 },
          },
        }}
        PaperProps={{
          sx: {
            m: 0,
            width: "100%",
            borderRadius: 5,
            overflow: "hidden",
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.55)",
          },
        }}
        BackdropProps={{
          sx: {
            background: "rgba(15,23,42,0.28)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          ยืนยันการลบสินค้า
        </DialogTitle>

        <DialogContent>
          <Stack direction="row" spacing={1.2} alignItems="flex-start">
            <Avatar
              sx={{
                bgcolor: "#fff7ed",
                color: "#f97316",
              }}
            >
              <DeleteOutlineRoundedIcon />
            </Avatar>

            <Box>
              <Typography fontWeight={800} color="#111827" mb={0.6}>
                ต้องการลบสินค้านี้ใช่หรือไม่
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedProduct
                  ? `สินค้า "${selectedProduct.name}" จะถูกลบออกจากระบบ และไม่สามารถกู้คืนได้`
                  : "ข้อมูลสินค้านี้จะถูกลบออกจากระบบ"}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.2 }}>
          <Button
            onClick={closeDelete}
            sx={{
              borderRadius: 3,
              px: 2.2,
              textTransform: "none",
              fontWeight: 700,
              color: "#475569",
            }}
          >
            ยกเลิก
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            startIcon={<DeleteOutlineRoundedIcon />}
            sx={{
              borderRadius: 3,
              px: 2.5,
              textTransform: "none",
              fontWeight: 800,
              boxShadow: "none",
            }}
          >
            ลบสินค้า
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
          sx={{ width: "100%", borderRadius: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}