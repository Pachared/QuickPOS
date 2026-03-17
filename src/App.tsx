import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Cart from "./components/Cart";

import POS from "./pages/POS";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";

export default function App() {
  const [cart, setCart] = useState<any[]>([]);

  const removeItem = (id: number) => {
    setCart(cart.filter((p) => p.id !== id));
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#EEEEEE"
      }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          ml: "120px",
          mr: "320px",
          p: 3,
        }}
      >
        <Routes>
          <Route path="/" element={<POS cart={cart} setCart={setCart} />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
      <Cart cart={cart} removeItem={removeItem} />
    </Box>
  );
}