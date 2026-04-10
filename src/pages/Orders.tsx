import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack,
  Avatar,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Slide,
} from "@mui/material";
import type { SlideProps } from "@mui/material";

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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function SlideDownTransition(props: SlideProps) {
  return (
    <Slide
      {...props}
      direction="down"
      timeout={{ enter: 260, exit: 180 }}
    />
  );
}

const summaryCardSx = {
  p: 2.2,
  borderRadius: 5,
  border: "1px solid #e5e7eb",
  background: "#fff",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};

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
            <td style="padding:4px 0; text-align:right;">${formatCurrency(
              item.price
            )}</td>
            <td style="padding:4px 0; text-align:right;">${formatCurrency(
              subtotal
            )}</td>
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

          <div class="row"><span>จำนวนสินค้า</span><span>${
            selectedOrder.items
          } ชิ้น</span></div>
          <div class="row"><span>วิธีชำระ</span><span>${
            selectedOrder.paymentMethod === "cash" ? "เงินสด" : "โอนเงิน"
          }</span></div>
          <div class="row"><span>รับเงิน</span><span>${formatCurrency(
            selectedOrder.receivedAmount
          )}</span></div>
          <div class="row"><span>เงินทอน</span><span>${formatCurrency(
            selectedOrder.change
          )}</span></div>
          <div class="row total"><span>ยอดรวม</span><span>${formatCurrency(
            selectedOrder.total
          )}</span></div>

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
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          mb: 2,
          p: { xs: 2.25, md: 3 },
          borderRadius: "25px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #18253c 45%, #344256 100%)",
          color: "#fff",
          flexShrink: 0,
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
              "& .MuiChip-label": {
                px: 0.5,
              },
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
        sx={{ mb: 2, flexShrink: 0 }}
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

      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 5,
          border: "1px solid #e5e7eb",
          background: "#fff",
          minHeight: 0,
          flex: 1,
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 2.5 },
            py: 2,
            background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
            borderBottom: "1px solid #eef2f7",
            flexShrink: 0,
          }}
        >
          <Typography fontSize={18} fontWeight={800} color="#111827">
            รายการออเดอร์
          </Typography>
          <Typography variant="body2" color="text.secondary">
            แสดงข้อมูลออเดอร์พร้อมดูรายละเอียดใบเสร็จ
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            backgroundColor: "#fff",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              width: "100%",
              tableLayout: "auto",
              borderCollapse: "separate",
              borderSpacing: 0,
              "& .MuiTableCell-root": {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
              "& .MuiTableHead-root .MuiTableCell-root": {
                backgroundColor: "#f9fafb",
                backgroundImage: "none",
                position: "sticky",
                top: 0,
                zIndex: 2,
                boxShadow: "inset 0 -1px 0 #e5e7eb",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  "& .MuiTableCell-root": {
                    borderBottom: "none",
                    fontWeight: 800,
                    color: "#374151",
                    py: 1.5,
                  },
                }}
              >
                <TableCell sx={{ width: "20%" }}>เลขออเดอร์</TableCell>
                <TableCell sx={{ width: "24%" }}>วันที่ / เวลา</TableCell>
                <TableCell sx={{ width: "14%" }}>จำนวนสินค้า</TableCell>
                <TableCell sx={{ width: "14%" }}>ยอดรวม</TableCell>
                <TableCell sx={{ width: "16%" }}>การชำระเงิน</TableCell>
                <TableCell sx={{ width: "12%" }}>การจัดการ</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  sx={{
                    transition: "background-color 0.18s ease",
                    "&:hover": {
                      background: "#fcfcfd",
                    },
                    "& .MuiTableCell-root": {
                      borderBottom: "1px solid #f1f5f9",
                      py: 1.35,
                    },
                  }}
                >
                  <TableCell>
                    <Chip
                      label={`#${order.id}`}
                      sx={{
                        maxWidth: "100%",
                        borderRadius: 999,
                        fontWeight: 800,
                        bgcolor: "#f3f4f6",
                        color: "#111827",
                        border: "1px solid #e5e7eb",
                        "& .MuiChip-label": {
                          px: 1.25,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700} color="#111827" noWrap>
                      {order.date}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700} color="#111827" noWrap>
                      {order.items} ชิ้น
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={800} color="#111827" noWrap>
                      {formatCurrency(order.total)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={
                        order.paymentMethod === "cash" ? (
                          <PaymentsRoundedIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <AccountBalanceRoundedIcon sx={{ fontSize: 18 }} />
                        )
                      }
                      label={
                        order.paymentMethod === "cash" ? "เงินสด" : "โอนเงิน"
                      }
                      sx={{
                        maxWidth: "100%",
                        height: 32,
                        borderRadius: 999,
                        fontWeight: 800,
                        border:
                          order.paymentMethod === "cash"
                            ? "1px solid #f3d38a"
                            : "1px solid #bfd4f6",
                        bgcolor:
                          order.paymentMethod === "cash"
                            ? "#fff7db"
                            : "#eaf2ff",
                        color:
                          order.paymentMethod === "cash"
                            ? "#8a5a00"
                            : "#1d4f91",
                        "& .MuiChip-label": {
                          px: 1.4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                        "& .MuiChip-icon": {
                          ml: 0.9,
                          mr: -0.4,
                          color:
                            order.paymentMethod === "cash"
                              ? "#9a6700"
                              : "#2563eb",
                        },
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
                        minWidth: "auto",
                        borderRadius: 3,
                        px: 1.25,
                        py: 0.75,
                        fontWeight: 700,
                        textTransform: "none",
                        borderColor: "#d1d5db",
                        color: "#111827",
                        whiteSpace: "nowrap",
                        "&:hover": {
                          borderColor: "#9ca3af",
                          background: "#f9fafb",
                        },
                      }}
                    >
                      ดูรายละเอียด
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 14, borderBottom: "none", }}>
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

                      <Typography variant="h6" fontWeight={800} color="#111827">
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
      </Paper>

      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        fullWidth
        maxWidth="md"
        keepMounted
        TransitionComponent={SlideDownTransition}
        transitionDuration={{ appear: 260, enter: 260, exit: 180 }}
        sx={{
          "& .MuiDialog-container": {
            justifyContent: "center",
            alignItems: "flex-start",
            pt: { xs: 6, sm: 8, md: 10 },
          },
        }}
        BackdropProps={{
          timeout: 260,
          sx: {
            background:
              "linear-gradient(180deg, rgba(2,6,23,0.25) 0%, rgba(15,23,42,0.40) 100%)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          },
        }}
        PaperProps={{
          sx: {
            m: 0,
            width: "100%",
            borderRadius: 6,
            overflow: "hidden",
            background: "rgba(255,255,255,0.90)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 30px 80px rgba(15,23,42,0.25)",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2.5,
            fontWeight: 900,
            background:
              "linear-gradient(135deg, rgba(17,24,39,0.96) 0%, rgba(31,41,55,0.94) 55%, rgba(55,65,81,0.92) 100%)",
            color: "#fff",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          รายละเอียดใบเสร็จ
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
            background:
              "linear-gradient(180deg, rgba(248,250,252,0.72) 0%, rgba(255,255,255,0.85) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
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
                  <Table
                    sx={{
                      borderCollapse: "separate",
                      borderSpacing: 0,
                      minWidth: 520,
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #f1f5f9",
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow
                        sx={{
                          "& .MuiTableCell-root": {
                            fontWeight: 800,
                            color: "#374151",
                            background: "#fff",
                          },
                        }}
                      >
                        <TableCell>รายการ</TableCell>
                        <TableCell align="right">จำนวน</TableCell>
                        <TableCell align="right">ราคา</TableCell>
                        <TableCell align="right">รวม</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {selectedOrder.products.map((item, index) => (
                        <TableRow key={`${item.id}-${index}`} hover>
                          <TableCell>
                            <Typography fontWeight={700} color="#111827">
                              {item.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{item.qty}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.qty * item.price)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 2.2,
                  borderRadius: 4,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                }}
              >
                <Stack spacing={1.2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">จำนวนสินค้า</Typography>
                    <Typography fontWeight={800}>
                      {receiptProductCount} ชิ้น
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">วิธีชำระเงิน</Typography>
                    <Typography fontWeight={800}>
                      {selectedOrder.paymentMethod === "cash"
                        ? "เงินสด"
                        : "โอนเงิน"}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">รับเงิน</Typography>
                    <Typography fontWeight={800}>
                      {formatCurrency(selectedOrder.receivedAmount)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">เงินทอน</Typography>
                    <Typography fontWeight={800}>
                      {formatCurrency(selectedOrder.change)}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 0.5 }} />

                  <Stack direction="row" justifyContent="space-between">
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
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.2,
            borderTop: "1px solid rgba(241,245,249,0.85)",
            background:
              "linear-gradient(180deg, rgba(248,250,252,0.70) 0%, rgba(255,255,255,0.84) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            gap: 1,
          }}
        >
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