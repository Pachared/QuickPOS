"use client";

import { useEffect, useRef, useState } from "react";
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
  Slide,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { AlertColor, SlideProps, SwitchProps } from "@mui/material";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import type { PosSettings } from "../types/pos";

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

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#65C466",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

function SlideDownTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

export default function Settings() {
  const [settings, setSettings] = useState<PosSettings>(defaultSettings);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

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
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await window.pos.getSettings();
        setSettings(saved);
      } catch (error) {
        console.error("โหลด settings ไม่สำเร็จ:", error);
        showSnackbar("โหลดการตั้งค่าไม่สำเร็จ", "error");
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();

    window.addEventListener("resize", updateHeaderHeight);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateHeaderHeight())
        : null;

    if (headerRef.current && resizeObserver) {
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
      resizeObserver?.disconnect();
    };
  }, []);

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const saved = await window.pos.saveSettings(settings);
      setSettings(saved);
      showSnackbar("บันทึกการตั้งค่าเรียบร้อยแล้ว", "success");
    } catch (error) {
      console.error("บันทึก settings ไม่สำเร็จ:", error);
      showSnackbar(
        error instanceof Error ? error.message : "ไม่สามารถบันทึกการตั้งค่าได้",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = async () => {
    const confirmed = window.confirm(
      "ต้องการรีเซ็ตการตั้งค่ากลับค่าเริ่มต้นหรือไม่?"
    );
    if (!confirmed) return;

    try {
      setIsSaving(true);
      const reset = await window.pos.resetSettings();
      setSettings(reset);
      showSnackbar("รีเซ็ตการตั้งค่าเรียบร้อยแล้ว", "info");
    } catch (error) {
      console.error("รีเซ็ต settings ไม่สำเร็จ:", error);
      showSnackbar("ไม่สามารถรีเซ็ตการตั้งค่าได้", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100%" }}>
      <Box
        ref={headerRef}
        sx={{
          position: "fixed",
          top: 16,
          left: { md: 136 },
          right: { md: 396 },
          zIndex: 1200,
          p: { xs: 2.25, md: 3 },
          borderRadius: "25px",
          background:
            "linear-gradient(135deg, #111827 0%, #1f2937 55%, #374151 100%)",
          color: "#fff",
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

      <Box sx={{ height: `${headerHeight + 16}px` }} />

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", xl: "1.2fr 0.8fr" }}
        gap={2}
      >
        <Stack spacing={2}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 5,
              border: "1px solid #e5e7eb",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <SectionHeader
                title="ตั้งค่าใบเสร็จ"
                subtitle="กำหนดรูปแบบการพิมพ์และข้อความที่แสดงบนใบเสร็จ"
              />

              <Box sx={{ p: 3 }}>
                <Stack spacing={2.2}>
                  <TextField
                    label="ชื่อร้าน"
                    value={settings.shopName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shopName: e.target.value,
                      })
                    }
                    fullWidth
                    sx={inputSx}
                    disabled={isLoading || isSaving}
                  />

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
                      disabled={isLoading || isSaving}
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
                      disabled={isLoading || isSaving}
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
                    disabled={isLoading || isSaving}
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
                    disabled={isLoading || isSaving}
                  />
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: 5,
              border: "1px solid #e5e7eb",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <SectionHeader
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
                    disabled={isLoading || isSaving}
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
                    <Stack spacing={1.2}>
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            sx={{ m: 1 }}
                            checked={settings.enableCash}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                enableCash: e.target.checked,
                              })
                            }
                            disabled={isLoading || isSaving}
                          />
                        }
                        label="เปิดใช้งานการชำระแบบเงินสด"
                      />

                      <FormControlLabel
                        control={
                          <IOSSwitch
                            sx={{ m: 1 }}
                            checked={settings.enableTransfer}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                enableTransfer: e.target.checked,
                              })
                            }
                            disabled={isLoading || isSaving}
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

          <Card
            elevation={0}
            sx={{
              borderRadius: 5,
              border: "1px solid #e5e7eb",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <SectionHeader
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
                    <Stack spacing={0.8}>
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            sx={{ m: 1 }}
                            checked={settings.autoPrintReceipt}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                autoPrintReceipt: e.target.checked,
                              })
                            }
                            disabled={isLoading || isSaving}
                          />
                        }
                        label="พิมพ์ใบเสร็จอัตโนมัติหลังชำระเงิน"
                      />

                      <FormControlLabel
                        control={
                          <IOSSwitch
                            sx={{ m: 1 }}
                            checked={settings.showPrintPreview}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                showPrintPreview: e.target.checked,
                              })
                            }
                            disabled={isLoading || isSaving}
                          />
                        }
                        label="แสดงตัวอย่างก่อนพิมพ์"
                      />

                      <FormControlLabel
                        control={
                          <IOSSwitch
                            sx={{ m: 1 }}
                            checked={settings.soundOnCheckout}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                soundOnCheckout: e.target.checked,
                              })
                            }
                            disabled={isLoading || isSaving}
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

        <Stack spacing={2}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 5,
              border: "1px solid #e5e7eb",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography fontSize={22} fontWeight={900} color="#111827" mb={1}>
                สรุปการตั้งค่า
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={2}>
                การตั้งค่าหน้านี้จะถูกบันทึกไว้ในเครื่องนี้
                เหมาะสำหรับใช้งานแบบออฟไลน์บนโปรแกรมเดสก์ท็อป
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 4,
                  border: "1px solid #e5e7eb",
                  background: "#fafafa",
                }}
              >
                <Stack spacing={1.2}>
                  <SummaryRow label="ชื่อร้าน" value={settings.shopName || "-"} />
                  <SummaryRow
                    label="ขนาดกระดาษ"
                    value={settings.printerPaperSize}
                  />
                  <SummaryRow
                    label="จำนวนชุดที่พิมพ์"
                    value={`${settings.copyCount} ชุด`}
                  />
                  <SummaryRow
                    label="เงินสด"
                    value={settings.enableCash ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  />
                  <SummaryRow
                    label="โอนเงิน"
                    value={settings.enableTransfer ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  />
                  <SummaryRow
                    label="พร้อมเพย์"
                    value={settings.promptPayId || "-"}
                  />
                </Stack>
              </Paper>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<SaveRoundedIcon />}
                  onClick={saveSettings}
                  disabled={isLoading || isSaving}
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
                  {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<RestartAltRoundedIcon />}
                  onClick={resetSettings}
                  disabled={isLoading || isSaving}
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

      <Box sx={{ height: { md: 16 } }} />

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
    </Box>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
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
        <Box>
          <Typography fontWeight={900} color="#111827">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#eef2f7" }} />
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1.5}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={800} color="#111827" textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3.5,
    background: "#fff",
  },
};