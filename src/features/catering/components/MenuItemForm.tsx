import React from 'react';
import {
  Box, TextField, FormControlLabel, Switch,
  Grid, Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cateringMenuItemSchema, type CateringMenuItemFormInput } from '../schemas/catering-menu.schema';

interface MenuItemFormProps {
  defaultValues?: Partial<CateringMenuItemFormInput>;
  onSubmit: (data: CateringMenuItemFormInput) => void;
  isSubmitting?: boolean;
}

const COURSE_TYPES = [
  'Appetizer', 'Soup', 'Main Course', 'Side Dish',
  'Dessert', 'Beverage', 'Snack', 'Lainnya',
];

export const MenuItemForm: React.FC<MenuItemFormProps> = ({ defaultValues, onSubmit }) => {
  const { control, handleSubmit, watch, formState: { errors } } = useForm<CateringMenuItemFormInput>({
    resolver: zodResolver(cateringMenuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      course_type: '',
      image_url: '',
      is_active: true,
      display_order: 0,
      ...defaultValues,
    },
  });

  const imageUrl = watch('image_url');

  return (
    <Box component="form" id="menu-item-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Item Name *"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message || 'e.g. Ayam Bakar, Nasi Putih'}
                id="menu-item-name"
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="course_type"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="Course Type"
                fullWidth
                error={!!errors.course_type}
                helperText={errors.course_type?.message}
                id="menu-item-course-type"
                inputProps={{ list: 'course-type-suggestions' }}
              />
            )}
          />
          <datalist id="course-type-suggestions">
            {COURSE_TYPES.map(c => <option key={c} value={c} />)}
          </datalist>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="display_order"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                label="Display Order"
                fullWidth
                type="number"
                error={!!errors.display_order}
                helperText="Lower number = shown first"
                id="menu-item-order"
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
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
                id="menu-item-description"
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
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
                helperText={errors.image_url?.message || 'Optional image URL'}
                id="menu-item-image-url"
              />
            )}
          />
        </Grid>
        {imageUrl && (
          <Grid size={{ xs: 12 }}>
            <Box
              component="img"
              src={imageUrl}
              alt="Preview"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              sx={{ height: 80, borderRadius: 1, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }}
            />
          </Grid>
        )}
        <Grid size={{ xs: 12 }}>
          <Divider />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={e => field.onChange(e.target.checked)}
                    id="menu-item-active"
                    color="success"
                  />
                }
                label={field.value ? 'Active' : 'Inactive'}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
