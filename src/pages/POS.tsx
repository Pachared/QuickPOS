"use client";

import { useState, useEffect } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

declare global {
  interface Window {
    api: any;
  }
}

interface Props {
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function POS({ cart, setCart }: Props) {
  const [barcode, setBarcode] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState("All");

  // 📱 responsive breakpoint
  const isSmallScreen = useMediaQuery("(max-width:1366px)");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    // 🔥 mock data 9 items
    const mock = Array.from({ length: 9 }).map((_, i) => ({
      id: i + 1,
      name: `สินค้า ${i + 1}`,
      price: (Math.random() * 100 + 20).toFixed(0),
    }));

    setProducts(mock);
  };

  const addToCart = (product: any) => {
    const exist = cart.find((p) => p.id === product.id);

    if (exist) {
      exist.qty += 1;
      setCart([...cart]);
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const scanProduct = async () => {
    if (!barcode) return;

    // mock scan
    const found = products.find((p) => p.id.toString() === barcode);

    if (!found) {
      alert("Product not found");
      return;
    }

    addToCart(found);
    setBarcode("");
  };

  // 🎯 control จำนวน item
  const displayProducts = isSmallScreen
    ? products.slice(0, 6)
    : products.slice(0, 9);

  return (
    <Box p={2}>
      {/* HEADER */}
      <Typography variant="h5" fontWeight={700} mb={2}>
        ขายสินค้า
      </Typography>

      <Box mb={2} display="flex" gap={2}>
        <TextField
          fullWidth
          size="small"
          label="สแกนบาร์โค้ด"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && scanProduct()}
          sx={{
            flex: 10,

            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",

              "& fieldset": {
                borderColor: "#888",
              },

              "&:hover fieldset": {
                borderColor: "#999",
              },

              "&.Mui-focused fieldset": {
                borderColor: "#000",
                borderWidth: "2px",
              },
            },

            "& .MuiInputLabel-root.Mui-focused": {
              color: "#000",
            },
          }}
        />

        <Button
          variant="contained"
          onClick={scanProduct}
          sx={{
            flex: 1,
            borderRadius: 3,
            background: "#111",
          }}
        >
          ยืนยัน
        </Button>
      </Box>

      {/* CATEGORY */}
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        {["All", "Cakes", "Pastry", "Ice Cream", "Pancakes", "Vegan"].map(
          (cat) => (
            <Chip
              key={cat}
              label={cat}
              clickable
              color={category === cat ? "primary" : "default"}
              onClick={() => setCategory(cat)}
            />
          )
        )}
      </Stack>

      {/* PRODUCT GRID */}
      <Box
        display="grid"
        gridTemplateColumns={
          isSmallScreen ? "repeat(3, 1fr)" : "repeat(3, 1fr)"
        }
        gap={2}
      >
        {displayProducts.map((product) => (
          <Card
            key={product.id}
            sx={{
              padding: "16px",
              borderRadius: 5,
              boxShadow: "none",
              border: "1px solid #e5e7eb",
              cursor: "pointer",
              transition: "0.2s",
              "&:hover": {
                transform: "scale(1.01)",
              },
            }}
            onClick={() => addToCart(product)}
          >
            {/* IMAGE */}
            <Box
              sx={{
                height: 162,
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
              }}
            />

            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <Typography variant="h6" mt={1} fontWeight={600}>
                {product.name}
              </Typography>

              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mt={1}
              >
                <Typography fontWeight={600} color="text.secondary">
                  {product.price} บาท
                </Typography>

                <IconButton
                  size="medium"
                  sx={{
                    backgroundColor: "black",
                    color: "white",
                    "&:hover": { backgroundColor: "#333" },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                >
                  <AddIcon fontSize="medium" />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
