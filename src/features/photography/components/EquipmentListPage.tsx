import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, InputAdornment, Chip, Grid,
  Card, CardContent, CircularProgress, Alert, MenuItem, Tooltip, IconButton,
} from '@mui/material';
import { Add, Search, CameraAlt, FilterList, Edit, Delete } from '@mui/icons-material';
import { usePhotographyEquipment } from '../hooks/usePhotographyEquipment';
import type { EquipmentStatus } from '../types/photography.types';

const STATUS_COLORS: Record<EquipmentStatus, 'success' | 'warning' | 'error' | 'default'> = {
  available: 'success',
  reserved: 'default',
  maintenance: 'warning',
  damaged: 'error',
};

const STATUS_LABELS: Record<EquipmentStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  maintenance: 'Maintenance',
  damaged: 'Damaged',
};

export const EquipmentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { equipment, isLoading, error, fetchAll, deleteEquipment } = usePhotographyEquipment();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EquipmentStatus>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = equipment.filter((eq) => {
    const matchSearch =
      eq.equipment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.brand ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.model ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.serial_number ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || eq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this equipment? This cannot be undone.')) return;
    setDeleting(id);
    await deleteEquipment(id);
    setDeleting(null);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        display="flex"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Photography Equipment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your cameras, lenses, and other photography gear.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/photography/equipment/create')}
          id="equipment-add-btn"
        >
          Add Equipment
        </Button>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} mb={4} flexDirection={{ xs: 'column', sm: 'row' }}>
        <TextField
          placeholder="Search equipment…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, maxWidth: { sm: 360 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          id="equipment-search"
        />
        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          sx={{ minWidth: 160 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><FilterList fontSize="small" /></InputAdornment> }}
          id="equipment-status-filter"
        >
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value="available">Available</MenuItem>
          <MenuItem value="reserved">Reserved</MenuItem>
          <MenuItem value="maintenance">Maintenance</MenuItem>
          <MenuItem value="damaged">Damaged</MenuItem>
        </TextField>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={8}>
          <CameraAlt sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm || statusFilter !== 'all' ? 'No equipment matches your filters.' : 'No equipment yet.'}
          </Typography>
          {!searchTerm && statusFilter === 'all' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/photography/equipment/create')}
              id="equipment-add-first"
              sx={{ mt: 2 }}
            >
              Add First Equipment
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((eq) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={eq.id}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: 4, borderColor: 'primary.main', transform: 'translateY(-2px)' },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onClick={() => navigate(`/photography/equipment/${eq.id}`)}
              >
                {/* Color accent header */}
                <Box
                  sx={{
                    height: 6,
                    bgcolor:
                      eq.status === 'available' ? 'success.main' :
                      eq.status === 'maintenance' ? 'warning.main' :
                      eq.status === 'damaged' ? 'error.main' : 'grey.400',
                    borderRadius: '12px 12px 0 0',
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1, mr: 1 }}>
                      {eq.equipment_type}
                    </Typography>
                    <Chip
                      label={STATUS_LABELS[eq.status]}
                      size="small"
                      color={STATUS_COLORS[eq.status]}
                      variant="outlined"
                    />
                  </Box>
                  {(eq.brand || eq.model) && (
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      {[eq.brand, eq.model].filter(Boolean).join(' ')}
                    </Typography>
                  )}
                  {eq.serial_number && (
                    <Typography variant="caption" color="text.disabled" display="block" mb={1}>
                      S/N: {eq.serial_number}
                    </Typography>
                  )}
                  {eq.notes && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {eq.notes}
                    </Typography>
                  )}
                </CardContent>
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  gap={1}
                  px={2}
                  pb={2}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/photography/equipment/${eq.id}/edit`)}
                      id={`equipment-edit-${eq.id}`}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      disabled={deleting === eq.id}
                      onClick={(e) => handleDelete(eq.id, e)}
                      id={`equipment-delete-${eq.id}`}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
