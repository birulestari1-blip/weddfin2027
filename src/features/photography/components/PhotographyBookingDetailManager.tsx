import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Grid, Divider, Alert, CircularProgress,
  Card, CardContent, Chip, Collapse, IconButton, Tooltip,
} from '@mui/material';
import { Edit, ExpandMore, ExpandLess, CameraAlt, Save } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePhotographyBookingDetails } from '../hooks/usePhotographyBookingDetails';
import {
  photographyBookingDetailSchema,
  type PhotographyBookingDetailFormInput,
} from '../schemas/photography.schema';

interface PhotographyBookingDetailManagerProps {
  bookingId: string;
}

export const PhotographyBookingDetailManager: React.FC<PhotographyBookingDetailManagerProps> = ({ bookingId }) => {
  const { detail, isLoading, error, fetchDetail, upsertDetail } = usePhotographyBookingDetails(bookingId);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PhotographyBookingDetailFormInput>({
    resolver: zodResolver(photographyBookingDetailSchema),
    defaultValues: {
      booking_id: bookingId,
      shooting_duration_hours: null,
      photographer_count: 1,
      edited_photo_count: 0,
      album_quantity: 0,
      delivery_deadline: '',
      shot_list: [],
      editing_notes: '',
    },
  });

  // Sync form values when detail loads
  useEffect(() => {
    if (detail) {
      reset({
        booking_id: bookingId,
        shooting_duration_hours: detail.shooting_duration_hours ?? null,
        photographer_count: detail.photographer_count,
        edited_photo_count: detail.edited_photo_count,
        album_quantity: detail.album_quantity,
        delivery_deadline: detail.delivery_deadline
          ? new Date(detail.delivery_deadline).toISOString().slice(0, 16)
          : '',
        shot_list: detail.shot_list ?? [],
        editing_notes: detail.editing_notes ?? '',
      });
    }
  }, [detail, reset, bookingId]);

  const onSubmit = async (data: PhotographyBookingDetailFormInput) => {
    setSaving(true);
    setSaveError(null);
    const result = await upsertDetail(data);
    if (result.success) {
      setIsEditing(false);
    } else {
      setSaveError(result.error?.message ?? 'Failed to save photography details');
    }
    setSaving(false);
  };

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'primary.light', borderRadius: 3, mt: 3 }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <CameraAlt color="primary" />
            <Typography variant="subtitle1" fontWeight={700}>
              Photography Details
            </Typography>
            <Chip label="Photography" color="primary" size="small" variant="outlined" />
          </Box>
          <Box display="flex" gap={1}>
            {!isEditing && (
              <Tooltip title="Edit Photography Details">
                <IconButton
                  size="small"
                  onClick={() => setIsEditing(true)}
                  id="photography-detail-edit"
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ mb: 2 }} />

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : !isEditing ? (
            /* READ VIEW */
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">Duration</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {detail?.shooting_duration_hours != null ? `${detail.shooting_duration_hours} hours` : '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">Photographers</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {detail?.photographer_count ?? '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">Edited Photos</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {detail?.edited_photo_count ?? '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">Albums</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {detail?.album_quantity ?? '—'}
                </Typography>
              </Grid>
              {detail?.delivery_deadline && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">Delivery Deadline</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {new Date(detail.delivery_deadline).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </Typography>
                </Grid>
              )}
              {detail?.editing_notes && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">Editing Notes</Typography>
                  <Typography variant="body2" whiteSpace="pre-wrap">{detail.editing_notes}</Typography>
                </Grid>
              )}
              {!detail && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No photography details recorded yet. Click edit to add details.
                  </Typography>
                </Grid>
              )}
            </Grid>
          ) : (
            /* EDIT VIEW */
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="shooting_duration_hours"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        label="Shooting Duration (hours)"
                        type="number"
                        fullWidth
                        size="small"
                        inputProps={{ step: 0.5, min: 0 }}
                        error={!!errors.shooting_duration_hours}
                        helperText={errors.shooting_duration_hours?.message}
                        id="photo-duration"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="photographer_count"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        label="Photographer Count *"
                        type="number"
                        fullWidth
                        size="small"
                        inputProps={{ min: 1 }}
                        error={!!errors.photographer_count}
                        helperText={errors.photographer_count?.message}
                        id="photo-count"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="edited_photo_count"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        label="Edited Photo Count"
                        type="number"
                        fullWidth
                        size="small"
                        inputProps={{ min: 0 }}
                        error={!!errors.edited_photo_count}
                        helperText={errors.edited_photo_count?.message}
                        id="photo-edited-count"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="album_quantity"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        label="Album Quantity"
                        type="number"
                        fullWidth
                        size="small"
                        inputProps={{ min: 0 }}
                        error={!!errors.album_quantity}
                        helperText={errors.album_quantity?.message}
                        id="photo-albums"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="delivery_deadline"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        label="Delivery Deadline"
                        type="datetime-local"
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.delivery_deadline}
                        id="photo-deadline"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="editing_notes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        label="Editing Notes"
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        error={!!errors.editing_notes}
                        helperText={errors.editing_notes?.message}
                        id="photo-editing-notes"
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                <Button onClick={() => { setIsEditing(false); setSaveError(null); }} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={saving}
                  id="photography-detail-save"
                >
                  {saving ? 'Saving…' : 'Save Details'}
                </Button>
              </Box>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};
