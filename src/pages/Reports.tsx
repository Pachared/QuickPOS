import { Box, Typography, Card, CardContent } from "@mui/material";

export default function Reports() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Reports
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Card sx={{ flex: 1, minWidth: 250 }}>
          <CardContent>
            <Typography>Total Sales Today</Typography>
            <Typography variant="h4">฿12,000</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 250 }}>
          <CardContent>
            <Typography>Total Orders</Typography>
            <Typography variant="h4">32</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}