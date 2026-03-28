import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack,
  Avatar,
  Chip,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

import type { Order } from "../types/pos";
import { formatCurrency } from "../utils/format";

interface OrdersProps {
  orders: Order[];
}

export default function Orders({ orders }: OrdersProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const totalOrders = orders.length;
  const totalItems = orders.reduce((sum, order) => sum + order.items, 0);
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedOrder(null);
  };

  const receiptProductCount = useMemo(() => {
    if (!selectedOrder) return 0;
    return selectedOrder.products.reduce((sum, item) => sum + item.qty, 0);
  }, [selectedOrder]);

  const handlePrintReceipt = () => {
    if (!selectedOrder) return;

    const receiptWindow = window.open("", "_blank", "width=420,height=800");
    if (!receiptWindow) {
      alert("ไม่สามารถเปิดหน้าพิมพ์ได้");
      return;
    }

    const productsHtml = selectedOrder.products
      .map((item) => {
        const subtotal = item.qty * item.price;
        return `
          <tr>
            <td style="padding:4px 0;">${escapeHtml(item.name)}</td>
            <td style="padding:4px 0; text-align:right;">${item.qty}</td>
            <td style="padding:4px 0; text-align:right;">${formatCurrency(item.price)}</td>
            <td style="padding:4px 0; text-align:right;">${formatCurrency(subtotal)}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8" />
        <title>Receipt #${selectedOrder.id}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #111; }
          .wrap { width: 80mm; margin: 0 auto; padding: 10px; box-sizing: border-box; }
          .center { text-align: center; }
          .title { font-size: 20px; font-weight: 800; }
          .muted { color: #666; font-size: 12px; }
          .divider { border-top: 1px dashed #999; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 13px; }
          .total { font-size: 16px; font-weight: 800; }
          @page { size: 80mm auto; margin: 0; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="center">
            <div class="title">ใบเสร็จรับเงิน</div>
            <div class="muted">เลขออเดอร์ #${selectedOrder.id}</div>
            <div class="muted">${selectedOrder.date}</div>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th align="left">รายการ</th>
                <th align="right">จำนวน</th>
                <th align="right">ราคา</th>
                <th align="right">รวม</th>
              </tr>
            </thead>
            <tbody>
              ${productsHtml}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="row"><span>จำนวนสินค้า</span><span>${selectedOrder.items} ชิ้น</span></div>
          <div class="row"><span>วิธีชำระ</span><span>${selectedOrder.paymentMethod === "cash" ? "เงินสด" : "โอนเงิน"}</span></div>
          <div class="row"><span>รับเงิน</span><span>${formatCurrency(selectedOrder.receivedAmount)}</span></div>
          <div class="row"><span>เงินทอน</span><span>${formatCurrency(selectedOrder.change)}</span></div>
          <div class="row total"><span>ยอดรวม</span><span>${formatCurrency(selectedOrder.total)}</span></div>

          <div class="divider"></div>
          <div class="center muted">ขอบคุณที่ใช้บริการ</div>
        </div>
      </body>
      </html>
    `;

    receiptWindow.document.open();
    receiptWindow.document.write(html);
    receiptWindow.document.close();

    receiptWindow.onload = () => {
      receiptWindow.focus();
      receiptWindow.print();
    };
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
      }}
    >
      <Box
        sx={{
          mb: 3,
          p: { xs: 2.25, md: 3 },
          borderRadius: 5,
          background:
            "linear-gradient(135deg, #111827 0%, #1f2937 55%, #374151 100%)",
          color: "#fff",
          boxShadow: "0 18px 34px rgba(15, 23, 42, 0.14)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <ReceiptLongRoundedIcon />
            </Avatar>

            <Box>
              <Typography variant="h5" fontWeight={800}>
                ประวัติการขาย
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.82 }}>
                ตรวจสอบออเดอร์ย้อนหลังและดูใบเสร็จแต่ละรายการ
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={`${totalOrders} ออเดอร์`}
            sx={{
              borderRadius: 999,
              fontWeight: 700,
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          />
        </Stack>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        }}
        gap={2}
        sx={{ mb: 3 }}
      >
        <Paper elevation={0} sx={summaryCardSx}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: "#eef2ff",
                color: "#4f46e5",
              }}
            >
              <TimelineRoundedIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                จำนวนออเดอร์
              </Typography>
              <Typography variant="h6" fontWeight={800} color="#111827">
                {totalOrders.toLocaleString()} รายการ
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={summaryCardSx}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: "#ecfeff",
                color: "#0891b2",
              }}
            >
              <ShoppingBagRoundedIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                จำนวนสินค้าที่ขาย
              </Typography>
              <Typography variant="h6" fontWeight={800} color="#111827">
                {totalItems.toLocaleString()} ชิ้น
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={summaryCardSx}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: "#f0fdf4",
                color: "#16a34a",
              }}
            >
              <PaidRoundedIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                ยอดขายรวม
              </Typography>
              <Typography variant="h6" fontWeight={800} color="#111827">
                {formatCurrency(totalSales)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: 5,
          border: "1px solid #e5e7eb",
          boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
          }}
        >
          <Typography fontSize={18} fontWeight={800} color="#111827">
            รายการออเดอร์
          </Typography>
          <Typography variant="body2" color="text.secondary">
            แสดงข้อมูลออเดอร์พร้อมดูรายละเอียดใบเสร็จ
          </Typography>
        </Box>

        <Divider />

        <CardContent sx={{ p: 0 }}>
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: "#f9fafb",
                    "& .MuiTableCell-root": {
                      borderBottom: "1px solid #e5e7eb",
                      fontWeight: 800,
                      color: "#374151",
                      py: 1.8,
                    },
                  }}
                >
                  <TableCell>เลขออเดอร์</TableCell>
                  <TableCell>วันที่ / เวลา</TableCell>
                  <TableCell>จำนวนสินค้า</TableCell>
                  <TableCell>ยอดรวม</TableCell>
                  <TableCell>การชำระเงิน</TableCell>
                  <TableCell align="right">การจัดการ</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    hover
                    sx={{
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: "#fcfcfd",
                      },
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #f1f5f9",
                        py: 1.8,
                      },
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={`#${order.id}`}
                        sx={{
                          borderRadius: 999,
                          fontWeight: 800,
                          bgcolor: "#f3f4f6",
                          color: "#111827",
                          border: "1px solid #e5e7eb",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700} color="#111827">
                        {order.date}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700} color="#111827">
                        {order.items} ชิ้น
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={800} color="#111827">
                        {formatCurrency(order.total)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={
                          order.paymentMethod === "cash" ? (
                            <PaymentsRoundedIcon />
                          ) : (
                            <AccountBalanceRoundedIcon />
                          )
                        }
                        label={
                          order.paymentMethod === "cash"
                            ? "เงินสด"
                            : "โอนเงิน"
                        }
                        sx={{
                          borderRadius: 999,
                          fontWeight: 700,
                          bgcolor:
                            order.paymentMethod === "cash"
                              ? "#fef3c7"
                              : "#dbeafe",
                          color: "#111827",
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityRoundedIcon />}
                        onClick={() => handleOpenDetail(order)}
                        sx={{
                          borderRadius: 3,
                          px: 1.8,
                          py: 0.8,
                          fontWeight: 700,
                          textTransform: "none",
                          borderColor: "#d1d5db",
                          color: "#111827",
                        }}
                      >
                        ดูรายละเอียด
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Stack spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 72,
                            height: 72,
                            borderRadius: 4,
                            bgcolor: "#f3f4f6",
                            color: "#9ca3af",
                          }}
                        >
                          <ReceiptLongRoundedIcon sx={{ fontSize: 34 }} />
                        </Avatar>

                        <Typography
                          variant="h6"
                          fontWeight={800}
                          color="#111827"
                        >
                          ยังไม่มีประวัติการขาย
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          เมื่อกดชำระเงินสำเร็จ รายการจะมาแสดงที่หน้านี้อัตโนมัติ
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 6,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2.5,
            fontWeight: 900,
            background:
              "linear-gradient(135deg, #111827 0%, #1f2937 55%, #374151 100%)",
            color: "#fff",
          }}
        >
          รายละเอียดใบเสร็จ
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedOrder && (
            <Stack spacing={2.2} sx={{ mt: 1 }}>
              <Box
                sx={{
                  p: 2.2,
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                  border: "1px solid #e5e7eb",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1.5}
                >
                  <Box>
                    <Typography color="text.secondary">เลขออเดอร์</Typography>
                    <Typography fontSize={24} fontWeight={900} color="#111827">
                      #{selectedOrder.id}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography color="text.secondary">วันที่ / เวลา</Typography>
                    <Typography fontWeight={800} color="#111827">
                      {selectedOrder.date}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box
                sx={{
                  borderRadius: 4,
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    background: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <Typography fontWeight={800}>รายการสินค้า</Typography>
                </Box>

                <Box sx={{ overflowX: "auto" }}>
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          "& .MuiTableCell-root": {
                            fontWeight: 800,
                            color: "#374151",
                            background: "#fcfcfd",
                          },
                        }}
                      >
                        <TableCell>สินค้า</TableCell>
                        <TableCell>จำนวน</TableCell>
                        <TableCell>ราคา</TableCell>
                        <TableCell align="right">รวม</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {selectedOrder.products.map((item, index) => {
                        const subtotal = item.qty * item.price;
                        return (
                          <TableRow key={`${item.id}-${index}`}>
                            <TableCell>
                              <Typography fontWeight={700} color="#111827">
                                {item.name}
                              </Typography>
                            </TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>{formatCurrency(item.price)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>
                              {formatCurrency(subtotal)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </Box>

              <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)" }}
                gap={2}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                  }}
                >
                  <Typography fontWeight={800} mb={1.2}>
                    ข้อมูลการชำระเงิน
                  </Typography>

                  <Stack spacing={1.2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">วิธีชำระ</Typography>
                      <Typography fontWeight={700}>
                        {selectedOrder.paymentMethod === "cash"
                          ? "เงินสด"
                          : "โอนเงิน"}
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">รับเงิน</Typography>
                      <Typography fontWeight={700}>
                        {formatCurrency(selectedOrder.receivedAmount)}
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">เงินทอน</Typography>
                      <Typography fontWeight={700}>
                        {formatCurrency(selectedOrder.change)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: "1px solid #e5e7eb",
                    background:
                      "linear-gradient(135deg, #f3f4f6 0%, #eef2f7 100%)",
                  }}
                >
                  <Typography fontWeight={800} mb={1.2}>
                    สรุปรายการ
                  </Typography>

                  <Stack spacing={1.2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">จำนวนสินค้า</Typography>
                      <Typography fontWeight={700}>
                        {receiptProductCount} ชิ้น
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        fontSize={18}
                        fontWeight={900}
                        color="#111827"
                      >
                        ยอดรวม
                      </Typography>
                      <Typography
                        fontSize={22}
                        fontWeight={900}
                        color="#111827"
                      >
                        {formatCurrency(selectedOrder.total)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleCloseDetail}
            sx={{
              borderRadius: 3,
              px: 2.5,
              fontWeight: 700,
              textTransform: "none",
              color: "#374151",
            }}
          >
            ปิด
          </Button>

          <Button
            variant="outlined"
            startIcon={<PrintRoundedIcon />}
            onClick={handlePrintReceipt}
            sx={{
              borderRadius: 3,
              px: 2.5,
              fontWeight: 800,
              textTransform: "none",
            }}
          >
            พิมพ์ใบเสร็จ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const summaryCardSx = {
  p: 2.2,
  borderRadius: 5,
  border: "1px solid #e5e7eb",
  background: "#fff",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}