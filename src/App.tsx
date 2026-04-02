import { Box } from "@mui/material";
import { Routes, Route, useLocation } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Cart from "./components/Cart";

import POS from "./pages/POS";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";

import type { CartItem, Order } from "./types/pos";

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const location = useLocation();

  const isProductsPage = location.pathname === "/products";

  const loadOrders = useCallback(async () => {
    try {
      const rows = await window.pos.listOrders();
      setOrders(rows);
    } catch (error) {
      console.error("โหลด orders จากฐานข้อมูลไม่สำเร็จ:", error);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const removeItem = (id: number | string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCheckoutSuccess = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        height: "100dvh",
        background: "linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)",
        overflow: isProductsPage ? "hidden" : "auto",
      }}
    >
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          ml: "20px",
          mr: "380px",
          p: 2,
          minWidth: 0,
          minHeight: 0,
          height: isProductsPage ? "100dvh" : "auto",
          overflow: isProductsPage ? "hidden" : "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Routes>
          <Route path="/" element={<POS cart={cart} setCart={setCart} />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders orders={orders} />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>

      <Cart
        cart={cart}
        removeItem={removeItem}
        clearCart={clearCart}
        onCheckoutSuccess={handleCheckoutSuccess}
      />
    </Box>
  );
}