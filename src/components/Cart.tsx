import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
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

export default function Cart({ cart, removeItem }: Props) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <Box
      sx={{
        width: 350,
        borderLeft: "1px solid #ddd",
        p: 2,
      }}
    >
      <Typography variant="h6">Cart</Typography>

      <List>
        {cart.map((item) => (
          <ListItem
            key={item.id}
            secondaryAction={
              <IconButton onClick={() => removeItem(item.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${item.name} x${item.qty}`}
              secondary={`฿${item.price * item.qty}`}
            />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" sx={{ mt: 2 }}>
        Total: ฿{total}
      </Typography>
    </Box>
  );
}
