import { Box } from "@mui/material";
import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";

import AppNavigation from "./components/app-navigation";
import PosCartPanel from "./components/pos-cart-panel";

const PosScreen = lazy(() => import("./pages/pos-screen"));
const ProductCatalogScreen = lazy(() => import("./pages/product-catalog-screen"));
const SalesHistoryScreen = lazy(() => import("./pages/sales-history-screen"));
const AppSettingsScreen = lazy(() => import("./pages/app-settings-screen"));

import type { CartItem, Order } from "./types/pos-models";

export default function AppShell() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const location = useLocation();

  const isProductsPage = location.pathname === "/products";
  const isPosPage = location.pathname === "/";

  const loadOrders = useCallback(async () => {
    try {
      const rows = await window.pos.listOrders();
      setOrders(rows);
    } catch (error) {
      console.error("โหลด orders จากฐานข้อมูลไม่สำเร็จ:", error);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
    }, 0);
    return () => window.clearTimeout(timer);
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
      <AppNavigation />

      <Box
        sx={{
          flexGrow: 1,
          ml: "20px",
          mr: isPosPage ? "380px" : 2,
          p: 2,
          minWidth: 0,
          minHeight: 0,
          height: isProductsPage ? "100dvh" : "auto",
          overflow: isProductsPage ? "hidden" : "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Suspense fallback={<Box flexGrow={1} />}>
          <Routes>
            <Route path="/" element={<PosScreen cart={cart} setCart={setCart} />} />
            <Route path="/products" element={<ProductCatalogScreen />} />
            <Route path="/orders" element={<SalesHistoryScreen orders={orders} />} />
            <Route path="/settings" element={<AppSettingsScreen />} />
          </Routes>
        </Suspense>
      </Box>

      {isPosPage ? (
        <PosCartPanel
          cart={cart}
          removeItem={removeItem}
          clearCart={clearCart}
          onCheckoutSuccess={handleCheckoutSuccess}
        />
      ) : null}
    </Box>
  );
}
