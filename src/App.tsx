import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Cart from "./components/Cart";

import POS from "./pages/POS";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";

import type { CartItem, Order } from "./types/pos";

const CART_STORAGE_KEY = "quickpos_cart";
const ORDERS_STORAGE_KEY = "quickpos_orders";

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (error) {
      console.error("โหลดข้อมูลจาก localStorage ไม่สำเร็จ:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("บันทึก cart ไม่สำเร็จ:", error);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error("บันทึก orders ไม่สำเร็จ:", error);
    }
  }, [orders]);

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
        background: "linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)",
      }}
    >
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          ml: "40px",
          mr: "380px",
          p: 2,
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