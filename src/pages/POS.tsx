import { useEffect, useRef, useState } from "react";
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
  Snackbar,
  Alert,
  Slide,
} from "@mui/material";
import type { AlertColor, SlideProps } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
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
  barcode?: string;
}

interface Props {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

function SlideDownTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

export default function POS({ cart, setCart }: Props) {
  const [barcode, setBarcode] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("ทั้งหมด");
  const barcodeRef = useRef<HTMLInputElement | null>(null);
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

  const isTablet = useMediaQuery("(max-width:1366px)");
  const isMobile = useMediaQuery("(max-width:768px)");

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

  const focusBarcodeInput = () => {
    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
      barcodeRef.current?.select?.();
    });
  };

  useEffect(() => {
    loadProducts();

    setTimeout(() => {
      barcodeRef.current?.focus();
    }, 120);
  }, []);

  useEffect(() => {
    const trimmed = barcode.trim();

    if (!trimmed) return;

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    scanTimeoutRef.current = setTimeout(() => {
      scanProduct(trimmed);
    }, 150);

    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [barcode, products]);

  const loadProducts = async () => {
    const mock: Product[] = [
      {
        id: 1,
        name: "เค้กช็อกโกแลต",
        price: 89,
        category: "เค้ก",
        barcode: "1001",
      },
      {
        id: 2,
        name: "ครัวซองต์",
        price: 45,
        category: "เบเกอรี่",
        barcode: "1002",
      },
      {
        id: 3,
        name: "ไอศกรีมวานิลลา",
        price: 69,
        category: "ไอศกรีม",
        barcode: "1003",
      },
      {
        id: 4,
        name: "แพนเค้กกล้วยหอม",
        price: 79,
        category: "แพนเค้ก",
        barcode: "1004",
      },
      {
        id: 5,
        name: "มัฟฟินวีแกน",
        price: 59,
        category: "วีแกน",
        barcode: "1005",
      },
      {
        id: 6,
        name: "เค้กสตรอว์เบอร์รี",
        price: 95,
        category: "เค้ก",
        barcode: "1006",
      },
      {
        id: 7,
        name: "เดนิช",
        price: 49,
        category: "เบเกอรี่",
        barcode: "1007",
      },
      {
        id: 8,
        name: "ไอศกรีมช็อกโกแลต",
        price: 75,
        category: "ไอศกรีม",
        barcode: "1008",
      },
      {
        id: 9,
        name: "แพนเค้กบลูเบอร์รี",
        price: 85,
        category: "แพนเค้ก",
        barcode: "1009",
      },
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

  const scanProduct = (rawValue?: string) => {
    const code = (rawValue ?? barcode).trim();

    if (!code) return;

    const found = products.find(
      (p) => p.barcode?.trim() === code || p.id.toString() === code
    );

    if (!found) {
      setBarcode("");
      showSnackbar("ไม่พบสินค้า", "warning");
      focusBarcodeInput();
      return;
    }

    addToCart(found);
    setBarcode("");
    showSnackbar(`เพิ่ม ${found.name} ลงตะกร้าแล้ว`, "success");

    setTimeout(() => {
      barcodeRef.current?.focus();
      barcodeRef.current?.select?.();
    }, 50);
  };

  const categories = [
    "ทั้งหมด",
    "เค้ก",
    "เบเกอรี่",
    "ไอศกรีม",
    "แพนเค้ก",
    "วีแกน",
  ];

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
        px: { xs: 0, md: 0 },
        pt: 0,
        pb: { xs: 4, md: 6 },
      }}
    >
      <Box
        sx={{
          mb: 2,
          p: { xs: 2.25, md: 3 },
          borderRadius: "25px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #18253c 45%, #344256 100%)",
          color: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 10,
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
          mb: 2,
          p: 2,
          borderRadius: 5,
          border: "1px solid #e5e7eb",
          background: "#fff",
        }}
      >
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          alignItems={{ xs: "stretch", md: "flex-start" }}
        >
          <TextField
            inputRef={barcodeRef}
            fullWidth
            size="medium"
            label="สแกนบาร์โค้ด / รหัสสินค้า"
            placeholder="ยิงบาร์โค้ดได้ทันที"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            autoFocus
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
                  <QrCodeScannerRoundedIcon sx={{ color: "#2563eb" }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            onClick={() => scanProduct()}
            startIcon={<QrCodeScannerRoundedIcon />}
            sx={{
              minWidth: isMobile ? "100%" : 190,
              height: 56,
              borderRadius: 4,
              px: 3,
              alignSelf: "stretch",
              fontWeight: 800,
              textTransform: "none",
              whiteSpace: "nowrap",
              background: "linear-gradient(135deg, #111827 0%, #000000 100%)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.16)",
              "&:hover": {
                background: "linear-gradient(135deg, #000000 0%, #111827 100%)",
                transform: "translateY(-1px)",
              },
            }}
          >
            สแกนเข้าตะกร้า
          </Button>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 5,
          border: "1px solid #e5e7eb",
          background: "#fff",
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
                  <Typography
                    variant="body2"
                    sx={{ color: "#6b7280", mb: 0.2 }}
                  >
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
                    background:
                      "linear-gradient(135deg, #111827 0%, #000 100%)",
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
                    focusBarcodeInput();
                  }}
                >
                  <AddRoundedIcon fontSize="medium" />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ height: { md: 16 } }} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={1800}
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
            minWidth: { xs: "calc(100vw - 24px)", sm: 360 },
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
