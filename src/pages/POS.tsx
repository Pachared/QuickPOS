import { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
} from "@mui/material";

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

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await window.api.getProducts();
    setProducts(data || []);
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

    const product = await window.api.getProduct(barcode);

    if (!product) {
      alert("Product not found");
      return;
    }

    addToCart(product);
    setBarcode("");
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <Typography variant="h5" fontWeight={700} className="mb-6">
        POS
      </Typography>

      {/* SCAN BARCODE */}
      <Card className="mb-6 max-w-xl">
        <CardContent>
          <div className="flex gap-3">
            <TextField
              fullWidth
              label="Scan Barcode"
              value={barcode}
              autoFocus
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") scanProduct();
              }}
            />

            <Button
              variant="contained"
              size="large"
              onClick={scanProduct}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => addToCart(product)}
            className="p-4 rounded-xl border border-gray-200 text-center cursor-pointer transition hover:scale-105 hover:shadow-md bg-white"
          >
            <Typography fontWeight={600}>
              {product.name}
            </Typography>

            <Typography className="text-gray-500 mt-1">
              ฿{product.price}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
}