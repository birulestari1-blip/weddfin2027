import React from 'react';
import {
  Grid,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import type { PortfolioFormInput } from '../schemas/portfolio.schema';

interface Props {
  formData: PortfolioFormInput;
  setFormData: React.Dispatch<React.SetStateAction<PortfolioFormInput>>;
  errors: Record<string, string>;
}

export const PortfolioForm: React.FC<Props> = ({
  formData,
  setFormData,
  errors,
}) => {
  const field = (key: keyof PortfolioFormInput) => ({
    value: (formData[key] as string | number) ?? '',
    error: !!errors[key],
    helperText: errors[key] || undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <TextField label="Title" fullWidth required {...field('title')} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField label="Description" fullWidth multiline minRows={3} {...field('description')} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Event Date"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          {...field('event_date')}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField label="Venue Name" fullWidth {...field('venue_name')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.is_featured || false}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
            />
          }
          label="Featured Portfolio"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.is_published || false}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
            />
          }
          label="Published"
        />
      </Grid>
    </Grid>
  );
};
