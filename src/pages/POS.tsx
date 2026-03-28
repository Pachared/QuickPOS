import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  Button,
  useMediaQuery,
  InputAdornment,
  Paper,
  Avatar,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LocalMallRoundedIcon from "@mui/icons-material/LocalMallRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

import type { CartItem } from "../types/pos";
import { formatCurrency } from "../utils/format";

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

interface Props {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export default function POS({ cart, setCart }: Props) {
  const [barcode, setBarcode] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("ทั้งหมด");

  const isTablet = useMediaQuery("(max-width:1366px)");
  const isMobile = useMediaQuery("(max-width:768px)");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const mock: Product[] = [
      { id: 1, name: "เค้กช็อกโกแลต", price: 89, category: "เค้ก" },
      { id: 2, name: "ครัวซองต์", price: 45, category: "เบเกอรี่" },
      { id: 3, name: "ไอศกรีมวานิลลา", price: 69, category: "ไอศกรีม" },
      { id: 4, name: "แพนเค้กกล้วยหอม", price: 79, category: "แพนเค้ก" },
      { id: 5, name: "มัฟฟินวีแกน", price: 59, category: "วีแกน" },
      { id: 6, name: "เค้กสตรอว์เบอร์รี", price: 95, category: "เค้ก" },
      { id: 7, name: "เดนิช", price: 49, category: "เบเกอรี่" },
      { id: 8, name: "ไอศกรีมช็อกโกแลต", price: 75, category: "ไอศกรีม" },
      { id: 9, name: "แพนเค้กบลูเบอร์รี", price: 85, category: "แพนเค้ก" },
    ];

    setProducts(mock);
  };

  const addToCart = (product: Product) => {
    const exist = cart.find((p) => p.id === product.id);

    if (exist) {
      const updated = cart.map((item) =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      );
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          qty: 1,
        },
      ]);
    }
  };

  const scanProduct = async () => {
    if (!barcode.trim()) return;

    const found = products.find((p) => p.id.toString() === barcode.trim());

    if (!found) {
      alert("ไม่พบสินค้า");
      return;
    }

    addToCart(found);
    setBarcode("");
  };

  const categories = ["ทั้งหมด", "เค้ก", "เบเกอรี่", "ไอศกรีม", "แพนเค้ก", "วีแกน"];

  const filteredProducts =
    category === "ทั้งหมด"
      ? products
      : products.filter((product) => product.category === category);

  const displayProducts = isTablet
    ? filteredProducts.slice(0, 6)
    : filteredProducts.slice(0, 9);

  return (
    <Box
      sx={{
        minHeight: "100%",
      }}
    >
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
            <StorefrontRoundedIcon />
          </Avatar>

          <Box>
            <Typography variant="h5" fontWeight={800}>
              ขายสินค้า
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.82 }}>
              ระบบขายหน้าร้านสำหรับเพิ่มสินค้าเข้าตะกร้าอย่างรวดเร็ว
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 5,
          border: "1px solid #e5e7eb",
          background: "#fff",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          alignItems="stretch"
        >
          <TextField
            fullWidth
            size="medium"
            label="สแกนบาร์โค้ด / รหัสสินค้า"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && scanProduct()}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                backgroundColor: "#fafafa",
                "& fieldset": {
                  borderColor: "#d0d7de",
                },
                "&:hover fieldset": {
                  borderColor: "#9ca3af",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#111827",
                  borderWidth: "2px",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#111827",
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

          <Button
            variant="contained"
            onClick={scanProduct}
            startIcon={<QrCodeScannerRoundedIcon />}
            sx={{
              minWidth: isMobile ? "100%" : 170,
              borderRadius: 4,
              px: 3,
              fontWeight: 800,
              textTransform: "none",
              background: "linear-gradient(135deg, #111827 0%, #000000 100%)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.16)",
              "&:hover": {
                background: "linear-gradient(135deg, #000000 0%, #111827 100%)",
                transform: "translateY(-1px)",
              },
            }}
          >
            เพิ่มสินค้า
          </Button>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 5,
          border: "1px solid #e5e7eb",
          background: "#fff",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <Typography variant="subtitle1" fontWeight={800} mb={1.5}>
          หมวดหมู่สินค้า
        </Typography>

        <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap>
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <Chip
                key={cat}
                label={cat}
                clickable
                onClick={() => setCategory(cat)}
                sx={{
                  px: 0.8,
                  height: 38,
                  borderRadius: 999,
                  fontWeight: 700,
                  border: active ? "1px solid #111827" : "1px solid #e5e7eb",
                  background: active ? "#111827" : "#fff",
                  color: active ? "#fff" : "#374151",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: active ? "#000" : "#f9fafb",
                  },
                }}
              />
            );
          })}
        </Stack>
      </Paper>

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        }}
        gap={2}
      >
        {displayProducts.map((product) => (
          <Card
            key={product.id}
            onClick={() => addToCart(product)}
            sx={{
              p: 1.5,
              borderRadius: 5,
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
              cursor: "pointer",
              overflow: "hidden",
              background: "linear-gradient(180deg, #ffffff 0%, #fcfcfd 100%)",
              transition: "all 0.22s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 18px 34px rgba(15, 23, 42, 0.12)",
              },
            }}
          >
            <Box
              sx={{
                height: 180,
                borderRadius: 4,
                background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
                position: "relative",
              }}
            >
              <LocalMallRoundedIcon sx={{ fontSize: 54, color: "#9ca3af" }} />

              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  px: 1.2,
                  py: 0.5,
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#111827",
                  bgcolor: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                {product.category || "ทั่วไป"}
              </Box>
            </Box>

            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  color: "#111827",
                  fontSize: "1.05rem",
                  minHeight: 32,
                }}
              >
                {product.name}
              </Typography>

              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mt={1.5}
              >
                <Box>
                  <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.2 }}>
                    ราคา
                  </Typography>
                  <Typography
                    fontWeight={800}
                    sx={{
                      fontSize: "1.1rem",
                      color: "#111827",
                    }}
                  >
                    {formatCurrency(product.price)}
                  </Typography>
                </Box>

                <IconButton
                  size="medium"
                  sx={{
                    width: 46,
                    height: 46,
                    background: "linear-gradient(135deg, #111827 0%, #000 100%)",
                    color: "white",
                    boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #000 0%, #111827 100%)",
                      transform: "scale(1.05)",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                >
                  <AddRoundedIcon fontSize="medium" />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}