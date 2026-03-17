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
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsIcon from "@mui/icons-material/Settings";

import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 100;

const mainMenu = [
  {
    name: "POS",
    path: "/",
    icon: <PointOfSaleIcon />,
  },
  {
    name: "สินค้าทั้งหมด",
    path: "/products",
    icon: <InventoryIcon />,
  },
  {
    name: "การขายทั้งหมด",
    path: "/orders",
    icon: <ReceiptLongIcon />,
  },
];

const bottomMenu = [
  {
    name: "ตั้งค่าระบบ",
    path: "/settings",
    icon: <SettingsIcon />,
  },
];

const buttonStyle = {
  borderRadius: 5,
  mb: 1.5,
  justifyContent: "center",
  height: 75,
  width: 75,

  "&.Mui-selected": {
    backgroundColor: "#f1f5f9",
  },

  "&:hover": {
    backgroundColor: "#f1f5f9",
    transform: "scale(1.05)",
    transition: "all 0.2s ease",
  },
};

const iconStyle = (active: boolean) => ({
  minWidth: "unset",
  color: active ? "#311b92" : "#9ca3af",
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
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        },
      }}
    >
      {/* Header */}
      <Toolbar
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          py: "12px"
        }}
      >
        <Typography fontWeight={700} fontSize={16}>
          POS
        </Typography>
      </Toolbar>

      <Divider
        sx={{
          width: "100%",
          borderStyle: "dashed",
          borderColor: "#e5e7eb",
          borderBottomWidth: "2px",
        }}
      />

      {/* 🔼 MAIN MENU (บน) */}
      <List
        sx={{
          p: 1.5,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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

      {/* 🔽 ดันลงล่าง */}
      <Box sx={{ flexGrow: 1 }} />

      {/* 🔽 SETTINGS (ล่างสุด) */}
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
        <Typography fontSize={14} color="#999">
          v1.0
        </Typography>
      </Box>
    </Drawer>
  );
}