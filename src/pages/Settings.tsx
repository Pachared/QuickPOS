"use client";

import { useEffect, useState } from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";

type PosSettings = {
  receiptFooter: string;
  receiptHeaderNote: string;
  printerPaperSize: "58mm" | "80mm";
  copyCount: number;
  promptPayId: string;
  enableCash: boolean;
  enableTransfer: boolean;
  autoPrintReceipt: boolean;
  showPrintPreview: boolean;
  soundOnCheckout: boolean;
};

const STORAGE_KEY = "quickpos_settings";

const defaultSettings: PosSettings = {
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
        minHeight: "100%",
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
              ตั้งค่าการพิมพ์ การชำระเงิน และตัวเลือกการใช้งานสำหรับเครื่องขายหน้าร้าน
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", xl: "1.2fr 0.8fr" }}
        gap={2}
      >
        {/* Left */}
        <Stack spacing={2}>
          {/* Receipt settings */}
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
                subtitle="กำหนดรูปแบบการพิมพ์และข้อความที่แสดงบนใบเสร็จ"
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
                      label="จำนวนชุดที่พิมพ์"
                      value={settings.copyCount}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          copyCount: Number(e.target.value),
                        })
                      }
                      fullWidth
                      sx={inputSx}
                    >
                      <MenuItem value={1}>1 ชุด</MenuItem>
                      <MenuItem value={2}>2 ชุด</MenuItem>
                      <MenuItem value={3}>3 ชุด</MenuItem>
                    </TextField>
                  </Box>

                  <TextField
                    label="ข้อความหัวใบเสร็จ"
                    value={settings.receiptHeaderNote}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        receiptHeaderNote: e.target.value,
                      })
                    }
                    fullWidth
                    sx={inputSx}
                  />

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
                subtitle="เลือกวิธีชำระเงินที่ต้องการเปิดใช้ในระบบ"
              />

              <Box sx={{ p: 3 }}>
                <Stack spacing={2.2}>
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
                    InputProps={{
                      endAdornment: (
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: 2,
                            bgcolor: "#f3f4f6",
                            color: "#6b7280",
                          }}
                        >
                          <QrCode2RoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      ),
                    }}
                  />

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

          {/* Desktop options */}
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
                title="ตัวเลือกการใช้งาน"
                subtitle="ตั้งค่าพฤติกรรมของโปรแกรมเวลาขายหน้าร้าน"
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
                    <Stack spacing={0.5}>
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

                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.showPrintPreview}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                showPrintPreview: e.target.checked,
                              })
                            }
                          />
                        }
                        label="แสดงตัวอย่างก่อนพิมพ์"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.soundOnCheckout}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                soundOnCheckout: e.target.checked,
                              })
                            }
                          />
                        }
                        label="เปิดเสียงแจ้งเตือนตอนชำระเงินสำเร็จ"
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
                icon={<CampaignRoundedIcon />}
                title="สรุปการตั้งค่าปัจจุบัน"
                subtitle="ภาพรวมของค่าที่ใช้งานอยู่ในระบบตอนนี้"
              />

              <Box sx={{ p: 3 }}>
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
                  <Stack spacing={1}>
                    <InfoRow
                      label="ขนาดกระดาษ"
                      value={settings.printerPaperSize}
                    />
                    <InfoRow
                      label="จำนวนชุดที่พิมพ์"
                      value={`${settings.copyCount} ชุด`}
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
                    <InfoRow
                      label="พิมพ์อัตโนมัติ"
                      value={
                        settings.autoPrintReceipt ? "เปิดใช้งาน" : "ปิดใช้งาน"
                      }
                    />
                    <InfoRow
                      label="แสดงตัวอย่างก่อนพิมพ์"
                      value={
                        settings.showPrintPreview ? "เปิดใช้งาน" : "ปิดใช้งาน"
                      }
                    />
                    <InfoRow
                      label="เสียงแจ้งเตือน"
                      value={
                        settings.soundOnCheckout ? "เปิดใช้งาน" : "ปิดใช้งาน"
                      }
                    />
                  </Stack>
                </Paper>
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
                การตั้งค่าหน้านี้จะถูกบันทึกไว้ในเครื่องนี้ เหมาะสำหรับใช้งานแบบออฟไลน์บนโปรแกรมเดสก์ท็อป
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