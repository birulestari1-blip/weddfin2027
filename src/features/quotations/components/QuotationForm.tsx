import React, { useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  Autocomplete,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import type { QuotationFormInput, QuotationItemInput } from '../schemas/quotation.schema';
import { quotationService } from '../services/quotation.service';
import { QUOTATION_STATUS_VALUES } from '../types/quotation.types';

interface QuotationFormProps {
  formData: QuotationFormInput;
  setFormData: (data: QuotationFormInput) => void;
  errors: Record<string, string>;
  clients: Array<{ id: string; full_name: string; company_name: string | null }>;
  services: Array<{ id: string; name: string; base_price: number }>;
}

const formatCurrency = (val: number) =>
  val.toLocaleString('id-ID', { minimumFractionDigits: 0 });

const emptyItem = (): QuotationItemInput => ({
  service_id: null,
  item_name: '',
  description: '',
  quantity: 1,
  unit_price: 0,
  discount_amount: 0,
  line_total: 0,
  display_order: 0,
});

export const QuotationForm: React.FC<QuotationFormProps> = ({
  formData,
  setFormData,
  errors,
  clients,
  services,
}) => {
  const recalculate = useCallback(
    (items: QuotationItemInput[], discountAmount: number, taxAmount: number) => {
      const { subtotal, total } = quotationService.calculateTotals(
        items,
        discountAmount,
        taxAmount
      );
      setFormData({ ...formData, items, subtotal, total_amount: total, discount_amount: discountAmount, tax_amount: taxAmount });
    },
    [formData, setFormData]
  );

  const handleField = (field: keyof QuotationFormInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleNumericField = (field: keyof QuotationFormInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = parseFloat(e.target.value) || 0;
    if (field === 'discount_amount') {
      recalculate(formData.items, val, formData.tax_amount);
    } else if (field === 'tax_amount') {
      recalculate(formData.items, formData.discount_amount, val);
    } else {
      setFormData({ ...formData, [field]: val });
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof QuotationItemInput,
    value: string | number | null
  ) => {
    const updated = formData.items.map((item, i) => {
      if (i !== index) return item;
      const updatedItem = { ...item, [field]: value };
      // Recalc line_total on price/qty/discount changes
      if (['quantity', 'unit_price', 'discount_amount'].includes(field as string)) {
        updatedItem.line_total = quotationService.calculateItemLineTotal(
          updatedItem.quantity,
          updatedItem.unit_price,
          updatedItem.discount_amount
        );
      }
      return updatedItem;
    });
    recalculate(updated, formData.discount_amount, formData.tax_amount);
  };

  const handleServiceSelect = (index: number, service: typeof services[0] | null) => {
    const updated = formData.items.map((item, i) => {
      if (i !== index) return item;
      if (!service) return { ...item, service_id: null };
      const updatedItem = {
        ...item,
        service_id: service.id,
        item_name: service.name,
        unit_price: service.base_price,
        line_total: quotationService.calculateItemLineTotal(
          item.quantity,
          service.base_price,
          item.discount_amount
        ),
      };
      return updatedItem;
    });
    recalculate(updated, formData.discount_amount, formData.tax_amount);
  };

  const addItem = () => {
    const newItems = [
      ...formData.items,
      { ...emptyItem(), display_order: formData.items.length },
    ];
    recalculate(newItems, formData.discount_amount, formData.tax_amount);
  };

  const removeItem = (index: number) => {
    const updated = formData.items.filter((_, i) => i !== index);
    recalculate(updated, formData.discount_amount, formData.tax_amount);
  };

  return (
    <Box>
      {/* ── Quotation Info ── */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        Quotation Information
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            fullWidth
            label="Quotation Number"
            value={formData.quotation_number}
            onChange={handleField('quotation_number')}
            error={!!errors.quotation_number}
            helperText={errors.quotation_number}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label="Status"
            value={formData.status}
            onChange={handleField('status')}
          >
            {QUOTATION_STATUS_VALUES.map((s) => (
              <MenuItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            fullWidth
            label="Title"
            value={formData.title}
            onChange={handleField('title')}
            error={!!errors.title}
            helperText={errors.title}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            options={clients}
            getOptionLabel={(c) =>
              c.company_name ? `${c.full_name} (${c.company_name})` : c.full_name
            }
            value={clients.find((c) => c.id === formData.client_id) || null}
            onChange={(_, val) =>
              setFormData({ ...formData, client_id: val?.id || null })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Client"
                error={!!errors.client_id}
                helperText={errors.client_id}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Valid Until"
            type="date"
            value={formData.valid_until || ''}
            onChange={handleField('valid_until')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Notes"
            value={formData.notes || ''}
            onChange={handleField('notes')}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* ── Items ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Quotation Items
        </Typography>
        <Button startIcon={<Add />} size="small" variant="outlined" onClick={addItem}>
          Add Item
        </Button>
      </Box>

      {errors.items && (
        <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
          {errors.items}
        </Typography>
      )}

      {formData.items.map((item, idx) => (
        <Card
          key={idx}
          variant="outlined"
          sx={{ mb: 2, bgcolor: 'grey.50' }}
        >
          <CardContent sx={{ '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Item {idx + 1}
              </Typography>
              <Tooltip title="Remove item">
                <IconButton size="small" color="error" onClick={() => removeItem(idx)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  options={services}
                  getOptionLabel={(s) => s.name}
                  value={services.find((s) => s.id === item.service_id) || null}
                  onChange={(_, val) => handleServiceSelect(idx, val)}
                  renderInput={(params) => (
                    <TextField {...params} label="Link to Service (optional)" size="small" />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  size="small"
                  label="Item Name"
                  value={item.item_name}
                  onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Description"
                  value={item.description || ''}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Quantity"
                  type="number"
                  inputProps={{ min: 0.001, step: 0.001 }}
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Unit Price"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={item.unit_price}
                  onChange={(e) =>
                    handleItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)
                  }
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Item Discount"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={item.discount_amount}
                  onChange={(e) =>
                    handleItemChange(idx, 'discount_amount', parseFloat(e.target.value) || 0)
                  }
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    Line Total:&nbsp;
                    <Typography component="span" fontWeight={700}>
                      Rp {formatCurrency(item.line_total)}
                    </Typography>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Divider sx={{ my: 3 }} />

      {/* ── Totals ── */}
      <Box sx={{ maxWidth: 400, ml: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography fontWeight={600}>Rp {formatCurrency(formData.subtotal)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
          <Typography color="text.secondary">Discount</Typography>
          <TextField
            size="small"
            type="number"
            inputProps={{ min: 0 }}
            value={formData.discount_amount}
            onChange={handleNumericField('discount_amount')}
            sx={{ width: 180 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Typography color="text.secondary">Tax</Typography>
          <TextField
            size="small"
            type="number"
            inputProps={{ min: 0 }}
            value={formData.tax_amount}
            onChange={handleNumericField('tax_amount')}
            sx={{ width: 180 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
            }}
          />
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography fontWeight={700} variant="h6">Grand Total</Typography>
          <Typography fontWeight={700} variant="h6" color="primary.main">
            Rp {formatCurrency(formData.total_amount)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
