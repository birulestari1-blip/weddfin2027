import React from 'react';
import { Box, TextField, Grid } from '@mui/material';
import type { ClientInput } from '../schemas/client.schema';

interface ClientFormProps {
  formData: ClientInput;
  setFormData: (data: ClientInput) => void;
  errors: Record<string, string>;
}

export const ClientForm: React.FC<ClientFormProps> = ({ formData, setFormData, errors }) => {
  const handleChange = (field: keyof ClientInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Box component="form" noValidate sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            fullWidth
            id="full_name"
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange('full_name')}
            error={!!errors.full_name}
            helperText={errors.full_name}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            id="phone_number"
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number || ''}
            onChange={handleChange('phone_number')}
            error={!!errors.phone_number}
            helperText={errors.phone_number}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            id="company_name"
            label="Company Name"
            name="company_name"
            value={formData.company_name || ''}
            onChange={handleChange('company_name')}
            error={!!errors.company_name}
            helperText={errors.company_name}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            id="address"
            label="Address"
            name="address"
            multiline
            rows={2}
            value={formData.address || ''}
            onChange={handleChange('address')}
            error={!!errors.address}
            helperText={errors.address}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            id="notes"
            label="Notes"
            name="notes"
            multiline
            rows={3}
            value={formData.notes || ''}
            onChange={handleChange('notes')}
            error={!!errors.notes}
            helperText={errors.notes}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
