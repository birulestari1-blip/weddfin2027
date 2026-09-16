import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, AppBar, Toolbar, IconButton,
  CircularProgress, Alert, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { cateringMenuService } from '../services/catering-menu.service';
import { CateringMenuForm } from './CateringMenuForm';
import type { CateringMenuFormInput } from '../schemas/catering-menu.schema';
import type { CateringMenu } from '../types/catering-menu.types';

export const EditCateringMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [menu, setMenu] = useState<CateringMenu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!id) return;
      setIsLoading(true);
      const { data, error: err } = await cateringMenuService.getMenuById(id);
      if (err) setError(err.message);
      else setMenu(data as unknown as CateringMenu);
      setIsLoading(false);
    };
    fetchMenu();
  }, [id]);

  const handleSubmit = async (data: CateringMenuFormInput) => {
    if (!id) return;
    setSaving(true);
    setError(null);
    const result = await cateringMenuService.updateMenu(id, data);
    if (result.success) {
      navigate(`/catering/menus/${id}`);
    } else {
      setError(result.error?.message || 'Failed to update menu.');
    }
    setSaving(false);
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
        <Button onClick={() => navigate('/catering/menus')} sx={{ mt: 2 }}>Back to Menus</Button>
      </Box>
    );
  }

  const defaultValues: Partial<CateringMenuFormInput> = {
    name: menu.name,
    description: menu.description ?? '',
    category: menu.category ?? '',
    image_url: menu.image_url ?? '',
    price_per_pax: menu.price_per_pax,
    is_active: menu.is_active,
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Bar */}
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(`/catering/menus/${id}`)} sx={{ mr: 1 }} id="back-btn">
            <ArrowBack />
          </IconButton>
          <Box flex={1}>
            <Breadcrumbs>
              <MuiLink
                component="button"
                underline="hover"
                color="inherit"
                onClick={() => navigate('/catering/menus')}
                sx={{ cursor: 'pointer' }}
              >
                Catering Menus
              </MuiLink>
              <MuiLink
                component="button"
                underline="hover"
                color="inherit"
                onClick={() => navigate(`/catering/menus/${id}`)}
                sx={{ cursor: 'pointer' }}
              >
                {menu.name}
              </MuiLink>
              <Typography color="text.primary">Edit</Typography>
            </Breadcrumbs>
          </Box>
          <Button
            type="submit"
            form="catering-menu-form"
            variant="contained"
            startIcon={<Save />}
            disabled={saving}
            id="edit-menu-save"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3 }}>
        <Typography variant="h5" fontWeight={800} mb={3}>
          Edit Menu: {menu.name}
        </Typography>

        <CateringMenuForm 
          defaultValues={defaultValues} 
          onSubmit={handleSubmit} 
          existingMenu={menu}
        />
      </Box>
    </Box>
  );
};
