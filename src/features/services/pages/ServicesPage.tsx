import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, InputAdornment, Alert, CircularProgress, MenuItem } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { ServiceTable } from '../components/ServiceTable';
import { ServiceDialog } from '../components/ServiceDialog';
import { useServices } from '../hooks/useServices';
import type { VendorService } from '../repositories/service.repository';
import type { ServiceInput } from '../schemas/service.schema';

export const ServicesPage: React.FC = () => {
  const { services, isLoading, error, fetchServices, createService, updateService, deleteService } = useServices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<VendorService | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices(
        searchTerm, 
        statusFilter === 'all' ? undefined : statusFilter === 'active'
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchServices]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (service: VendorService) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: ServiceInput) => {
    if (editingService) {
      const { success } = await updateService(editingService.id, data);
      return success;
    } else {
      const { success } = await createService(data);
      return success;
    }
  };

  const handleDelete = async (id: string) => {
    const { success } = await deleteService(id);
    return success;
  };

  return (
    <PageContainer
      title="Services & Packages"
      description="Define and manage your business service offerings."
      action={
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
          Add Service
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'An error occurred while fetching services.'}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search services..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          select
          variant="outlined"
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </Box>

      {isLoading && services.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ServiceTable services={services} onEdit={handleOpenEdit} onDelete={handleDelete} />
      )}

      <ServiceDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        service={editingService}
      />
    </PageContainer>
  );
};
