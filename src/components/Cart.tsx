import { useEffect, useMemo, useRef, useState } from "react";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

import {
  Drawer,
  Box,
  Typography,
  Divider,
  Stack,
  Paper,
  IconButton,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Snackbar,
  Alert,
  Slide,
} from "@mui/material";
import type { SlideProps, AlertColor } from "@mui/material";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import LocalAtmRoundedIcon from "@mui/icons-material/LocalAtmRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

import type { CartItem, Order, OrderItem, PaymentMethod } from "../types/pos";
import { formatCurrency } from "../utils/format";

const drawerWidth = 360;
const CASH_TYPES = [20, 50, 100, 500, 1000];

interface CartProps {
  cart: CartItem[];
  removeItem: (id: number | string) => void;
  clearCart?: () => void;
  onCheckoutSuccess?: (order: Order) => void;
}

const PROMPTPAY_ID = "0812345678";
const SHOP_NAME = "QuickPOS Store";

function SlideDownTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

export default function Cart({
  cart,
  removeItem,
  clearCart,
  onCheckoutSuccess,
}: CartProps) {
  const [openCheckout, setOpenCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cashCounts, setCashCounts] = useState<Record<number, number>>({
    20: 0,
    50: 0,
    100: 0,
    500: 0,
    1000: 0,
  });

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [paid, setPaid] = useState(false);
  const [receiptNo, setReceiptNo] = useState("");
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0),
    [cart]
  );

  const totalQty = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const received = useMemo(() => {
    return Object.entries(cashCounts).reduce(
      (sum, [value, qty]) => sum + Number(value) * qty,
      0
    );
  }, [cashCounts]);

  const change = paymentMethod === "cash" ? received - total : 0;
  const isEnoughCash = paymentMethod === "cash" ? received >= total : true;

  const showSnackbar = (message: string, severity: AlertColor = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = (
    _: Event | React.SyntheticEvent<any, Event>,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  useEffect(() => {
    if (!openCheckout) return;

    const now = new Date();
    const no = `RC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(now.getDate()).padStart(2, "0")}-${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;
    setReceiptNo(no);
  }, [openCheckout]);

  useEffect(() => {
    const generateQr = async () => {
      if (!openCheckout || paymentMethod !== "transfer" || total <= 0) {
        setQrDataUrl("");
        return;
      }

      try {
        setIsGeneratingQr(true);
        const payload = generatePayload(PROMPTPAY_ID, { amount: total });
        const dataUrl = await QRCode.toDataURL(payload, {
          width: 280,
          margin: 1,
          errorCorrectionLevel: "M",
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error("Generate QR failed:", err);
        setQrDataUrl("");
        showSnackbar("สร้าง QR ไม่สำเร็จ", "error");
      } finally {
        setIsGeneratingQr(false);
      }
    };

    generateQr();
  }, [openCheckout, paymentMethod, total]);

  const addCash = (value: number) => {
    setCashCounts((prev) => ({
      ...prev,
      [value]: prev[value] + 1,
    }));
  };

  const resetCash = () => {
    setCashCounts({
      20: 0,
      50: 0,
      100: 0,
      500: 0,
      1000: 0,
    });
  };

  const setExactCash = () => {
    const sorted = [...CASH_TYPES].sort((a, b) => b - a);
    let remain = total;

    const nextCounts: Record<number, number> = {
      20: 0,
      50: 0,
      100: 0,
      500: 0,
      1000: 0,
    };

    for (const note of sorted) {
      const qty = Math.floor(remain / note);
      if (qty > 0) {
        nextCounts[note] = qty;
        remain -= qty * note;
      }
    }

    if (remain > 0) {
      nextCounts[20] += Math.ceil(remain / 20);
    }

    setCashCounts(nextCounts);
    showSnackbar("คำนวณเงินสดพอดีให้แล้ว", "info");
  };

  const resetCheckoutState = () => {
    setPaymentMethod("cash");
    resetCash();
    setQrDataUrl("");
    setPaid(false);
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      showSnackbar("ไม่มีสินค้าในตะกร้า", "warning");
      return;
    }
    resetCheckoutState();
    setOpenCheckout(true);
  };

  const handleCloseCheckout = () => {
    setOpenCheckout(false);
    resetCheckoutState();
  };

  const playSuccessBeep = async () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.08);

      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.18);
    } catch (err) {
      console.error("Beep failed:", err);
    }
  };

  const buildReceiptHtml = () => {
    const paidAmount = paymentMethod === "cash" ? received : total;
    const changeAmount = paymentMethod === "cash" ? Math.max(change, 0) : 0;
    const paidLabel = paymentMethod === "cash" ? "เงินสด" : "โอนเงิน";

    const itemsHtml = cart
      .map((item) => {
        const price = Number(item.price);
        const subtotal = price * item.qty;
        return `
          <tr>
            <td class="name">${escapeHtml(item.name)}</td>
            <td class="qty">${item.qty}</td>
            <td class="price">${formatCurrency(price)}</td>
            <td class="subtotal">${formatCurrency(subtotal)}</td>
          </tr>
        `;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8" />
        <title>Receipt</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
            background: #fff;
          }
          .receipt {
            width: 80mm;
            padding: 10px;
            margin: 0 auto;
          }
          .center { text-align: center; }
          .title {
            font-size: 20px;
            font-weight: 800;
            margin-bottom: 4px;
          }
          .muted {
            font-size: 12px;
            color: #555;
          }
          .divider {
            border-top: 1px dashed #999;
            margin: 10px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          td {
            padding: 4px 0;
            vertical-align: top;
          }
          .name { width: 44%; }
          .qty, .price, .subtotal {
            text-align: right;
            white-space: nowrap;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin: 4px 0;
          }
          .summary-row.total {
            font-size: 16px;
            font-weight: 800;
          }
          .footer {
            margin-top: 12px;
            text-align: center;
            font-size: 12px;
          }
          @media print {
            @page { size: 80mm auto; margin: 0; }
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center">
            <div class="title">${escapeHtml(SHOP_NAME)}</div>
            <div class="muted">ใบเสร็จรับเงิน / Receipt</div>
            <div class="muted">เลขที่: ${escapeHtml(receiptNo)}</div>
            <div class="muted">${new Date().toLocaleString("th-TH")}</div>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <td><strong>รายการ</strong></td>
                <td class="qty"><strong>จำนวน</strong></td>
                <td class="price"><strong>ราคา</strong></td>
                <td class="subtotal"><strong>รวม</strong></td>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="summary-row"><span>จำนวนสินค้า</span><span>${totalQty} ชิ้น</span></div>
          <div class="summary-row total"><span>ยอดรวม</span><span>${formatCurrency(
            total
          )}</span></div>
          <div class="summary-row"><span>วิธีชำระ</span><span>${paidLabel}</span></div>
          <div class="summary-row"><span>รับเงิน</span><span>${formatCurrency(
            paidAmount
          )}</span></div>
          <div class="summary-row"><span>เงินทอน</span><span>${formatCurrency(
            changeAmount
          )}</span></div>

          <div class="divider"></div>
          <div class="footer">ขอบคุณที่ใช้บริการ</div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintReceipt = () => {
    const receiptWindow = window.open("", "_blank", "width=420,height=800");
    if (!receiptWindow) {
      showSnackbar("ไม่สามารถเปิดหน้าพิมพ์ได้", "error");
      return;
    }

    receiptWindow.document.open();
    receiptWindow.document.write(buildReceiptHtml());
    receiptWindow.document.close();

    receiptWindow.onload = () => {
      receiptWindow.focus();
      receiptWindow.print();
    };

    showSnackbar("เปิดหน้าพิมพ์ใบเสร็จแล้ว", "success");
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === "cash" && !isEnoughCash) {
      showSnackbar("จำนวนเงินสดไม่พอ", "error");
      return;
    }

    const order: Order = {
      id: Date.now(),
      date: new Date().toLocaleString("sv-SE").replace("T", " ").slice(0, 16),
      items: totalQty,
      total,
      paymentMethod,
      receivedAmount: paymentMethod === "cash" ? received : total,
      change: paymentMethod === "cash" ? Math.max(change, 0) : 0,
      products: cart.map(
        (item): OrderItem => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: Number(item.price),
        })
      ),
    };

    console.log("Checkout:", order);

    onCheckoutSuccess?.(order);

    setPaid(true);
    await playSuccessBeep();

    showSnackbar(
      paymentMethod === "cash"
        ? `ชำระเงินสำเร็จ รับเงิน ${formatCurrency(received)} เงินทอน ${formatCurrency(
            Math.max(change, 0)
          )}`
        : "ชำระเงินสำเร็จ (โอนเงิน)",
      "success"
    );
  };

  const handleFinishSale = () => {
    handlePrintReceipt();
    clearCart?.();
    handleCloseCheckout();
    showSnackbar("จบการขายเรียบร้อย", "success");
  };

  return (
    <>
      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            m: 2,
            height: "calc(100% - 32px)",
            borderRadius: "25px",
            border: "1px solid #e5e7eb",
            background:
              "linear-gradient(180deg, #ffffff 0%, #fbfbfc 55%, #f9fafb 100%)",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            borderRadius: "25px 25px 0 0",
            background:
              "linear-gradient(135deg, #111827 0%, #1f2937 55%, #374151 100%)",
            color: "#fff",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 46,
                height: 46,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <ShoppingBagRoundedIcon />
            </Avatar>

            <Box>
              <Typography variant="h6" fontWeight={800}>
                ตะกร้าสินค้า
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ borderStyle: "dashed", borderColor: "#e5e7eb" }} />

        <Box flex={1} overflow="auto" p={2}>
          {cart.length === 0 ? (
            <Box
              sx={{
                height: "100%",
                minHeight: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                borderRadius: 5,
                bgcolor: "#fff",
              }}
            >
              <Box>
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    mx: "auto",
                    mb: 2,
                    borderRadius: 4,
                    bgcolor: "#f3f4f6",
                    color: "#9ca3af",
                  }}
                >
                  <PointOfSaleRoundedIcon sx={{ fontSize: 36 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={800}>
                  ยังไม่มีสินค้า
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เลือกสินค้าจากรายการด้านซ้าย
                </Typography>
              </Box>
            </Box>
          ) : (
            cart.map((item) => {
              const subtotal = Number(item.price) * item.qty;

              return (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 4,
                    border: "1px solid #eceff3",
                    background: "#fff",
                    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 3,
                        bgcolor: "#f3f4f6",
                        color: "#6b7280",
                        fontWeight: 800,
                      }}
                    >
                      {item.qty}
                    </Avatar>

                    <Box flex={1} minWidth={0}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Box minWidth={0}>
                          <Typography
                            fontWeight={800}
                            sx={{ wordBreak: "break-word" }}
                          >
                            {item.name}
                          </Typography>
                          <Typography
                            fontSize={13}
                            color="text.secondary"
                            mt={0.6}
                          >
                            {formatCurrency(Number(item.price))} × {item.qty}
                          </Typography>
                        </Box>

                        <IconButton
                          onClick={() => removeItem(item.id)}
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 3,
                            bgcolor: "#f9fafb",
                            border: "1px solid #eceff3",
                            color: "#ef4444",
                          }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        mt={1.3}
                      >
                        <Typography fontSize={13} color="text.secondary">
                          รวมรายการ
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatCurrency(subtotal)}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              );
            })
          )}
        </Box>

        <Divider sx={{ borderStyle: "dashed", borderColor: "#e5e7eb" }} />

        <Box p={2}>
          <Box
            sx={{
              p: 2,
              borderRadius: 4,
              background: "linear-gradient(135deg, #f3f4f6 0%, #eef2f7 100%)",
              border: "1px solid #e5e7eb",
            }}
          >
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography fontSize={14} color="text.secondary">
                จำนวนสินค้า
              </Typography>
              <Typography fontWeight={700}>{totalQty} ชิ้น</Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography fontSize={20} fontWeight={900}>
                ยอดรวม
              </Typography>
              <Typography fontSize={22} fontWeight={900}>
                {formatCurrency(total)}
              </Typography>
            </Stack>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={handleOpenCheckout}
            disabled={cart.length === 0}
            sx={{
              mt: 2,
              borderRadius: 4,
              py: 1.6,
              fontWeight: 800,
              textTransform: "none",
              background: "linear-gradient(135deg, #111827 0%, #000 100%)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.16)",
              "&:hover": {
                background: "linear-gradient(135deg, #000 0%, #111827 100%)",
              },
              "&.Mui-disabled": {
                background: "#d1d5db",
                color: "#6b7280",
              },
            }}
          >
            ชำระเงิน
          </Button>
        </Box>
      </Drawer>

      <Dialog
        open={openCheckout}
        onClose={handleCloseCheckout}
        fullWidth
        maxWidth="sm"
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
            py: 2.2,
            fontWeight: 900,
            background:
              "linear-gradient(135deg, #111827 0%, #1f2937 55%, #374151 100%)",
            color: "#fff",
          }}
        >
          ชำระเงิน
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
            pb: paymentMethod === "cash" ? 2 : 3,
            maxHeight: "72vh",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              mt: 1,
              p: 1.8,
              borderRadius: 4,
              background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
              border: "1px solid #e5e7eb",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={1.5}
            >
              <Box>
                <Typography fontSize={13} color="text.secondary" fontWeight={700}>
                  ยอดที่ต้องชำระ
                </Typography>
                <Typography fontSize={22} fontWeight={900} lineHeight={1.2}>
                  {formatCurrency(total)}
                </Typography>
              </Box>

              <Chip
                label={receiptNo || "RECEIPT"}
                size="small"
                sx={{
                  borderRadius: 3,
                  fontWeight: 800,
                  bgcolor: "#fff",
                  border: "1px solid #e5e7eb",
                }}
              />
            </Stack>
          </Box>

          <Typography mt={2.2} mb={1.2} fontWeight={800}>
            วิธีชำระเงิน
          </Typography>

          <ToggleButtonGroup
            fullWidth
            value={paymentMethod}
            exclusive
            onChange={(_, value) => {
              if (!value) return;
              setPaymentMethod(value);
            }}
            sx={{
              mb: 1.8,
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 1.2,
              "& .MuiToggleButtonGroup-grouped": {
                margin: "0 !important",
                border: "1px solid #d1d5db !important",
              },
              "& .MuiToggleButton-root": {
                borderRadius: "18px !important",
                textTransform: "none",
                fontWeight: 800,
                py: 1.25,
                px: 1.5,
                justifyContent: "center",
              },
            }}
          >
            <ToggleButton value="cash">
              <PaymentsRoundedIcon sx={{ mr: 1 }} />
              เงินสด
            </ToggleButton>
            <ToggleButton value="transfer">
              <AccountBalanceRoundedIcon sx={{ mr: 1 }} />
              โอนเงิน
            </ToggleButton>
          </ToggleButtonGroup>

          {paymentMethod === "cash" && (
            <>
              <Box
                sx={{
                  mb: 1.3,
                  p: 1.6,
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg, #eef6ff 0%, #f8fbff 100%)",
                  border: "1px solid #dbeafe",
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 3,
                      bgcolor: "#dbeafe",
                      color: "#1d4ed8",
                    }}
                  >
                    <LocalAtmRoundedIcon />
                  </Avatar>

                  <Box>
                    <Typography fontWeight={900} color="#111827">
                      เลือกแบงก์ที่ลูกค้าจ่าย
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      แตะที่ปุ่มด้านล่างเพื่อเพิ่มยอดรับเงินทันที
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box
                display="grid"
                gridTemplateColumns={{ xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" }}
                gap={1.2}
              >
                {CASH_TYPES.map((value) => (
                  <Button
                    key={value}
                    onClick={() => addCash(value)}
                    sx={{
                      position: "relative",
                      borderRadius: 4,
                      p: 1.4,
                      minHeight: 84,
                      textTransform: "none",
                      color: "#111827",
                      background:
                        "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
                      border: "1px solid #dbe2ea",
                      boxShadow: "0 10px 20px rgba(15, 23, 42, 0.06)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      transition: "all 0.18s ease",
                      "&:hover": {
                        background: "#ffffff",
                        transform: "translateY(-2px)",
                        boxShadow: "0 14px 24px rgba(15, 23, 42, 0.10)",
                        borderColor: "#94a3b8",
                      },
                    }}
                  >
                    <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                      แบงก์
                    </Typography>

                    <Typography fontSize={24} fontWeight={900} lineHeight={1}>
                      {value}
                    </Typography>

                    {cashCounts[value] > 0 && (
                      <Chip
                        label={`${cashCounts[value]} ใบ`}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          borderRadius: 999,
                          fontWeight: 800,
                          bgcolor: "#111827",
                          color: "#fff",
                        }}
                      />
                    )}
                  </Button>
                ))}
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} mt={1.6}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AutoAwesomeRoundedIcon />}
                  onClick={setExactCash}
                  sx={{
                    borderRadius: 3,
                    py: 1.15,
                    fontWeight: 800,
                    textTransform: "none",
                    background: "linear-gradient(135deg, #111827 0%, #000 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #000 0%, #111827 100%)",
                    },
                  }}
                >
                  รับเงินพอดี
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RestartAltRoundedIcon />}
                  onClick={resetCash}
                  sx={{
                    borderRadius: 3,
                    py: 1.15,
                    fontWeight: 800,
                    textTransform: "none",
                    borderColor: "#d1d5db",
                    color: "#111827",
                    "&:hover": {
                      borderColor: "#9ca3af",
                      background: "#f9fafb",
                    },
                  }}
                >
                  ล้างเงินสด
                </Button>
              </Stack>

              <Box
                sx={{
                  mt: 1.8,
                  p: 1.8,
                  borderRadius: 4,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                }}
              >
                <Typography fontWeight={800} mb={1.1}>
                  สรุปแบงก์ที่รับ
                </Typography>

                <Stack spacing={1}>
                  {CASH_TYPES.some((value) => cashCounts[value] > 0) ? (
                    CASH_TYPES.filter((value) => cashCounts[value] > 0).map(
                      (value) => (
                        <Stack
                          key={value}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography color="text.secondary">
                            {value} × {cashCounts[value]}
                          </Typography>
                          <Typography fontWeight={800}>
                            {formatCurrency(value * cashCounts[value])}
                          </Typography>
                        </Stack>
                      )
                    )
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      ยังไม่ได้เลือกแบงก์
                    </Typography>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {paymentMethod === "transfer" && (
            <Box
              sx={{
                p: 2.2,
                borderRadius: 4,
                border: "1px solid #e5e7eb",
                bgcolor: "#fff",
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box
                  sx={{
                    width: { xs: "100%", sm: 280 },
                    minHeight: 280,
                    borderRadius: 4,
                    border: "1px solid #e5e7eb",
                    bgcolor: "#fafafa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {isGeneratingQr ? (
                    <Typography color="text.secondary">
                      กำลังสร้าง QR...
                    </Typography>
                  ) : qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="PromptPay QR"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  ) : (
                    <Stack alignItems="center" spacing={1}>
                      <QrCode2RoundedIcon
                        sx={{ fontSize: 48, color: "#9ca3af" }}
                      />
                      <Typography color="text.secondary">ไม่พบ QR</Typography>
                    </Stack>
                  )}
                </Box>

                <Box flex={1}>
                  <Typography fontWeight={900} mb={1}>
                    โอนเงินผ่าน PromptPay
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    พร้อมเพย์: {PROMPTPAY_ID}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    จำนวนเงิน: {formatCurrency(total)}
                  </Typography>

                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      bgcolor: "#eff6ff",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <Typography fontSize={13} color="#1d4ed8" fontWeight={700}>
                      สแกน QR แล้วกด “ยืนยันการชำระเงิน”
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 2,
            display: "block",
            position: "sticky",
            bottom: 0,
            background: "#fff",
            borderTop: "1px solid #e5e7eb",
            zIndex: 2,
          }}
        >
          {paymentMethod === "cash" && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 4,
                border: "1px solid #e5e7eb",
                background: change >= 0 ? "#f0fdf4" : "#fef2f2",
              }}
            >
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">รับเงิน</Typography>
                <Typography fontWeight={800}>
                  {formatCurrency(received)}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">ยอดชำระ</Typography>
                <Typography fontWeight={800}>
                  {formatCurrency(total)}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontSize={18} fontWeight={900}>
                  {change >= 0 ? "เงินทอน" : "ขาดอีก"}
                </Typography>
                <Typography
                  fontSize={22}
                  fontWeight={900}
                  color={change >= 0 ? "success.main" : "error.main"}
                >
                  {formatCurrency(Math.abs(change))}
                </Typography>
              </Stack>
            </Box>
          )}

          <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
            {!paid ? (
              <>
                <Button
                  onClick={handleCloseCheckout}
                  sx={{
                    borderRadius: 3,
                    px: 2.5,
                    fontWeight: 700,
                  }}
                >
                  ยกเลิก
                </Button>

                <Button
                  variant="contained"
                  onClick={handleConfirmPayment}
                  disabled={paymentMethod === "cash" && !isEnoughCash}
                  sx={{
                    borderRadius: 3,
                    px: 2.5,
                    fontWeight: 800,
                    textTransform: "none",
                    background: "#111827",
                  }}
                >
                  ยืนยันการชำระเงิน
                </Button>
              </>
            ) : (
              <>
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

                <Button
                  variant="contained"
                  onClick={handleFinishSale}
                  sx={{
                    borderRadius: 3,
                    px: 2.5,
                    fontWeight: 800,
                    textTransform: "none",
                    background: "#111827",
                  }}
                >
                  จบการขาย
                </Button>
              </>
            )}
          </Stack>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={SlideDownTransition}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{
            width: "100%",
            minWidth: { xs: "calc(100vw - 24px)", sm: 420 },
            borderRadius: 3,
            fontWeight: 700,
            boxShadow: "0 16px 36px rgba(15, 23, 42, 0.18)",
            alignItems: "center",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}