import React from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Divider,
  InputAdornment,
  Box,
} from '@mui/material';
import type { BookingFormInput } from '../schemas/booking.schema';
import { BOOKING_STATUS_VALUES, PAYMENT_STATUS_VALUES } from '../types/booking.types';

interface Props {
  formData: BookingFormInput;
  setFormData: React.Dispatch<React.SetStateAction<BookingFormInput>>;
  errors: Record<string, string>;
  clients: any[];
  services: any[];
  acceptedQuotations?: any[];
  onQuotationSelect?: (quotationId: string) => void;
  isEditMode?: boolean;
}

export const BookingForm: React.FC<Props> = ({
  formData,
  setFormData,
  errors,
  clients,
  services,
  acceptedQuotations = [],
  onQuotationSelect,
  isEditMode = false,
}) => {
  const handleChange = (field: keyof BookingFormInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    setFormData((prev) => ({
      ...prev,
      client_id: client ? client.id : null,
      client_name: client ? client.full_name : prev.client_name,
      client_email: client ? client.email : prev.client_email,
      client_phone: client ? client.phone_number : prev.client_phone,
    }));
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    setFormData((prev) => ({
      ...prev,
      service_id: service ? service.id : null,
      unit_price: service ? Number(service.base_price) : prev.unit_price,
      total_cost: service ? Number(service.base_price) * prev.quantity - prev.discount_amount : prev.total_cost,
    }));
  };

  const handleFinancialChange = (field: 'quantity' | 'unit_price' | 'discount_amount', value: number) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      next.total_cost = Math.max(0, next.quantity * next.unit_price - next.discount_amount);
      return next;
    });
  };

  return (
    <Grid container spacing={3}>
      {/* Optional: Create from Quotation */}
      {!isEditMode && acceptedQuotations.length > 0 && onQuotationSelect && (
        <Grid size={{ xs: 12 }}>
          <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.100' }}>
            <Typography variant="subtitle2" color="primary.800" sx={{ mb: 1 }}>
              Quick Start: Create from Accepted Quotation
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              label="Select Accepted Quotation"
              value={formData.source_quotation_id || ''}
              onChange={(e) => onQuotationSelect(e.target.value)}
              disabled={!!formData.source_quotation_id}
            >
              {acceptedQuotations.map((q) => (
                <MenuItem key={q.id} value={q.id}>
                  {q.quotation_number} - {q.title} (Rp {q.total_amount.toLocaleString('id-ID')})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Grid>
      )}

      {/* Client Section */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Client Information
        </Typography>
        <Divider sx={{ my: 1 }} />
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          select
          fullWidth
          label="Link to Existing Client (Optional)"
          value={formData.client_id || ''}
          onChange={(e) => handleClientSelect(e.target.value)}
          error={!!errors.client_id}
          helperText={errors.client_id}
        >
          <MenuItem value="">
            <em>None / Create Custom</em>
          </MenuItem>
          {clients.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.full_name} {c.company_name ? `(${c.company_name})` : ''}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Client Name *"
          value={formData.client_name}
          onChange={(e) => handleChange('client_name', e.target.value)}
          error={!!errors.client_name}
          helperText={errors.client_name}
          disabled={!!formData.client_id} // Lock if linked to an existing client profile
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Client Email"
          type="email"
          value={formData.client_email || ''}
          onChange={(e) => handleChange('client_email', e.target.value)}
          error={!!errors.client_email}
          helperText={errors.client_email}
          disabled={!!formData.client_id}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Client Phone"
          value={formData.client_phone || ''}
          onChange={(e) => handleChange('client_phone', e.target.value)}
          error={!!errors.client_phone}
          helperText={errors.client_phone}
          disabled={!!formData.client_id}
        />
      </Grid>

      {/* Event Section */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
          Event Details
        </Typography>
        <Divider sx={{ my: 1 }} />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Event Name"
          value={formData.event_name || ''}
          onChange={(e) => handleChange('event_name', e.target.value)}
          error={!!errors.event_name}
          helperText={errors.event_name}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          fullWidth
          type="datetime-local"
          label="Start Date *"
          InputLabelProps={{ shrink: true }}
          value={formData.event_date ? new Date(formData.event_date).toISOString().slice(0,16) : ''}
          onChange={(e) => handleChange('event_date', new Date(e.target.value).toISOString())}
          error={!!errors.event_date}
          helperText={errors.event_date}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          fullWidth
          type="datetime-local"
          label="End Date"
          InputLabelProps={{ shrink: true }}
          value={formData.event_end_date ? new Date(formData.event_end_date).toISOString().slice(0,16) : ''}
          onChange={(e) => handleChange('event_end_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
          error={!!errors.event_end_date}
          helperText={errors.event_end_date}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Venue Name"
          value={formData.venue_name || ''}
          onChange={(e) => handleChange('venue_name', e.target.value)}
          error={!!errors.venue_name}
          helperText={errors.venue_name}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Venue Address"
          value={formData.venue_address || ''}
          onChange={(e) => handleChange('venue_address', e.target.value)}
          error={!!errors.venue_address}
          helperText={errors.venue_address}
        />
      </Grid>

      {/* Financials Section */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
          Service & Financials
        </Typography>
        <Divider sx={{ my: 1 }} />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          select
          fullWidth
          label="Primary Service"
          value={formData.service_id || ''}
          onChange={(e) => handleServiceSelect(e.target.value)}
          error={!!errors.service_id}
          helperText={errors.service_id}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {services.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid size={{ xs: 12, md: 2 }}>
        <TextField
          fullWidth
          type="number"
          label="Qty"
          value={formData.quantity}
          onChange={(e) => handleFinancialChange('quantity', Number(e.target.value))}
          error={!!errors.quantity}
          helperText={errors.quantity}
          InputProps={{ inputProps: { min: 1 } }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          type="number"
          label="Unit Price"
          value={formData.unit_price}
          onChange={(e) => handleFinancialChange('unit_price', Number(e.target.value))}
          error={!!errors.unit_price}
          helperText={errors.unit_price}
          InputProps={{
            startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
            inputProps: { min: 0 }
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          type="number"
          label="Discount"
          value={formData.discount_amount}
          onChange={(e) => handleFinancialChange('discount_amount', Number(e.target.value))}
          error={!!errors.discount_amount}
          helperText={errors.discount_amount}
          InputProps={{
            startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
            inputProps: { min: 0 }
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          type="number"
          label="Amount Paid"
          value={formData.amount_paid}
          onChange={(e) => handleChange('amount_paid', Number(e.target.value))}
          error={!!errors.amount_paid}
          helperText={errors.amount_paid}
          InputProps={{
            startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
            inputProps: { min: 0 }
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          type="number"
          label="Total Cost"
          value={formData.total_cost}
          onChange={(e) => handleChange('total_cost', Number(e.target.value))} // Allow manual override if they really want
          error={!!errors.total_cost}
          helperText={errors.total_cost || "Auto-calculated: (Qty * Price) - Discount"}
          InputProps={{
            startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
            inputProps: { min: 0 }
          }}
        />
      </Grid>

      {/* Statuses */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
          Status
        </Typography>
        <Divider sx={{ my: 1 }} />
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          select
          fullWidth
          label="Booking Status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          {BOOKING_STATUS_VALUES.map((s) => (
            <MenuItem key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          select
          fullWidth
          label="Payment Status"
          value={formData.payment_status}
          onChange={(e) => handleChange('payment_status', e.target.value)}
        >
          {PAYMENT_STATUS_VALUES.map((s) => (
            <MenuItem key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

    </Grid>
  );
};
