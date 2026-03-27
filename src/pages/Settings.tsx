"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  MenuItem,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

type PosSettings = {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  taxId: string;
  currency: "THB" | "USD" | "EUR";
  vat: number;
  receiptFooter: string;
  promptPayId: string;
  enableCash: boolean;
  enableTransfer: boolean;
  autoPrintReceipt: boolean;
  printerPaperSize: "58mm" | "80mm";
};

const STORAGE_KEY = "quickpos_settings";

const defaultSettings: PosSettings = {
  shopName: "ร้านของฉัน",
  shopAddress: "",
  shopPhone: "",
  taxId: "",
  currency: "THB",
  vat: 7,
  receiptFooter: "ขอบคุณที่ใช้บริการ",
  promptPayId: "",
  enableCash: true,
  enableTransfer: true,
  autoPrintReceipt: false,
  printerPaperSize: "80mm",
};

export default function Settings() {
  const [settings, setSettings] = useState<PosSettings>(defaultSettings);
  const [openSaved, setOpenSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error("โหลด settings ไม่สำเร็จ:", error);
    }
  }, []);

  const currencyLabel = useMemo(() => {
    if (settings.currency === "THB") return "บาท (฿)";
    if (settings.currency === "USD") return "ดอลลาร์ ($)";
    return "ยูโร (€)";
  }, [settings.currency]);

  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setOpenSaved(true);
    } catch (error) {
      console.error("บันทึก settings ไม่สำเร็จ:", error);
      alert("ไม่สามารถบันทึกการตั้งค่าได้");
    }
  };

  const resetSettings = () => {
    const confirmed = window.confirm("ต้องการรีเซ็ตการตั้งค่ากลับค่าเริ่มต้นหรือไม่?");
    if (!confirmed) return;

    setSettings(defaultSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    setOpenSaved(true);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: "100%",
        background: "linear-gradient(180deg, #fafafa 0%, #f4f6f8 100%)",
      }}
    >
      {/* Header */}
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
              <SettingsRoundedIcon />
            </Avatar>

            <Box>
              <Typography variant="h5" fontWeight={800}>
                ตั้งค่าระบบ
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.82 }}>
                สำหรับโปรแกรมขายหน้าร้านแบบออฟไลน์ / desktop POS
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={`สกุลเงิน: ${currencyLabel}`}
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
        gridTemplateColumns={{ xs: "1fr", xl: "1.2fr 0.8fr" }}
        gap={2}
      >
        {/* Left */}
        <Stack spacing={2}>
          {/* Store info */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 5,
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <SectionHeader
                icon={<StoreRoundedIcon />}
                title="ข้อมูลร้าน"
                subtitle="ข้อมูลพื้นฐานที่ใช้แสดงในระบบและบนใบเสร็จ"
              />

              <Box sx={{ p: 3 }}>
                <Stack spacing={2.2}>
                  <TextField
                    label="ชื่อร้าน"
                    value={settings.shopName}
                    onChange={(e) =>
                      setSettings({ ...settings, shopName: e.target.value })
                    }
                    fullWidth
                    sx={inputSx}
                  />

                  <TextField
                    label="ที่อยู่ร้าน"
                    multiline
                    rows={3}
                    value={settings.shopAddress}
                    onChange={(e) =>
                      setSettings({ ...settings, shopAddress: e.target.value })
                    }
                    fullWidth
                    sx={inputSx}
                  />

                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
                    gap={2}
                  >
                    <TextField
                      label="เบอร์โทรร้าน"
                      value={settings.shopPhone}
                      onChange={(e) =>
                        setSettings({ ...settings, shopPhone: e.target.value })
                      }
                      fullWidth
                      sx={inputSx}
                    />

                    <TextField
                      label="เลขประจำตัวผู้เสียภาษี"
                      value={settings.taxId}
                      onChange={(e) =>
                        setSettings({ ...settings, taxId: e.target.value })
                      }
                      fullWidth
                      sx={inputSx}
                    />
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Receipt */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 5,
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <SectionHeader
                icon={<ReceiptLongRoundedIcon />}
                title="ตั้งค่าใบเสร็จ"
                subtitle="ข้อมูลการพิมพ์และข้อความท้ายใบเสร็จ"
              />

              <Box sx={{ p: 3 }}>
                <Stack spacing={2.2}>
                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
                    gap={2}
                  >
                    <TextField
                      select
                      label="ขนาดกระดาษ"
                      value={settings.printerPaperSize}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          printerPaperSize: e.target.value as "58mm" | "80mm",
                        })
                      }
                      fullWidth
                      sx={inputSx}
                    >
                      <MenuItem value="58mm">58 mm</MenuItem>
                      <MenuItem value="80mm">80 mm</MenuItem>
                    </TextField>

                    <TextField
                      select
                      label="สกุลเงิน"
                      value={settings.currency}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          currency: e.target.value as "THB" | "USD" | "EUR",
                        })
                      }
                      fullWidth
                      sx={inputSx}
                    >
                      <MenuItem value="THB">บาท (฿)</MenuItem>
                      <MenuItem value="USD">ดอลลาร์ ($)</MenuItem>
                      <MenuItem value="EUR">ยูโร (€)</MenuItem>
                    </TextField>
                  </Box>

                  <TextField
                    label="ข้อความท้ายใบเสร็จ"
                    multiline
                    rows={2}
                    value={settings.receiptFooter}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        receiptFooter: e.target.value,
                      })
                    }
                    fullWidth
                    sx={inputSx}
                  />
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 5,
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <SectionHeader
                icon={<PaymentsRoundedIcon />}
                title="การชำระเงิน"
                subtitle="ตั้งค่าวิธีรับชำระและภาษีมูลค่าเพิ่ม"
              />

              <Box sx={{ p: 3 }}>
                <Stack spacing={2.2}>
                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
                    gap={2}
                  >
                    <TextField
                      label="VAT (%)"
                      type="number"
                      value={settings.vat}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          vat: Number(e.target.value),
                        })
                      }
                      fullWidth
                      sx={inputSx}
                    />

                    <TextField
                      label="พร้อมเพย์ / เบอร์รับโอน"
                      value={settings.promptPayId}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          promptPayId: e.target.value,
                        })
                      }
                      fullWidth
                      sx={inputSx}
                    />
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      border: "1px solid #e5e7eb",
                      background: "#fafafa",
                    }}
                  >
                    <Stack spacing={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.enableCash}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                enableCash: e.target.checked,
                              })
                            }
                          />
                        }
                        label="เปิดใช้งานการชำระแบบเงินสด"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.enableTransfer}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                enableTransfer: e.target.checked,
                              })
                            }
                          />
                        }
                        label="เปิดใช้งานการชำระแบบโอนเงิน"
                      />
                    </Stack>
                  </Paper>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        {/* Right */}
        <Stack spacing={2}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 5,
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <SectionHeader
                icon={<PrintRoundedIcon />}
                title="ตัวเลือกโปรแกรมเดสก์ท็อป"
                subtitle="ตั้งค่าที่เหมาะกับการใช้งานหน้าร้าน"
              />

              <Box sx={{ p: 3 }}>
                <Stack spacing={1.2}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoPrintReceipt}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              autoPrintReceipt: e.target.checked,
                            })
                          }
                        />
                      }
                      label="พิมพ์ใบเสร็จอัตโนมัติหลังชำระเงิน"
                    />
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      border: "1px solid #e5e7eb",
                      background:
                        "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                    }}
                  >
                    <Typography fontWeight={800} mb={1}>
                      สรุปการตั้งค่าปัจจุบัน
                    </Typography>

                    <Stack spacing={1}>
                      <InfoRow label="ชื่อร้าน" value={settings.shopName || "-"} />
                      <InfoRow label="สกุลเงิน" value={currencyLabel} />
                      <InfoRow
                        label="ภาษีมูลค่าเพิ่ม"
                        value={`${settings.vat}%`}
                      />
                      <InfoRow
                        label="ขนาดกระดาษ"
                        value={settings.printerPaperSize}
                      />
                      <InfoRow
                        label="เงินสด"
                        value={settings.enableCash ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      />
                      <InfoRow
                        label="โอนเงิน"
                        value={
                          settings.enableTransfer ? "เปิดใช้งาน" : "ปิดใช้งาน"
                        }
                      />
                    </Stack>
                  </Paper>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: 5,
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography fontWeight={800} color="#111827" mb={1.2}>
                การจัดการข้อมูล
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={2}>
                การตั้งค่าจะถูกบันทึกไว้ในเครื่องนี้ เหมาะกับการใช้งานแบบออฟไลน์บนโปรแกรมเดสก์ท็อป
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<SaveRoundedIcon />}
                  onClick={saveSettings}
                  sx={{
                    borderRadius: 4,
                    py: 1.4,
                    fontWeight: 800,
                    textTransform: "none",
                    background:
                      "linear-gradient(135deg, #111827 0%, #000000 100%)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.16)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #000000 0%, #111827 100%)",
                    },
                  }}
                >
                  บันทึกการตั้งค่า
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<RestartAltRoundedIcon />}
                  onClick={resetSettings}
                  sx={{
                    borderRadius: 4,
                    py: 1.4,
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
                  รีเซ็ตค่าเริ่มต้น
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <Snackbar
        open={openSaved}
        autoHideDuration={2500}
        onClose={() => setOpenSaved(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenSaved(false)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 3 }}
        >
          บันทึกการตั้งค่าเรียบร้อยแล้ว
        </Alert>
      </Snackbar>
    </Box>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <>
      <Box
        sx={{
          px: 3,
          py: 2.2,
          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 42,
              height: 42,
              borderRadius: 3,
              bgcolor: "#f3f4f6",
              color: "#374151",
            }}
          >
            {icon}
          </Avatar>

          <Box>
            <Typography fontSize={18} fontWeight={800} color="#111827">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={700} color="#111827" textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 4,
    backgroundColor: "#fff",
  },
};