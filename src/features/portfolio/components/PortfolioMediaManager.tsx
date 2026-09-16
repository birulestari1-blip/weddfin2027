import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import type { PortfolioMediaFormInput } from '../schemas/portfolio.schema';
import type { PortfolioMediaRow } from '../types/portfolio.types';

interface Props {
  media: PortfolioMediaRow[];
  onAdd: (input: PortfolioMediaFormInput) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

export const PortfolioMediaManager: React.FC<Props> = ({ media, onAdd, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PortfolioMediaFormInput>({
    media_type: 'image',
    media_url: '',
    thumbnail_url: null,
    caption: null,
    display_order: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    setIsSaving(true);
    const res = await onAdd(formData);
    setIsSaving(false);
    if (res.success) {
      setOpen(false);
      setFormData({
        media_type: 'image',
        media_url: '',
        thumbnail_url: null,
        caption: null,
        display_order: media.length,
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Media Gallery ({media.length})
        </Typography>
        <Button startIcon={<Add />} onClick={() => setOpen(true)} size="small" variant="outlined">
          Add Media
        </Button>
      </Box>

      {media.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          No media added yet. Add images or videos to showcase this portfolio.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {media
            .sort((a, b) => a.display_order - b.display_order)
            .map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <Card sx={{ position: 'relative', height: '100%' }}>
                  <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                    <IconButton
                      size="small"
                      color="error"
                      sx={{ bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}
                      onClick={() => onDelete(item.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                  {item.media_type === 'image' ? (
                    <Box
                      component="img"
                      src={item.media_url}
                      alt={item.caption || 'Portfolio media'}
                      sx={{ width: '100%', height: 160, objectFit: 'cover' }}
                      onError={(e: any) => { e.target.src = 'https://via.placeholder.com/300?text=Invalid+Image+URL'; }}
                    />
                  ) : (
                    <Box
                      sx={{ width: '100%', height: 160, bgcolor: 'grey.900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Typography color="white">Video Link</Typography>
                    </Box>
                  )}
                  <CardContent sx={{ p: 1.5, pb: '12px !important' }}>
                    {item.caption && (
                      <Typography variant="body2" noWrap>
                        {item.caption}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Media Link</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Media Type</InputLabel>
                <Select
                  value={formData.media_type}
                  label="Media Type"
                  onChange={(e) => setFormData((prev) => ({ ...prev, media_type: e.target.value as any }))}
                >
                  <MenuItem value="image">Image URL</MenuItem>
                  <MenuItem value="video">Video URL</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Media URL"
                fullWidth
                required
                value={formData.media_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, media_url: e.target.value }))}
                helperText="Must be a valid URL starting with http:// or https://"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Caption (Optional)"
                fullWidth
                value={formData.caption || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={isSaving || !formData.media_url}>
            {isSaving ? 'Adding...' : 'Add Media'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
