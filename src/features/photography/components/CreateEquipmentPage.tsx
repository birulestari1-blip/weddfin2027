import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, AppBar, Toolbar, IconButton,
  Alert, Breadcrumbs, Link as MuiLink, Card, CardContent,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { usePhotographyEquipment } from '../hooks/usePhotographyEquipment';
import { EquipmentForm } from './EquipmentForm';
import type { PhotographyEquipmentFormInput } from '../schemas/photography.schema';

export const CreateEquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { createEquipment } = usePhotographyEquipment();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: PhotographyEquipmentFormInput) => {
    setSaving(true);
    setError(null);
    const result = await createEquipment(data);
    if (result.success && (result as any).data) {
      navigate(`/photography/equipment/${(result as any).data.id}`);
    } else {
      setError(result.error?.message || 'Failed to create equipment.');
    }
    setSaving(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/photography/equipment')} sx={{ mr: 1 }} id="create-equipment-back">
            <ArrowBack />
          </IconButton>
          <Box flex={1}>
            <Breadcrumbs>
              <MuiLink component="button" underline="hover" color="inherit" onClick={() => navigate('/photography/overview')} sx={{ cursor: 'pointer' }}>
                Photography
              </MuiLink>
              <MuiLink component="button" underline="hover" color="inherit" onClick={() => navigate('/photography/equipment')} sx={{ cursor: 'pointer' }}>
                Equipment
              </MuiLink>
              <Typography color="text.primary">New</Typography>
            </Breadcrumbs>
          </Box>
          <Button
            type="submit"
            form="equipment-form"
            variant="contained"
            startIcon={<Save />}
            disabled={saving}
            id="create-equipment-save"
          >
            {saving ? 'Saving…' : 'Save Equipment'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Typography variant="h5" fontWeight={800} mb={3}>
          Add New Equipment
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <EquipmentForm onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
