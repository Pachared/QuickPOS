import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

declare global {
  interface Window {
    api: any;
  }
}

export default function POS() {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<any[]>([]);

  const scanProduct = async () => {
    const product = await window.api.getProduct(barcode);

    if (!product) {
      alert("Product not found");
      return;
    }

    const exist = cart.find((p) => p.id === product.id);

    if (exist) {
      exist.qty += 1;
      setCart([...cart]);
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }

    setBarcode("");
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const pay = async () => {
    await window.api.createOrder(cart);

    alert("Payment success");

    setCart([]);
  };

  return (
    <Box>
      <Typography variant="h5">QuickPOS</Typography>

      <Box sx={{ mt: 2 }}>
        <TextField
          label="Scan Barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
        />

        <Button variant="contained" sx={{ ml: 2 }} onClick={scanProduct}>
          Add
        </Button>
      </Box>

      <List sx={{ mt: 3 }}>
        {cart.map((item) => (
          <ListItem key={item.id}>
            <ListItemText
              primary={`${item.name} x${item.qty}`}
              secondary={`฿${item.price}`}
            />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6">Total: ฿{total}</Typography>

      <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={pay}>
        Pay
      </Button>
    </Box>
  );
}
