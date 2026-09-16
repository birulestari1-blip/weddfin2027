import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, InputAdornment, Alert, CircularProgress } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { ClientTable } from '../components/ClientTable';
import { ClientDialog } from '../components/ClientDialog';
import { useClients } from '../hooks/useClients';
import type { Client } from '../repositories/client.repository';
import type { ClientInput } from '../schemas/client.schema';

export const ClientsPage: React.FC = () => {
  const { clients, isLoading, error, fetchClients, createClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    // Basic debounce for search
    const timer = setTimeout(() => {
      fetchClients(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchClients]);

  const handleOpenCreate = () => {
    setEditingClient(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: ClientInput) => {
    if (editingClient) {
      const { success } = await updateClient(editingClient.id, data);
      return success;
    } else {
      const { success } = await createClient(data);
      return success;
    }
  };

  const handleDelete = async (id: string) => {
    const { success } = await deleteClient(id);
    return success;
  };

  return (
    <PageContainer
      title="Clients"
      description="Manage your event clients and contacts."
      action={
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
          Add Client
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'An error occurred while fetching clients.'}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search clients..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {isLoading && clients.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ClientTable clients={clients} onEdit={handleOpenEdit} onDelete={handleDelete} />
      )}

      <ClientDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        client={editingClient}
      />
    </PageContainer>
  );
};
