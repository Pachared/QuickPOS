"use client";

import {
  Drawer,
  Box,
  Typography,
  Divider,
  Stack,
  Paper,
  IconButton,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const drawerWidth = 320;

export default function Cart({ cart, removeItem }: any) {
  const total = cart.reduce((s: number, i: any) => s + i.price * i.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("ไม่มีสินค้าในตะกร้า");
      return;
    }

    // 🔥 ตรงนี้เอาไปต่อ API / save DB ได้
    console.log("Checkout:", cart);

    alert("ชำระเงินสำเร็จ!");
  };

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      sx={{
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          marginRight: "16px",
          marginTop: "16px",
          marginBottom: "16px",
          height: "calc(100% - 32px)",
          borderRadius: "25px",
          border: "1px solid #e5e7eb",
          background: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box p={3}>
        <Box display="flex" justifyContent="center">
          <Typography variant="h5" fontWeight={700}>
            ตะกร้าสินค้า
          </Typography>
        </Box>
      </Box>

      <Divider
        sx={{
          width: "100%",
          borderStyle: "dashed",
          borderColor: "#e5e7eb",
          borderBottomWidth: "2px",
        }}
      />

      {/* Items */}
      <Box flex={1} overflow="auto" p={2}>
        {cart.map((item: any) => (
          <Paper
            key={item.id}
            sx={{
              p: 2,
              mb: 1,
              borderRadius: 3,
              border: "1px solid #eee",
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography fontWeight={600}>{item.name}</Typography>
                <Typography fontSize={13} color="text.secondary">
                  ฿{item.price} × {item.qty}
                </Typography>
              </Box>

              <IconButton onClick={() => removeItem(item.id)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Box>

      <Divider
        sx={{
          width: "100%",
          borderStyle: "dashed",
          borderColor: "#e5e7eb",
          borderBottomWidth: "2px",
        }}
      />

      {/* Total + Checkout */}
      <Box p={2}>
        <Box
          sx={{
            background: "#f3f4f6",
            borderRadius: 4,
            p: 2,
          }}
        >
          <Stack direction="row" justifyContent="space-between">
            <Typography fontSize={20} fontWeight={700}>
              ราคา
            </Typography>
            <Typography fontSize={20} fontWeight={700}>
              {total.toLocaleString()} บาท
            </Typography>
          </Stack>
        </Box>

        {/* ปุ่มชำระเงิน */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleCheckout}
          sx={{
            mt: 2,
            borderRadius: 4,
            py: 1.5,
            fontWeight: 600,
            background: "#111",
            "&:hover": {
              background: "#333",
            },
          }}
        >
          ชำระเงิน
        </Button>
      </Box>
    </Drawer>
  );
}
