import React from 'react';
import {
  Box, Grid, TextField, FormControlLabel, Switch, InputAdornment,
  Typography, Card, CardContent, Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cateringMenuSchema, type CateringMenuFormInput } from '../schemas/catering-menu.schema';
import type { CateringMenu } from '../types/catering-menu.types';

interface CateringMenuFormProps {
  defaultValues?: Partial<CateringMenuFormInput>;
  onSubmit: (data: CateringMenuFormInput) => void;
  existingMenu?: CateringMenu;
}

const COURSE_CATEGORIES = [
  'Paket Wedding', 'Paket Buffet', 'Paket Nusantara', 'Paket Premium',
  'Paket Hemat', 'Catering Harian', 'Paket Prasmanan', 'Lainnya',
];

export const CateringMenuForm: React.FC<CateringMenuFormProps> = ({
  defaultValues,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CateringMenuFormInput>({
    resolver: zodResolver(cateringMenuSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      image_url: '',
      price_per_pax: 0,
      is_active: true,
      ...defaultValues,
    },
  });

  const imageUrl = watch('image_url');

  return (
    <Box component="form" id="catering-menu-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={3}>
        {/* Left column */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Menu Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Menu Name *"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message || 'e.g. Paket Wedding Silver'}
                        id="catering-menu-name"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        id="catering-menu-description"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        label="Category"
                        fullWidth
                        error={!!errors.category}
                        helperText={errors.category?.message || 'e.g. Paket Wedding, Buffet'}
                        id="catering-menu-category"
                        inputProps={{ list: 'category-suggestions' }}
                      />
                    )}
                  />
                  <datalist id="category-suggestions">
                    {COURSE_CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="price_per_pax"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        label="Price per Pax *"
                        fullWidth
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                        }}
                        error={!!errors.price_per_pax}
                        helperText={errors.price_per_pax?.message}
                        id="catering-menu-price"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right column */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Status */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        id="catering-menu-active"
                        color="success"
                      />
                    }
                    label={field.value ? 'Active' : 'Inactive'}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Inactive menus are hidden from selection.
              </Typography>
            </CardContent>
          </Card>

          {/* Image */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Menu Image
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Controller
                name="image_url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Image URL"
                    fullWidth
                    size="small"
                    error={!!errors.image_url}
                    helperText={errors.image_url?.message || 'Paste a valid image URL'}
                    id="catering-menu-image-url"
                  />
                )}
              />
              {imageUrl && (
                <Box
                  mt={2}
                  sx={{
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'grey.100',
                    height: 140,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    component="img"
                    src={imageUrl}
                    alt="Preview"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
