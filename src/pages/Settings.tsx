import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  MenuItem,
} from "@mui/material";

export default function Settings() {
  const [settings, setSettings] = useState({
    shopName: "My POS Shop",
    shopAddress: "",
    currency: "THB",
    vat: 7,
  });

  const saveSettings = () => {
    alert("Settings saved");
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Settings
      </Typography>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Shop Name"
              value={settings.shopName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  shopName: e.target.value,
                })
              }
            />

            <TextField
              label="Shop Address"
              multiline
              rows={3}
              value={settings.shopAddress}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  shopAddress: e.target.value,
                })
              }
            />

            <TextField
              select
              label="Currency"
              value={settings.currency}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  currency: e.target.value,
                })
              }
            >
              <MenuItem value="THB">Thai Baht (฿)</MenuItem>
              <MenuItem value="USD">US Dollar ($)</MenuItem>
              <MenuItem value="EUR">Euro (€)</MenuItem>
            </TextField>

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
            />

            <Button
              variant="contained"
              size="large"
              onClick={saveSettings}
            >
              Save Settings
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}