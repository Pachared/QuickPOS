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
} from "@mui/material";

type Order = {
  id: number;
  date: string;
  items: number;
  total: number;
};

const mockOrders: Order[] = [
  { id: 1001, date: "2026-03-16 10:15", items: 3, total: 120 },
  { id: 1002, date: "2026-03-16 11:02", items: 5, total: 260 },
  { id: 1003, date: "2026-03-16 12:45", items: 2, total: 80 },
];

export default function Orders() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Sales History
      </Typography>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>฿{order.total.toLocaleString()}</TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined">
                        View
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}