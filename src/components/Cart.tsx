import {
  Drawer,
  List,
  IconButton,
  Toolbar,
  Box,
  Typography,
  Divider,
  Paper,
  Stack,
  Chip,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface Props {
  cart: CartItem[];
  removeItem: (id: number) => void;
}

const drawerWidth = 300;

export default function Cart({ cart, removeItem }: Props) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderLeft: "1px solid #eee",
          background: "#fafafa",
        },
      }}
    >
      <Toolbar />

      {/* Header */}
      <Box sx={{ px: 3, py: 2 }}>
        <Typography fontSize={20} fontWeight={700}>
          Cart
        </Typography>

        <Typography fontSize={13} color="text.secondary">
          {cart.length} items
        </Typography>
      </Box>

      <Divider />

      {/* Cart Items */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2,
          py: 2,
        }}
      >
        <List disablePadding>
          {cart.map((item) => (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                p: 2,
                mb: 1.5,
                borderRadius: 3,
                border: "1px solid #eee",
                background: "#fff",
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography fontWeight={600}>{item.name}</Typography>

                  <Typography
                    fontSize={13}
                    color="text.secondary"
                    sx={{ mt: 0.3 }}
                  >
                    ฿{item.price.toLocaleString()}
                  </Typography>

                  <Chip
                    size="small"
                    label={`Qty: ${item.qty}`}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <IconButton
                  size="small"
                  onClick={() => removeItem(item.id)}
                  sx={{
                    bgcolor: "#f5f5f5",
                    "&:hover": {
                      bgcolor: "#ffebee",
                      color: "#d32f2f",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </List>
      </Box>

      <Divider />

      {/* Total */}
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography fontWeight={600}>Total</Typography>

          <Typography fontSize={20} fontWeight={700}>
            ฿{total.toLocaleString()}
          </Typography>
        </Stack>
      </Box>
    </Drawer>
  );
}