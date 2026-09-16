import React, { useEffect, useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  INVOICE_PAYMENT_STAGE_VALUES,
  PAYMENT_STAGE_LABELS,
  INVOICE_STATUS_VALUES,
  INVOICE_STATUS_LABELS,
} from '../types/invoice.types';
import type { InvoiceFormInput } from '../schemas/invoice.schema';
import { authService } from '@/features/auth/services/auth.service';
import { invoiceService } from '../services/invoice.service';

interface Props {
  formData: InvoiceFormInput;
  setFormData: React.Dispatch<React.SetStateAction<InvoiceFormInput>>;
  errors: Record<string, string>;
  bookings: Array<{ id: string; client_name: string; event_name: string | null }>;
  editingId?: string; // If set, pre-populate invoice_number field as read-only
}

export const InvoiceForm: React.FC<Props> = ({
  formData,
  setFormData,
  errors,
  bookings,
  editingId,
}) => {
  const [autoNumber, setAutoNumber] = useState('');

  useEffect(() => {
    if (!editingId) {
      authService.getCurrentSession().then(({ profile }) => {
        if (profile?.tenant_id) {
          invoiceService.generateInvoiceNumber(profile.tenant_id).then((num) => {
            setAutoNumber(num);
            setFormData((prev) => ({ ...prev, invoice_number: num }));
          });
        }
      });
    }
  }, [editingId, setFormData]);

  const field = (key: keyof InvoiceFormInput) => ({
    value: (formData[key] as string | number) ?? '',
    error: !!errors[key],
    helperText: errors[key] || undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <Grid container spacing={3}>
      {/* Invoice Number */}
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Invoice Number"
          fullWidth
          required
          {...field('invoice_number')}
          InputProps={{ readOnly: !editingId && !!autoNumber }}
        />
      </Grid>

      {/* Booking */}
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth required error={!!errors.booking_id}>
          <InputLabel>Booking</InputLabel>
          <Select
            value={formData.booking_id || ''}
            label="Booking"
            onChange={(e) => setFormData((prev) => ({ ...prev, booking_id: e.target.value }))}
          >
            {bookings.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.client_name} — {b.event_name || 'No event name'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Payment Stage */}
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth required error={!!errors.payment_stage}>
          <InputLabel>Payment Stage</InputLabel>
          <Select
            value={formData.payment_stage || ''}
            label="Payment Stage"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, payment_stage: e.target.value as any }))
            }
          >
            {INVOICE_PAYMENT_STAGE_VALUES.map((s) => (
              <MenuItem key={s} value={s}>
                {PAYMENT_STAGE_LABELS[s]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Amount */}
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Amount (Rp)"
          type="number"
          fullWidth
          required
          value={formData.amount || ''}
          error={!!errors.amount}
          helperText={errors.amount}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
          }
          InputProps={{
            startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
            inputProps: { min: 0, step: 1000 },
          }}
        />
      </Grid>

      {/* Due Date */}
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Due Date"
          type="datetime-local"
          fullWidth
          required
          {...field('due_date')}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Status — only editable in edit mode */}
      {editingId && (
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status || 'unpaid'}
              label="Status"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value as any }))
              }
            >
              {INVOICE_STATUS_VALUES.map((s) => (
                <MenuItem key={s} value={s}>
                  {INVOICE_STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}

      {/* Payment Method */}
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField label="Payment Method" fullWidth {...field('payment_method')} />
      </Grid>

      {/* Payment Reference */}
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField label="Payment Reference ID" fullWidth {...field('payment_reference_id')} />
      </Grid>

      {/* Payment Link */}
      <Grid size={{ xs: 12 }}>
        <TextField label="Payment Link (URL)" fullWidth {...field('payment_link')} />
      </Grid>

      {/* Notes */}
      <Grid size={{ xs: 12 }}>
        <TextField label="Notes" fullWidth multiline minRows={3} {...field('notes')} />
      </Grid>
    </Grid>
  );
};
