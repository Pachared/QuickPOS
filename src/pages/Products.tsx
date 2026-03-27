"use client";

import { useMemo, useState } from "react";
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
} from "@mui/material";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

interface Product {
  id: number;
  name: string;
  price: number;
  barcode: string;
}

const emptyForm: Product = {
  id: 0,
  name: "",
  price: 0,
  barcode: "",
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [form, setForm] = useState<Product>(emptyForm);

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

  const saveProduct = () => {
    if (!form.barcode.trim()) {
      alert("กรุณากรอกบาร์โค้ด");
      return;
    }

    if (!form.name.trim()) {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }

    if (form.price < 0) {
      alert("ราคาสินค้าไม่ถูกต้อง");
      return;
    }

    if (form.id === 0) {
      setProducts((prev) => [
        ...prev,
        {
          ...form,
          id: Date.now(),
        },
      ]);
    } else {
      setProducts((prev) => prev.map((p) => (p.id === form.id ? form : p)));
    }

    setOpenForm(false);
    setForm(emptyForm);
  };

  const confirmDelete = () => {
    if (!selectedProduct) return;

    setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
    setOpenDelete(false);
    setSelectedProduct(null);
  };

  const filteredProducts = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return products;

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        String(p.price).includes(q)
    );
  }, [products, keyword]);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: "100%",
        background: "linear-gradient(180deg, #fafafa 0%, #f4f6f8 100%)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          p: { xs: 2.25, md: 3 },
          borderRadius: 5,
          background:
            "linear-gradient(135deg, #111827 0%, #1f2937 55%, #374151 100%)",
          color: "#fff",
          boxShadow: "0 18px 34px rgba(15, 23, 42, 0.14)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <Inventory2RoundedIcon />
            </Avatar>

            <Box>
              <Typography variant="h5" fontWeight={800}>
                จัดการสินค้า
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.82 }}>
                เพิ่ม แก้ไข และลบข้อมูลสินค้าในระบบ
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.2} alignItems="center">
            <Chip
              label={`${products.length} รายการ`}
              sx={{
                borderRadius: 999,
                fontWeight: 700,
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            />

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openAdd}
              sx={{
                borderRadius: 4,
                px: 2.2,
                py: 1.2,
                fontWeight: 800,
                textTransform: "none",
                color: "#111827",
                background: "#fff",
                boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
                "&:hover": {
                  background: "#f9fafb",
                },
              }}
            >
              เพิ่มสินค้า
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Search */}
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
      </Paper>

      {/* Table */}
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
            ตรวจสอบข้อมูลสินค้า แก้ไขรายละเอียด หรือจัดการรายการจากตารางนี้
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
                  },
                }}
              >
                <TableCell>บาร์โค้ด</TableCell>
                <TableCell>ชื่อสินค้า</TableCell>
                <TableCell>ราคา</TableCell>
                <TableCell width={160} align="center">
                  จัดการ
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredProducts.map((p) => (
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
                    },
                  }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 3,
                          bgcolor: "#f3f4f6",
                          color: "#6b7280",
                        }}
                      >
                        <QrCode2RoundedIcon fontSize="small" />
                      </Avatar>
                      <Typography fontWeight={700} color="#111827">
                        {p.barcode}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700} color="#111827">
                      {p.name}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={<SellRoundedIcon />}
                      label={`฿${p.price.toLocaleString()}`}
                      sx={{
                        borderRadius: 999,
                        fontWeight: 800,
                        bgcolor: "#f3f4f6",
                        color: "#111827",
                        border: "1px solid #e5e7eb",
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
                        onClick={() => openEdit(p)}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 3,
                          bgcolor: "#eff6ff",
                          border: "1px solid #dbeafe",
                          color: "#2563eb",
                          "&:hover": {
                            bgcolor: "#dbeafe",
                          },
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
              ))}

              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
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
                          ? "เริ่มต้นด้วยการเพิ่มสินค้าใหม่เข้าสู่ระบบ"
                          : "ลองค้นหาด้วยชื่อสินค้า บาร์โค้ด หรือราคา"}
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

      {/* Dialog เพิ่ม/แก้ไขสินค้า */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
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
            background:
              "linear-gradient(135deg, #111827 0%, #1f2937 55%, #374151 100%)",
            color: "#fff",
          }}
        >
          {form.id === 0 ? "เพิ่มสินค้า" : "แก้ไขสินค้า"}
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.2} sx={{ mt: 1 }}>
            <TextField
              label="บาร์โค้ด"
              value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 4,
                },
              }}
            />

            <TextField
              label="ชื่อสินค้า"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 4,
                },
              }}
            />

            <TextField
              label="ราคา"
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: Number(e.target.value),
                })
              }
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 4,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">฿</InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenForm(false)}
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
              px: 2.5,
              fontWeight: 800,
              textTransform: "none",
              background: "#111827",
              "&:hover": {
                background: "#000",
              },
            }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog ยืนยันลบ */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        fullWidth
        maxWidth="xs"
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
            background: "#fff7ed",
            color: "#9a3412",
            borderBottom: "1px solid #fed7aa",
          }}
        >
          ยืนยันการลบสินค้า
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Avatar
              sx={{
                bgcolor: "#fff1f2",
                color: "#ef4444",
                borderRadius: 3,
              }}
            >
              <WarningAmberRoundedIcon />
            </Avatar>

            <Box>
              <Typography fontWeight={800} color="#111827" mb={0.5}>
                ต้องการลบสินค้านี้ใช่หรือไม่
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedProduct?.name || "-"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                บาร์โค้ด: {selectedProduct?.barcode || "-"}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenDelete(false)}
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
            color="error"
            onClick={confirmDelete}
            sx={{
              borderRadius: 3,
              px: 2.5,
              fontWeight: 800,
              textTransform: "none",
            }}
          >
            ลบสินค้า
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}