import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, AppBar, Toolbar, IconButton,
  Alert, Breadcrumbs, Link as MuiLink, Card, CardContent, CircularProgress,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { photographyEquipmentService } from '../services/photography-equipment.service';
import { usePhotographyEquipment } from '../hooks/usePhotographyEquipment';
import { EquipmentForm } from './EquipmentForm';
import type { PhotographyEquipment } from '../types/photography.types';
import type { PhotographyEquipmentFormInput } from '../schemas/photography.schema';

export const EditEquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateEquipment } = usePhotographyEquipment();

  const [equipment, setEquipment] = useState<PhotographyEquipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      const result = await photographyEquipmentService.getById(id);
      if (result.success) setEquipment(result.data as unknown as PhotographyEquipment);
      else setError(result.error?.message ?? 'Equipment not found');
      setIsLoading(false);
    };
    load();
  }, [id]);

  const handleSubmit = async (data: PhotographyEquipmentFormInput) => {
    if (!id) return;
    setSaving(true);
    setError(null);
    const result = await updateEquipment(id, data);
    if (result.success) {
      navigate(`/photography/equipment/${id}`);
    } else {
      setError(result.error?.message || 'Failed to update equipment.');
    }
    setSaving(false);
  };

  if (isLoading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
    </Box>
  );

  if (error || !equipment) return (
    <Box p={3}>
      <Alert severity="error">{error || 'Equipment not found'}</Alert>
      <Button onClick={() => navigate('/photography/equipment')} sx={{ mt: 2 }}>Back to Equipment</Button>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(`/photography/equipment/${id}`)} sx={{ mr: 1 }} id="edit-equipment-back">
            <ArrowBack />
          </IconButton>
          <Box flex={1}>
            <Breadcrumbs>
              <MuiLink component="button" underline="hover" color="inherit" onClick={() => navigate('/photography/equipment')} sx={{ cursor: 'pointer' }}>
                Equipment
              </MuiLink>
              <MuiLink component="button" underline="hover" color="inherit" onClick={() => navigate(`/photography/equipment/${id}`)} sx={{ cursor: 'pointer' }}>
                {equipment.equipment_type}
              </MuiLink>
              <Typography color="text.primary">Edit</Typography>
            </Breadcrumbs>
          </Box>
          <Button
            type="submit"
            form="equipment-form"
            variant="contained"
            startIcon={<Save />}
            disabled={saving}
            id="edit-equipment-save"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Typography variant="h5" fontWeight={800} mb={3}>
          Edit Equipment: {equipment.equipment_type}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <EquipmentForm onSubmit={handleSubmit} existingEquipment={equipment} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
