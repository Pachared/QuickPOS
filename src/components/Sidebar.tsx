import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

const menu = [
  { name: "POS", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Orders", path: "/orders" },
  { name: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <Drawer variant="permanent">
      <Toolbar />

      <List sx={{ width: 200 }}>
        {menu.map((item) => (
          <ListItemButton key={item.name} onClick={() => navigate(item.path)}>
            <ListItemText primary={item.name} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
