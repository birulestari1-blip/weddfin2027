import React, { useEffect, useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CONTRACT_STATUS_VALUES,
  CONTRACT_STATUS_LABELS,
} from '../types/contract.types';
import type { ContractFormInput } from '../schemas/contract.schema';
import { authService } from '@/features/auth/services/auth.service';

interface Props {
  formData: ContractFormInput;
  setFormData: React.Dispatch<React.SetStateAction<ContractFormInput>>;
  errors: Record<string, string>;
  bookings: Array<{ id: string; client_name: string; event_name: string | null }>;
  editingId?: string; // If set, contract_number field is read-only
}

export const ContractForm: React.FC<Props> = ({
  formData,
  setFormData,
  errors,
  bookings,
  editingId,
}) => {
  const [autoNumber, setAutoNumber] = useState('');

  useEffect(() => {
    // Basic auto-numbering logic for contract number if not editing
    if (!editingId && !formData.contract_number) {
      authService.getCurrentSession().then(({ profile }) => {
        if (profile?.tenant_id) {
          const num = `CTR-${Date.now().toString().slice(-6)}`;
          setAutoNumber(num);
          setFormData((prev) => ({ ...prev, contract_number: num }));
        }
      });
    }
  }, [editingId, formData.contract_number, setFormData]);

  const field = (key: keyof ContractFormInput) => ({
    value: (formData[key] as string | number) ?? '',
    error: !!errors[key],
    helperText: errors[key] || undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <Grid container spacing={3}>
      {/* Contract Number */}
      <Grid size= {{ xs: 12, md: 6 }}>
        <TextField
          label="Contract Number"
          fullWidth
          required
          {...field('contract_number')}
          InputProps={{ readOnly: !editingId && !!autoNumber }}
        />
      </Grid>

      {/* Booking */}
      <Grid size= {{ xs: 12, md: 6 }}>
        <FormControl fullWidth required error={!!errors.booking_id}>
          <InputLabel>Booking</InputLabel>
          <Select
            value={formData.booking_id || ''}
            label="Booking"
            onChange={(e) => setFormData((prev) => ({ ...prev, booking_id: e.target.value }))}
            disabled={!!editingId} // Cannot change booking once created
          >
            {bookings.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.client_name} — {b.event_name || 'No event name'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Terms and Conditions */}
      <Grid size= {{ xs: 12 }}>
        <TextField
          label="Terms and Conditions"
          fullWidth
          multiline
          minRows={5}
          required
          {...field('terms_and_conditions')}
        />
      </Grid>

      {/* Status — only editable in edit mode */}
      {editingId && (
        <Grid size= {{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status || 'draft'}
              label="Status"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value as any }))
              }
            >
              {CONTRACT_STATUS_VALUES.map((s) => (
                <MenuItem key={s} value={s}>
                  {CONTRACT_STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}

      <Grid size= {{ xs: 12, md: 6 }}>
        <TextField label="Client Signature URL" fullWidth {...field('client_signature_url')} />
      </Grid>
      <Grid size= {{ xs: 12, md: 6 }}>
        <TextField label="Vendor Signature URL" fullWidth {...field('vendor_signature_url')} />
      </Grid>
      <Grid size= {{ xs: 12 }}>
        <TextField label="PDF Document URL" fullWidth {...field('pdf_url')} />
      </Grid>
    </Grid>
  );
};
