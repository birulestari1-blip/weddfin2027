import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, CircularProgress, Alert, Chip,
  Card, CardContent, Divider, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, Tooltip,
} from '@mui/material';
import { ArrowBack, Edit, Delete, CameraAlt, Build, BrokenImage, CheckCircle } from '@mui/icons-material';
import { photographyEquipmentService } from '../services/photography-equipment.service';
import { usePhotographyEquipment } from '../hooks/usePhotographyEquipment';
import type { PhotographyEquipment, EquipmentStatus } from '../types/photography.types';

const STATUS_CONFIG: Record<EquipmentStatus, { label: string; color: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactNode }> = {
  available: { label: 'Available', color: 'success', icon: <CheckCircle fontSize="small" /> },
  reserved: { label: 'Reserved', color: 'default', icon: <CameraAlt fontSize="small" /> },
  maintenance: { label: 'In Maintenance', color: 'warning', icon: <Build fontSize="small" /> },
  damaged: { label: 'Damaged', color: 'error', icon: <BrokenImage fontSize="small" /> },
};

const DetailRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={500}>{value || '—'}</Typography>
  </Box>
);

export const EquipmentDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { deleteEquipment } = usePhotographyEquipment();

  const [equipment, setEquipment] = useState<PhotographyEquipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEquipment = async () => {
    if (!id) return;
    setIsLoading(true);
    const result = await photographyEquipmentService.getById(id);
    if (result.success) setEquipment(result.data as unknown as PhotographyEquipment);
    else setError(result.error?.message ?? 'Equipment not found');
    setIsLoading(false);
  };

  useEffect(() => { fetchEquipment(); }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const result = await deleteEquipment(id);
    if (result.success) {
      navigate('/photography/equipment');
    } else {
      setError(result.error?.message ?? 'Failed to delete');
      setIsDeleting(false);
      setDeleteOpen(false);
    }
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

  const statusCfg = STATUS_CONFIG[equipment.status];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      {/* Top bar */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => navigate('/photography/equipment')} id="equipment-detail-back">
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={800}>{equipment.equipment_type}</Typography>
            {(equipment.brand || equipment.model) && (
              <Typography variant="body2" color="text.secondary">
                {[equipment.brand, equipment.model].filter(Boolean).join(' · ')}
              </Typography>
            )}
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/photography/equipment/${id}/edit`)}
            id="equipment-detail-edit"
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteOpen(true)}
            id="equipment-detail-delete"
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box
                  sx={{
                    width: 56, height: 56, borderRadius: 2,
                    bgcolor: 'primary.50', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <CameraAlt color="primary" sx={{ fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{equipment.equipment_type}</Typography>
                  <Chip
                    icon={statusCfg.icon as any}
                    label={statusCfg.label}
                    color={statusCfg.color}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <DetailRow label="Brand" value={equipment.brand} />
              <DetailRow label="Model" value={equipment.model} />
              <DetailRow label="Serial Number" value={equipment.serial_number} />
              <DetailRow
                label="Linked Inventory Item"
                value={
                  equipment.inventory_item
                    ? equipment.inventory_item.name
                    : equipment.inventory_item_id
                    ? 'Linked (details not loaded)'
                    : 'Not linked'
                }
              />
            </CardContent>
          </Card>

          {equipment.notes && (
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={1}>Notes</Typography>
                <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
                  {equipment.notes}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Details</Typography>
              <DetailRow
                label="Status"
                value={statusCfg.label}
              />
              <DetailRow
                label="Created"
                value={new Date(equipment.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              />
              <DetailRow
                label="Last Updated"
                value={new Date(equipment.updated_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Equipment</DialogTitle>
        <DialogContent>
          <Typography>
            Permanently delete <strong>{equipment.equipment_type}</strong>
            {equipment.serial_number ? ` (S/N: ${equipment.serial_number})` : ''}?
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting} id="equipment-delete-confirm">
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
