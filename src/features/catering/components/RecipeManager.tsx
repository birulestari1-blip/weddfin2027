import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Tooltip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Alert,
  Paper, Grid,
} from '@mui/material';
import { Add, Delete, Science } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCateringRecipes } from '../hooks/useCateringRecipes';
import { cateringRecipeSchema, type CateringRecipeFormInput } from '../schemas/catering-menu.schema';
import type { RecipeWithInventory, InventoryItem } from '../types/catering-menu.types';
import { getStockStatus } from '../types/catering-menu.types';

const STOCK_COLOR_MAP = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'error',
} as const;

const STOCK_LABEL_MAP = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

interface RecipeManagerProps {
  menuItemId: string;
  menuItemName: string;
  pax?: number;
}

export const RecipeManager: React.FC<RecipeManagerProps> = ({ menuItemId, menuItemName, pax = 100 }) => {
  const {
    recipes,
    inventoryItems,
    isLoading,
    error,
    fetchRecipesByMenuItemId,
    fetchInventoryItems,
    createRecipe,
    deleteRecipe,
  } = useCateringRecipes();

  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CateringRecipeFormInput>({
    resolver: zodResolver(cateringRecipeSchema),
    defaultValues: { inventory_item_id: '', quantity_per_pax: 0, unit: '' },
  });

  const selectedItemId = watch('inventory_item_id');

  useEffect(() => {
    fetchRecipesByMenuItemId(menuItemId);
  }, [menuItemId, fetchRecipesByMenuItemId]);

  const handleOpenAdd = () => {
    fetchInventoryItems();
    setAddOpen(true);
    reset({ inventory_item_id: '', quantity_per_pax: 0, unit: '' });
    setFormError(null);
  };

  // Auto-fill unit when inventory item is selected
  useEffect(() => {
    if (selectedItemId) {
      const item = inventoryItems.find(i => i.id === selectedItemId);
      if (item) setValue('unit', item.unit);
    }
  }, [selectedItemId, inventoryItems, setValue]);

  const handleAdd = async (data: CateringRecipeFormInput) => {
    setSaving(true);
    setFormError(null);
    const result = await createRecipe(menuItemId, data);
    if (result.success) {
      setAddOpen(false);
      fetchRecipesByMenuItemId(menuItemId);
    } else {
      setFormError(result.error?.message || 'Failed to add ingredient');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    await deleteRecipe(deleteId);
    setDeleteId(null);
    fetchRecipesByMenuItemId(menuItemId);
    setSaving(false);
  };



  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Science sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={700}>
            Recipe / Ingredients
          </Typography>
          {recipes.length > 0 && (
            <Chip label={`${recipes.length} ingredients`} size="small" sx={{ ml: 1 }} />
          )}
        </Box>
        <Button
          size="small"
          startIcon={<Add />}
          onClick={handleOpenAdd}
          variant="outlined"
          id={`add-recipe-${menuItemId}`}
        >
          Add Ingredient
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      ) : recipes.length === 0 ? (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 1.5,
            py: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No ingredients yet. Click "Add Ingredient" to link inventory items.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Ingredient</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Per Pax</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Req × {pax} pax</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Current Stock</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recipes.map((r: RecipeWithInventory) => {
                const inv = r.inventory_item;
                const stockStatus = inv
                  ? getStockStatus(inv.current_stock, inv.minimum_stock)
                  : 'out_of_stock';
                const required = Math.round(r.quantity_per_pax * pax * 10000) / 10000;

                return (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {inv?.name ?? '—'}
                      </Typography>
                      {inv?.sku && (
                        <Typography variant="caption" color="text.secondary">
                          SKU: {inv.sku}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {r.quantity_per_pax} {r.unit}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color={required > (inv?.current_stock ?? 0) ? 'error.main' : 'inherit'}>
                        {required} {r.unit}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {inv ? `${inv.current_stock} ${inv.unit}` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STOCK_LABEL_MAP[stockStatus]}
                        color={STOCK_COLOR_MAP[stockStatus]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteId(r.id)}
                          id={`delete-recipe-${r.id}`}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Recipe Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Ingredient to {menuItemName}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box component="form" id="recipe-form" onSubmit={handleSubmit(handleAdd)}>
            <Grid container spacing={2}>
              <Box sx={{ width: '100%', mt: 1 }}>
                <Controller
                  name="inventory_item_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Inventory Item *"
                      fullWidth
                      error={!!errors.inventory_item_id}
                      helperText={errors.inventory_item_id?.message || 'Select from your inventory'}
                      id="recipe-inventory-item"
                      sx={{ mb: 2 }}
                    >
                      {inventoryItems.length === 0 ? (
                        <MenuItem value="" disabled>No active inventory items found</MenuItem>
                      ) : (
                        inventoryItems.map((item: InventoryItem) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name} ({item.unit}) — Stock: {item.current_stock}
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                  )}
                />
                <Box display="flex" gap={2}>
                  <Controller
                    name="quantity_per_pax"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        label="Quantity per Pax *"
                        type="number"
                        inputProps={{ step: '0.0001' }}
                        error={!!errors.quantity_per_pax}
                        helperText={errors.quantity_per_pax?.message}
                        id="recipe-quantity"
                        sx={{ flex: 1 }}
                      />
                    )}
                  />
                  <Controller
                    name="unit"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Unit *"
                        error={!!errors.unit}
                        helperText={errors.unit?.message}
                        id="recipe-unit"
                        sx={{ flex: 1 }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} id="recipe-cancel">Cancel</Button>
          <Button
            type="submit"
            form="recipe-form"
            variant="contained"
            disabled={saving}
            id="recipe-save"
          >
            {saving ? 'Saving...' : 'Add Ingredient'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Remove Ingredient</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove this ingredient from the recipe?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} id="delete-recipe-cancel">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={saving} id="delete-recipe-confirm">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


