"use client";

import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  Toolbar,
  Box,
  Typography,
  Divider,
  Tooltip,
} from "@mui/material";

import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SettingsIcon from "@mui/icons-material/Settings";

import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 100;

const mainMenu = [
  { name: "POS", path: "/", icon: <PointOfSaleIcon /> },
  { name: "สินค้าทั้งหมด", path: "/products", icon: <InventoryIcon /> },
  { name: "การขายทั้งหมด", path: "/orders", icon: <ReceiptIcon /> },
];

const bottomMenu = [
  { name: "ตั้งค่าระบบ", path: "/settings", icon: <SettingsIcon /> },
];

const buttonStyle = {
  borderRadius: 5,
  mb: 1.5,
  justifyContent: "center",
  height: 75,
  width: 75,
  transition: "all 0.2s ease",

  "&.Mui-selected": {
    background:
      "linear-gradient(135deg, #111827 0%, #000 100%)",
    boxShadow: "0 10px 20px rgba(15, 23, 42, 0.25)",
  },

  "&:hover": {
    backgroundColor: "#f3f4f6",
    transform: "translateY(-2px)",
  },
};

const iconStyle = (active: boolean) => ({
  minWidth: "unset",
  color: active ? "#ffffff" : "#9ca3af",
  justifyContent: "center",

  "& svg": {
    fontSize: 40,
  },
});

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width: drawerWidth,
          marginLeft: "16px",
          marginTop: "16px",
          marginBottom: "16px",
          height: "calc(100% - 32px)",
          borderRadius: "25px",
          border: "1px solid #e5e7eb",
          background:
            "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Toolbar
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          py: "25px",
        }}
      >
        <Box
          component="img"
          src="/QuickPOS.png"
          alt="QuickPOS"
          sx={{
            height: 35,
            objectFit: "contain",
            filter: "grayscale(10%)",
          }}
        />
      </Toolbar>

      <Divider
        sx={{
          width: "100%",
          borderStyle: "dashed",
          borderColor: "#e5e7eb",
          borderBottomWidth: "2px",
        }}
      />

      {/* MAIN MENU */}
      <List
        sx={{
          p: 1,
          pt: 1.5,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
        }}
      >
        {mainMenu.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Tooltip key={item.name} title={item.name} placement="right" arrow>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={active}
                sx={buttonStyle}
              >
                <ListItemIcon sx={iconStyle(active)}>
                  {item.icon}
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* SETTINGS */}
      <List
        sx={{
          pb: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {bottomMenu.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Tooltip key={item.name} title={item.name} placement="right" arrow>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={active}
                sx={buttonStyle}
              >
                <ListItemIcon sx={iconStyle(active)}>
                  {item.icon}
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ pb: 2 }}>
        <Typography fontSize={13} color="#9ca3af">
          v1.0
        </Typography>
      </Box>
    </Drawer>
  );
}