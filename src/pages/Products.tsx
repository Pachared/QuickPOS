import { useState } from "react";
import {
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Stack,
  IconButton,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface Product {
  id: number;
  name: string;
  price: number;
  barcode: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    barcode: "",
  });

  const openAdd = () => {
    setForm({ id: 0, name: "", price: 0, barcode: "" });
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    setForm(product);
    setOpen(true);
  };

  const saveProduct = () => {
    if (form.id === 0) {
      setProducts([
        ...products,
        { ...form, id: Date.now() },
      ]);
    } else {
      setProducts(
        products.map((p) =>
          p.id === form.id ? form : p
        )
      );
    }

    setOpen(false);
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Product Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
        >
          Add Product
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Barcode</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell width={120}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.barcode}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>฿{p.price}</TableCell>

                <TableCell>
                  <IconButton onClick={() => openEdit(p)}>
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    onClick={() => deleteProduct(p.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No products
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Product</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Barcode"
              value={form.barcode}
              onChange={(e) =>
                setForm({ ...form, barcode: e.target.value })
              }
            />

            <TextField
              label="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <TextField
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: Number(e.target.value),
                })
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button variant="contained" onClick={saveProduct}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}