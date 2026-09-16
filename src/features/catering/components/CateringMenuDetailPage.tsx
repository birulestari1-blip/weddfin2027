import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, CircularProgress, Alert,
  Grid, Card, CardContent, Chip, Divider, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, CardMedia,
} from '@mui/material';
import { ArrowBack, Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import { cateringMenuService } from '../services/catering-menu.service';
import type { CateringMenuWithItems } from '../types/catering-menu.types';
import { MenuItemsManager } from './MenuItemsManager';

export const CateringMenuDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [menu, setMenu] = useState<CateringMenuWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMenu = async () => {
    if (!id) return;
    setIsLoading(true);
    const { data, error: err } = await cateringMenuService.getMenuById(id);
    if (err) setError(err.message);
    else setMenu(data as unknown as CateringMenuWithItems);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMenu();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const result = await cateringMenuService.deleteMenu(id);
    if (result.success) {
      navigate('/catering/menus');
    } else {
      setError(result.error?.message || 'Failed to delete menu');
      setDeleteOpen(false);
    }
    setIsDeleting(false);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !menu) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Menu not found'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/catering/menus')} sx={{ mt: 2 }}>
          Back to Menus
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/catering/menus')} id="back-to-menus">
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom={false}>
              {menu.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip
                icon={menu.is_active ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                label={menu.is_active ? 'Active' : 'Inactive'}
                color={menu.is_active ? 'success' : 'default'}
                size="small"
              />
              {menu.category && (
                <Chip label={menu.category} size="small" variant="outlined" />
              )}
            </Box>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Edit Menu Info">
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/catering/menus/${menu.id}/edit`)}
              id="edit-menu-btn"
            >
              Edit Info
            </Button>
          </Tooltip>
          <Tooltip title="Delete Menu">
            <IconButton color="error" onClick={() => setDeleteOpen(true)} id="delete-menu-btn">
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Details */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
            {menu.image_url ? (
              <CardMedia
                component="img"
                height="200"
                image={menu.image_url}
                alt={menu.name}
                sx={{ objectFit: 'cover' }}
              />
            ) : (
              <Box
                height={200}
                bgcolor="grey.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography color="text.disabled">No Image</Typography>
              </Box>
            )}
            <CardContent>
              <Typography variant="overline" color="text.secondary">Price Per Pax</Typography>
              <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                Rp {menu.price_per_pax.toLocaleString('id-ID')}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="overline" color="text.secondary">Description</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {menu.description || 'No description provided.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Menu Items */}
        <Grid size={{ xs: 12, md: 8 }}>
          <MenuItemsManager menuId={menu.id} menuName={menu.name} />
        </Grid>
      </Grid>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Menu</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <b>{menu.name}</b>? This will also delete all associated menu items and recipes. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} id="cancel-delete">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting} id="confirm-delete">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
