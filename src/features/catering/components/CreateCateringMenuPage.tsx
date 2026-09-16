import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, AppBar, Toolbar, IconButton,
  Alert, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useCateringMenus } from '../hooks/useCateringMenus';
import { CateringMenuForm } from './CateringMenuForm';
import type { CateringMenuFormInput } from '../schemas/catering-menu.schema';

export const CreateCateringMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { createMenu } = useCateringMenus();
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (data: CateringMenuFormInput) => {
    setSaving(true);
    setError(null);
    const result = await createMenu(data);
    if (result.success && (result as any).data) {
      navigate(`/catering/menus/${(result as any).data.id}`);
    } else {
      setError(result.error?.message || 'Failed to create menu.');
    }
    setSaving(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Bar */}
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/catering/menus')} sx={{ mr: 1 }} id="back-btn">
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
              <Typography color="text.primary">Create New</Typography>
            </Breadcrumbs>
          </Box>
          <Button
            type="submit"
            form="catering-menu-form"
            variant="contained"
            startIcon={<Save />}
            disabled={saving}
            id="create-menu-save"
          >
            {saving ? 'Saving...' : 'Create Menu'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3 }}>
        <Typography variant="h5" fontWeight={800} mb={0.5}>
          Create New Catering Menu
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Define a menu package with pricing and items.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <CateringMenuForm onSubmit={handleSubmit} />
      </Box>
    </Box>
  );
};
