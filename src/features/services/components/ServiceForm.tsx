import React from 'react';
import { Box, TextField, Grid, MenuItem, InputAdornment, FormControlLabel, Switch } from '@mui/material';
import type { ServiceInput } from '../schemas/service.schema';

interface ServiceFormProps {
  formData: ServiceInput;
  setFormData: (data: ServiceInput) => void;
  errors: Record<string, string>;
}

const PRICING_TYPES = [
  { value: 'fixed_package', label: 'Fixed Package' },
  { value: 'per_pax', label: 'Per Pax / Head' },
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'custom_quote', label: 'Custom Quote' },
];

export const ServiceForm: React.FC<ServiceFormProps> = ({ formData, setFormData, errors }) => {
  const handleChange = (field: keyof ServiceInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleNumberChange = (field: keyof ServiceInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value ? Number(e.target.value) : undefined });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, is_active: e.target.checked });
  };

  return (
    <Box component="form" noValidate sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            fullWidth
            id="name"
            label="Service Name"
            name="name"
            value={formData.name}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            required
            fullWidth
            id="pricing_type"
            label="Pricing Type"
            name="pricing_type"
            value={formData.pricing_type}
            onChange={handleChange('pricing_type')}
            error={!!errors.pricing_type}
            helperText={errors.pricing_type}
          >
            {PRICING_TYPES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            id="base_price"
            label="Base Price"
            name="base_price"
            type="number"
            value={formData.base_price || ''}
            onChange={handleNumberChange('base_price')}
            error={!!errors.base_price}
            helperText={errors.base_price}
            InputProps={{
              startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            id="min_order_qty"
            label="Minimum Order Qty"
            name="min_order_qty"
            type="number"
            value={formData.min_order_qty || ''}
            onChange={handleNumberChange('min_order_qty')}
            error={!!errors.min_order_qty}
            helperText={errors.min_order_qty}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            id="description"
            label="Description"
            name="description"
            multiline
            rows={3}
            value={formData.description || ''}
            onChange={handleChange('description')}
            error={!!errors.description}
            helperText={errors.description}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={handleSwitchChange}
                color="primary"
              />
            }
            label={formData.is_active ? 'Active' : 'Inactive'}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
