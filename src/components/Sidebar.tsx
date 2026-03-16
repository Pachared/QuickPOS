import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
} from "@mui/material";

import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsIcon from "@mui/icons-material/Settings";

import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 200;

const menu = [
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
  {
    name: "ตั้งค่าระบบ",
    path: "/settings",
    icon: <SettingsIcon />,
  },
];

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
          boxSizing: "border-box",
          borderRight: "1px solid #eee",
        },
      }}
    >
      {/* Logo */}
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* <Box
            component="img"
            src="/logo.png"
            alt="logo"
            sx={{
              width: 32,
              height: 32,
            }}
          /> */}

          <Typography fontWeight={700}>My POS</Typography>
        </Box>
      </Toolbar>

      <Divider />

      {/* Menu */}
      <List sx={{ p: 1 }}>
        {menu.map((item) => {
          const active = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.name}
              onClick={() => navigate(item.path)}
              selected={active}
              sx={{
                borderRadius: 2,
                mb: 0.5,

                "&.Mui-selected": {
                  backgroundColor: "#f1f5f9",
                },

                "&:hover": {
                  backgroundColor: "#f8fafc",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: active ? "#1976d2" : "#666",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.name}
                primaryTypographyProps={{
                  fontWeight: active ? 600 : 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}
