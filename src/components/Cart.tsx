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

import type {
  CartItem,
  Order,
  OrderCreatePayload,
  PaymentMethod,
  PosSettings,
  CustomerDisplayPayload,
} from "../types/pos";
import { formatCurrency } from "../utils/format";

const drawerWidth = 360;
const CASH_TYPES = [20, 50, 100, 500, 1000];

const defaultSettings: PosSettings = {
  shopName: "QuickPOS Store",
  receiptFooter: "ขอบคุณที่ใช้บริการ",
  receiptHeaderNote: "ใบเสร็จรับเงิน / ใบกำกับอย่างย่อ",
  printerPaperSize: "80mm",
  copyCount: 1,
  promptPayId: "",
  enableCash: true,
  enableTransfer: true,
  autoPrintReceipt: false,
  showPrintPreview: true,
  soundOnCheckout: true,
};

interface CartProps {
  cart: CartItem[];
  removeItem: (id: number | string) => void;
  clearCart?: () => void;
  onCheckoutSuccess?: (order: Order) => void;
}

function SlideDownTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatReceiptNo(orderId: number, date?: string | Date) {
  const d = date ? new Date(date) : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const running = String(orderId).padStart(6, "0");

  return `RC-${yyyy}${mm}${dd}-${running}`;
}

function formatPreviewReceiptNo(date?: Date) {
  const d = date ?? new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `RC-${yyyy}${mm}${dd}-PREVIEW`;
}

export default function Cart({
  cart,
  removeItem,
  clearCart,
  onCheckoutSuccess,
}: CartProps) {
  const [settings, setSettings] = useState<PosSettings>(defaultSettings);
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
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [savedOrder, setSavedOrder] = useState<Order | null>(null);

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
  const hasSelectedCash = Object.values(cashCounts).some((qty) => qty > 0);

  const canConfirmPayment =
    !isSavingOrder &&
    !paid &&
    ((paymentMethod === "cash" &&
      settings.enableCash &&
      hasSelectedCash &&
      isEnoughCash) ||
      (paymentMethod === "transfer" && settings.enableTransfer));

  const summaryTone =
    paymentMethod === "cash"
      ? isEnoughCash
        ? {
            bg: "#f0fdf4",
            border: "#bbf7d0",
            primary: "#166534",
            secondary: "#16a34a",
          }
        : {
            bg: "#fef2f2",
            border: "#fecaca",
            primary: "#991b1b",
            secondary: "#dc2626",
          }
      : {
          bg: "#f0fdf4",
          border: "#bbf7d0",
          primary: "#166534",
          secondary: "#16a34a",
        };

  const previewReceiptNo = useMemo(() => {
    return receiptNo || formatPreviewReceiptNo();
  }, [receiptNo]);

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

  const loadSettings = async () => {
    try {
      const data = await window.pos.getSettings();
      setSettings(data);
      return data;
    } catch (error) {
      console.error("โหลด settings สำหรับ cart ไม่สำเร็จ:", error);
      showSnackbar("โหลดการตั้งค่าไม่สำเร็จ", "error");
      return null;
    }
  };

  const buildCustomerDisplayPayload = (
    state?: Partial<CustomerDisplayPayload>
  ): CustomerDisplayPayload => {
    return {
      mode: "transfer",
      shopName: settings.shopName,
      receiptHeaderNote: settings.receiptHeaderNote,
      receiptNo: previewReceiptNo,
      promptPayId: settings.promptPayId,
      total,
      qrDataUrl,
      ...state,
    };
  };

  const openTransferCustomerDisplay = async (
    override?: Partial<CustomerDisplayPayload>
  ) => {
    try {
      await window.pos.openCustomerDisplay(
        buildCustomerDisplayPayload(override)
      );
    } catch (error) {
      console.error("เปิดหน้าจอลูกค้าไม่สำเร็จ:", error);
    }
  };

  const updateTransferCustomerDisplay = async (
    override?: Partial<CustomerDisplayPayload>
  ) => {
    try {
      await window.pos.updateCustomerDisplay(
        buildCustomerDisplayPayload(override)
      );
    } catch (error) {
      console.error("อัปเดตหน้าจอลูกค้าไม่สำเร็จ:", error);
    }
  };

  const closeCustomerDisplay = async () => {
    try {
      await window.pos.closeCustomerDisplay();
    } catch (error) {
      console.error("ปิดหน้าจอลูกค้าไม่สำเร็จ:", error);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  useEffect(() => {
    if (!openCheckout) {
      setReceiptNo("");
      return;
    }

    setReceiptNo("");
  }, [openCheckout]);

  useEffect(() => {
    const generateQr = async () => {
      if (!openCheckout || paymentMethod !== "transfer" || total <= 0) {
        setQrDataUrl("");
        return;
      }

      if (!settings.promptPayId) {
        setQrDataUrl("");
        return;
      }

      try {
        setIsGeneratingQr(true);
        const payload = generatePayload(settings.promptPayId, {
          amount: total,
        });
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

    void generateQr();
  }, [openCheckout, paymentMethod, total, settings.promptPayId]);

  useEffect(() => {
    if (!openCheckout) {
      void closeCustomerDisplay();
      return;
    }

    if (paymentMethod === "transfer" && settings.enableTransfer) {
      void openTransferCustomerDisplay();
      return;
    }

    void closeCustomerDisplay();
  }, [openCheckout, paymentMethod, settings.enableTransfer]);

  useEffect(() => {
    if (!openCheckout || paymentMethod !== "transfer") return;
    void updateTransferCustomerDisplay();
  }, [
    qrDataUrl,
    previewReceiptNo,
    total,
    settings.shopName,
    settings.receiptHeaderNote,
    settings.promptPayId,
    paymentMethod,
    openCheckout,
  ]);

  useEffect(() => {
    return () => {
      void closeCustomerDisplay();
    };
  }, []);

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

  const resetCheckoutState = (nextSettings?: PosSettings) => {
    const activeSettings = nextSettings ?? settings;

    if (activeSettings.enableCash) {
      setPaymentMethod("cash");
    } else if (activeSettings.enableTransfer) {
      setPaymentMethod("transfer");
    } else {
      setPaymentMethod("cash");
    }

    resetCash();
    setQrDataUrl("");
    setPaid(false);
    setIsSavingOrder(false);
    setSavedOrder(null);
    setReceiptNo("");
  };

  const handleOpenCheckout = async () => {
    if (cart.length === 0) {
      showSnackbar("ไม่มีสินค้าในตะกร้า", "warning");
      return;
    }

    const latestSettings = await loadSettings();
    if (!latestSettings) return;

    if (!latestSettings.enableCash && !latestSettings.enableTransfer) {
      showSnackbar("ยังไม่ได้เปิดวิธีชำระเงินในหน้า Settings", "warning");
      return;
    }

    resetCheckoutState(latestSettings);
    setOpenCheckout(true);
  };

  const handleCloseCheckout = () => {
    setOpenCheckout(false);
    resetCheckoutState();
    void closeCustomerDisplay();
  };

  const playSuccessBeep = async () => {
    if (!settings.soundOnCheckout) return;

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
    const receiptOrder = savedOrder;
    const receiptItems = receiptOrder?.products ?? [];
    const paperWidth = settings.printerPaperSize === "58mm" ? "58mm" : "80mm";

    const paidAmount =
      receiptOrder?.paymentMethod === "cash"
        ? receiptOrder.receivedAmount
        : receiptOrder?.total ?? total;

    const changeAmount =
      receiptOrder?.paymentMethod === "cash" ? receiptOrder.change : 0;

    const paidLabel =
      receiptOrder?.paymentMethod === "cash" ? "เงินสด" : "โอนเงิน";

    const finalReceiptNo =
      receiptOrder?.id != null
        ? formatReceiptNo(receiptOrder.id, receiptOrder.date)
        : previewReceiptNo;

    const receiptDate =
      receiptOrder?.date != null
        ? new Date(receiptOrder.date).toLocaleString("th-TH")
        : new Date().toLocaleString("th-TH");

    const itemsHtml = receiptItems
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
            width: ${paperWidth};
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
            white-space: pre-wrap;
          }
          @media print {
            @page { size: ${paperWidth} auto; margin: 0; }
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center">
            <div class="title">${escapeHtml(settings.shopName)}</div>
            <div class="muted">${escapeHtml(settings.receiptHeaderNote)}</div>
            <div class="muted">เลขที่: ${escapeHtml(finalReceiptNo)}</div>
            <div class="muted">${escapeHtml(receiptDate)}</div>
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

          <div class="summary-row"><span>จำนวนสินค้า</span><span>${
            receiptOrder?.items ?? totalQty
          } ชิ้น</span></div>
          <div class="summary-row total"><span>ยอดรวม</span><span>${formatCurrency(
            receiptOrder?.total ?? total
          )}</span></div>
          <div class="summary-row"><span>วิธีชำระ</span><span>${paidLabel}</span></div>
          <div class="summary-row"><span>รับเงิน</span><span>${formatCurrency(
            paidAmount
          )}</span></div>
          <div class="summary-row"><span>เงินทอน</span><span>${formatCurrency(
            changeAmount
          )}</span></div>

          <div class="divider"></div>
          <div class="footer">${escapeHtml(settings.receiptFooter)}</div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintReceipt = () => {
    if (!savedOrder) {
      showSnackbar("กรุณายืนยันการชำระเงินก่อน", "warning");
      return;
    }

    const copies = Math.max(1, settings.copyCount);

    for (let i = 0; i < copies; i += 1) {
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

        if (!settings.showPrintPreview) {
          receiptWindow.close();
        }
      };
    }

    showSnackbar("เปิดหน้าพิมพ์ใบเสร็จแล้ว", "success");
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === "cash" && !settings.enableCash) {
      showSnackbar("ยังไม่ได้เปิดการชำระเงินสด", "warning");
      return;
    }

    if (paymentMethod === "transfer" && !settings.enableTransfer) {
      showSnackbar("ยังไม่ได้เปิดการชำระแบบโอนเงิน", "warning");
      return;
    }

    if (paymentMethod === "transfer" && !settings.promptPayId) {
      showSnackbar("กรุณาตั้งค่า PromptPay ก่อนใช้งาน", "warning");
      return;
    }

    if (paymentMethod === "cash" && !hasSelectedCash) {
      showSnackbar("กรุณาเลือกแบงก์ที่ลูกค้าจ่าย", "warning");
      return;
    }

    if (paymentMethod === "cash" && !isEnoughCash) {
      showSnackbar("จำนวนเงินสดไม่พอ", "error");
      return;
    }

    try {
      setIsSavingOrder(true);

      const payload: OrderCreatePayload = {
        date: new Date().toLocaleString("sv-SE").replace("T", " ").slice(0, 16),
        items: totalQty,
        total,
        paymentMethod,
        receivedAmount: paymentMethod === "cash" ? received : total,
        change: paymentMethod === "cash" ? Math.max(change, 0) : 0,
        products: cart.map((item) => ({
          id: Number(item.id),
          name: item.name,
          qty: item.qty,
          price: Number(item.price),
        })),
      };

      const createdOrder = await window.pos.createOrder(payload);
      const nextReceiptNo = formatReceiptNo(createdOrder.id, createdOrder.date);

      setReceiptNo(nextReceiptNo);
      setSavedOrder(createdOrder);
      onCheckoutSuccess?.(createdOrder);

      setPaid(true);
      await playSuccessBeep();
      await closeCustomerDisplay();

      if (settings.autoPrintReceipt) {
        setTimeout(() => {
          handlePrintReceipt();
        }, 150);
      }

      showSnackbar(
        paymentMethod === "cash"
          ? `ชำระเงินสำเร็จ รับเงิน ${formatCurrency(
              createdOrder.receivedAmount
            )} เงินทอน ${formatCurrency(createdOrder.change)}`
          : "ชำระเงินสำเร็จ (โอนเงิน)",
        "success"
      );
    } catch (error) {
      console.error("Checkout failed:", error);
      showSnackbar(
        error instanceof Error ? error.message : "บันทึกออเดอร์ไม่สำเร็จ",
        "error"
      );
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleFinishSale = () => {
    if (!savedOrder) {
      showSnackbar("ยังไม่มีข้อมูลออเดอร์", "warning");
      return;
    }

    if (!settings.autoPrintReceipt) {
      handlePrintReceipt();
    }

    clearCart?.();
    handleCloseCheckout();
    showSnackbar("จบการขายเรียบร้อย", "success");
  };

  const cashButtonLabel = (value: number) => {
    return `${value}`;
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
                          ราคารวม
                        </Typography>
                        <Typography
                          fontSize={18}
                          fontWeight={900}
                          color="#111827"
                        >
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

        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #e5e7eb",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, #ffffff 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 4,
              border: "1px solid #e5e7eb",
              background:
                "linear-gradient(135deg, #111827 0%, #1f2937 55%, #374151 100%)",
              color: "#fff",
              mb: 1.5,
            }}
          >
            <Stack direction="row" justifyContent="space-between" mb={0.8}>
              <Typography sx={{ opacity: 0.86 }}>จำนวนสินค้า</Typography>
              <Typography fontWeight={800}>{totalQty} ชิ้น</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography fontSize={18} fontWeight={900}>
                ยอดรวม
              </Typography>
              <Typography fontSize={22} fontWeight={900}>
                {formatCurrency(total)}
              </Typography>
            </Stack>
          </Paper>

          <Button
            fullWidth
            onClick={handleOpenCheckout}
            disabled={cart.length === 0}
            startIcon={<PaymentsRoundedIcon />}
            sx={{
              borderRadius: 4,
              py: 1.5,
              fontWeight: 900,
              textTransform: "none",
              color: "#fff",
              background: "linear-gradient(135deg, #111827 0%, #000 100%)",
              boxShadow: "0 14px 28px rgba(15, 23, 42, 0.18)",
              "&:hover": {
                background: "linear-gradient(135deg, #000 0%, #111827 100%)",
              },
              "&.Mui-disabled": {
                color: "#9ca3af",
                background: "#e5e7eb",
                boxShadow: "none",
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
        keepMounted
        TransitionComponent={SlideDownTransition}
        BackdropProps={{
          timeout: 280,
          sx: {
            background:
              "linear-gradient(180deg, rgba(2,6,23,0.34) 0%, rgba(15,23,42,0.46) 100%)",
            backdropFilter: "blur(14px) saturate(125%)",
            WebkitBackdropFilter: "blur(14px) saturate(125%)",
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: 6,
            overflow: "hidden",
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.55)",
            boxShadow: "0 32px 90px rgba(15, 23, 42, 0.30)",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2.5,
            background:
              "linear-gradient(135deg, rgba(17,24,39,0.96) 0%, rgba(31,41,55,0.94) 55%, rgba(55,65,81,0.92) 100%)",
            color: "#fff",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
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
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <PointOfSaleRoundedIcon />
            </Avatar>

            <Box>
              <Typography fontSize={22} fontWeight={900}>
                ชำระเงิน
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.82 }}>
                เลขที่ใบเสร็จ {previewReceiptNo}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
            background:
              "linear-gradient(180deg, rgba(248,250,252,0.72) 0%, rgba(255,255,255,0.82) 100%)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={paymentMethod}
            onChange={(_, value) => {
              if (!value || paid) return;
              if (value === "cash" && !settings.enableCash) return;
              if (value === "transfer" && !settings.enableTransfer) return;
              setPaymentMethod(value);
            }}
            sx={{
              mt: 1.5,
              mb: 1.5,
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 1.25,
              background: "transparent",
              "& .MuiToggleButtonGroup-grouped": {
                m: "0 !important",
                borderRadius: "16px !important",
                border: "1px solid #d1d5db !important",
              },
              "& .MuiToggleButton-root": {
                py: 1.25,
                textTransform: "none",
                fontWeight: 800,
                color: "#374151",
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              },
              "& .Mui-selected": {
                background: "#111827 !important",
                color: "#fff !important",
                borderColor: "#111827 !important",
              },
            }}
          >
            <ToggleButton value="cash" disabled={!settings.enableCash || paid}>
              <PaymentsRoundedIcon sx={{ mr: 1 }} />
              เงินสด
            </ToggleButton>
            <ToggleButton
              value="transfer"
              disabled={!settings.enableTransfer || paid}
            >
              <AccountBalanceRoundedIcon sx={{ mr: 1 }} />
              โอนเงิน
            </ToggleButton>
          </ToggleButtonGroup>

          {paymentMethod === "cash" && settings.enableCash && (
            <>
              <Box
                sx={{
                  mb: 1.3,
                  p: 1.6,
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg, #eef6ff 0%, #f8fbff 100%)",
                  border: "1px solid #dbeafe",
                  boxShadow: "0 12px 24px rgba(59,130,246,0.08)",
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
                gridTemplateColumns={{
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                }}
                gap={1.25}
              >
                {CASH_TYPES.map((value) => {
                  const qty = cashCounts[value];
                  return (
                    <Button
                      key={value}
                      onClick={() => addCash(value)}
                      disabled={paid}
                      sx={{
                        minHeight: 74,
                        borderRadius: 4,
                        border: "1px solid #dbe1ea",
                        background: "#fff",
                        color: "#111827",
                        textTransform: "none",
                        px: 1.5,
                        py: 1.4,
                        justifyContent: "space-between",
                        boxShadow: "0 10px 22px rgba(15,23,42,0.05)",
                        "&:hover": {
                          background: "#f8fafc",
                          borderColor: "#cbd5e1",
                        },
                        "&.Mui-disabled": {
                          background: "#f8fafc",
                          color: "#9ca3af",
                        },
                      }}
                    >
                      <Stack width="100%" alignItems="flex-start" spacing={0.3}>
                        <Typography fontWeight={900} fontSize={18}>
                          {cashButtonLabel(value)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          เพิ่มเงินสด
                        </Typography>
                      </Stack>

                      <Chip
                        label={`x${qty}`}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          borderRadius: 999,
                          px: 0.75,
                          bgcolor: qty > 0 ? "#111827" : "#eef2f7",
                          color: qty > 0 ? "#fff" : "#64748b",
                        }}
                      />
                    </Button>
                  );
                })}
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                mt={1.6}
              >
                <Button
                  fullWidth
                  onClick={setExactCash}
                  disabled={paid}
                  startIcon={<AutoAwesomeRoundedIcon />}
                  sx={{
                    py: 1.2,
                    borderRadius: 4,
                    fontWeight: 800,
                    textTransform: "none",
                    color: "#111827",
                    background: "#fff",
                    border: "1px solid #dbe1ea",
                  }}
                >
                  คำนวณเงินสดพอดี
                </Button>

                <Button
                  fullWidth
                  onClick={resetCash}
                  disabled={paid}
                  startIcon={<RestartAltRoundedIcon />}
                  sx={{
                    py: 1.2,
                    borderRadius: 4,
                    fontWeight: 800,
                    textTransform: "none",
                    color: "#991b1b",
                    background: "#fff",
                    border: "1px solid #fecaca",
                  }}
                >
                  รีเซ็ตเงินสด
                </Button>
              </Stack>
            </>
          )}

          {paymentMethod === "transfer" && settings.enableTransfer && (
            <Box
              sx={{
                mt: 0.5,
                p: 2,
                borderRadius: 4,
                background: "rgba(255,255,255,0.82)",
                border: "1px solid #e5e7eb",
                boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
              }}
            >
              <Stack spacing={1.6} alignItems="center">
                <Avatar
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: 3,
                    bgcolor: "#ecfeff",
                    color: "#0891b2",
                  }}
                >
                  <QrCode2RoundedIcon />
                </Avatar>

                <Box textAlign="center">
                  <Typography fontWeight={900}>ชำระผ่าน PromptPay</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {settings.promptPayId || "ยังไม่ได้ตั้งค่า PromptPay"}
                  </Typography>
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    width: "100%",
                    p: 2,
                    borderRadius: 4,
                    border: "1px dashed #d1d5db",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 320,
                  }}
                >
                  {!settings.promptPayId ? (
                    <Typography color="error.main" textAlign="center">
                      กรุณาตั้งค่า PromptPay ในหน้า Settings ก่อน
                    </Typography>
                  ) : isGeneratingQr ? (
                    <Typography color="text.secondary">กำลังสร้าง QR...</Typography>
                  ) : qrDataUrl ? (
                    <Box
                      component="img"
                      src={qrDataUrl}
                      alt="PromptPay QR"
                      sx={{
                        width: "100%",
                        maxWidth: 280,
                        display: "block",
                        borderRadius: 3,
                      }}
                    />
                  ) : (
                    <Typography color="text.secondary">ไม่สามารถสร้าง QR ได้</Typography>
                  )}
                </Paper>
              </Stack>
            </Box>
          )}

          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 4,
              background: summaryTone.bg,
              border: `1px solid ${summaryTone.border}`,
              boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography color={summaryTone.primary}>รับเงิน</Typography>
              <Typography fontWeight={900} color={summaryTone.primary}>
                {formatCurrency(paymentMethod === "cash" ? received : total)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography color={summaryTone.primary}>ยอดชำระ</Typography>
              <Typography fontWeight={900} color={summaryTone.primary}>
                {formatCurrency(total)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography color={summaryTone.secondary} fontWeight={800}>
                เงินทอน
              </Typography>
              <Typography
                fontSize={20}
                fontWeight={900}
                color={summaryTone.secondary}
              >
                {formatCurrency(paymentMethod === "cash" ? Math.max(change, 0) : 0)}
              </Typography>
            </Stack>
          </Box>

          {paid && savedOrder && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 4,
                bgcolor: "#f0fdf4",
                border: "1px solid #bbf7d0",
              }}
            >
              <Typography fontWeight={900} color="#166534">
                บันทึกการขายเรียบร้อย
              </Typography>
              <Typography variant="body2" color="#166534" mt={0.5}>
                เลขที่ใบเสร็จ {formatReceiptNo(savedOrder.id, savedOrder.date)}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.2,
            borderTop: "1px solid rgba(229,231,235,0.85)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.94) 100%)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <Stack
            width="100%"
            direction={{ xs: "column", sm: "row" }}
            spacing={1.2}
            justifyContent="space-between"
          >
            <Button
              onClick={handleCloseCheckout}
              disabled={isSavingOrder}
              sx={{
                minWidth: 130,
                py: 1.2,
                borderRadius: 4,
                fontWeight: 800,
                textTransform: "none",
                color: "#374151",
                background: "#fff",
                border: "1px solid #d1d5db",
              }}
            >
              ปิด
            </Button>

            {!paid ? (
              <Button
                onClick={handleConfirmPayment}
                disabled={!canConfirmPayment}
                startIcon={<PaymentsRoundedIcon />}
                sx={{
                  minWidth: 170,
                  py: 1.2,
                  borderRadius: 4,
                  fontWeight: 900,
                  textTransform: "none",
                  color: "#fff",
                  background:
                    "linear-gradient(135deg, #111827 0%, #000000 100%)",
                  boxShadow: "0 14px 28px rgba(15,23,42,0.16)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #000000 0%, #111827 100%)",
                  },
                  "&.Mui-disabled": {
                    color: "#9ca3af",
                    background: "#e5e7eb",
                    boxShadow: "none",
                  },
                }}
              >
                {isSavingOrder ? "กำลังบันทึก..." : "ยืนยันการชำระเงิน"}
              </Button>
            ) : (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.2}
                width={{ xs: "100%", sm: "auto" }}
              >
                <Button
                  onClick={handlePrintReceipt}
                  startIcon={<PrintRoundedIcon />}
                  sx={{
                    minWidth: 150,
                    py: 1.2,
                    borderRadius: 4,
                    fontWeight: 800,
                    textTransform: "none",
                    color: "#111827",
                    background: "#fff",
                    border: "1px solid #d1d5db",
                  }}
                >
                  พิมพ์ใบเสร็จ
                </Button>

                <Button
                  onClick={handleFinishSale}
                  startIcon={<PointOfSaleRoundedIcon />}
                  sx={{
                    minWidth: 170,
                    py: 1.2,
                    borderRadius: 4,
                    fontWeight: 900,
                    textTransform: "none",
                    color: "#fff",
                    background:
                      "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    boxShadow: "0 14px 28px rgba(22,163,74,0.18)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                    },
                  }}
                >
                  จบการขาย
                </Button>
              </Stack>
            )}
          </Stack>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 3,
            fontWeight: 700,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}