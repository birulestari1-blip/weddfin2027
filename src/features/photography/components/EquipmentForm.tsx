import React from 'react';
import {
  Box, TextField, MenuItem, FormControlLabel, Switch, Grid, Divider, Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { photographyEquipmentSchema, type PhotographyEquipmentFormInput } from '../schemas/photography.schema';
import type { PhotographyEquipment } from '../types/photography.types';

const EQUIPMENT_TYPES = [
  'Camera Body', 'Lens', 'Flash / Speedlite', 'Tripod', 'Gimbal', 'Drone',
  'Light Stand', 'Softbox', 'Reflector', 'Memory Card', 'Battery Pack',
  'Backdrop', 'Monitor', 'Other',
];

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'maintenance', label: 'In Maintenance' },
  { value: 'damaged', label: 'Damaged' },
];

interface EquipmentFormProps {
  defaultValues?: Partial<PhotographyEquipmentFormInput>;
  onSubmit: (data: PhotographyEquipmentFormInput) => void;
  existingEquipment?: PhotographyEquipment;
}

export const EquipmentForm: React.FC<EquipmentFormProps> = ({
  defaultValues,
  onSubmit,
  existingEquipment,
}) => {
  const { control, handleSubmit, formState: { errors } } = useForm<PhotographyEquipmentFormInput>({
    resolver: zodResolver(photographyEquipmentSchema),
    defaultValues: {
      equipment_type: existingEquipment?.equipment_type ?? defaultValues?.equipment_type ?? '',
      brand: existingEquipment?.brand ?? defaultValues?.brand ?? '',
      model: existingEquipment?.model ?? defaultValues?.model ?? '',
      serial_number: existingEquipment?.serial_number ?? defaultValues?.serial_number ?? '',
      status: existingEquipment?.status ?? defaultValues?.status ?? 'available',
      notes: existingEquipment?.notes ?? defaultValues?.notes ?? '',
      inventory_item_id: existingEquipment?.inventory_item_id ?? defaultValues?.inventory_item_id ?? null,
    },
  });

  return (
    <Box
      component="form"
      id="equipment-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Equipment Information
      </Typography>

      <Grid container spacing={2}>
        {/* Equipment Type */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="equipment_type"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Equipment Type *"
                select
                fullWidth
                error={!!errors.equipment_type}
                helperText={errors.equipment_type?.message}
                id="equipment-type-select"
              >
                {EQUIPMENT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* Status */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Status *"
                select
                fullWidth
                error={!!errors.status}
                helperText={errors.status?.message}
                id="equipment-status-select"
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* Brand */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="Brand"
                fullWidth
                error={!!errors.brand}
                helperText={errors.brand?.message}
                id="equipment-brand"
              />
            )}
          />
        </Grid>

        {/* Model */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="Model"
                fullWidth
                error={!!errors.model}
                helperText={errors.model?.message}
                id="equipment-model"
              />
            )}
          />
        </Grid>

        {/* Serial Number */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="serial_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="Serial Number"
                fullWidth
                error={!!errors.serial_number}
                helperText={errors.serial_number?.message ?? 'Must be unique per tenant'}
                id="equipment-serial"
              />
            )}
          />
        </Grid>

        {/* Divider */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Notes
          </Typography>
        </Grid>

        {/* Notes */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="Notes"
                fullWidth
                multiline
                rows={3}
                error={!!errors.notes}
                helperText={errors.notes?.message}
                id="equipment-notes"
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
