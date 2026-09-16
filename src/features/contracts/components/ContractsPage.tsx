import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add, Edit, Visibility } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { ContractStatusBadge } from '../components/ContractStatusBadge';
import { useContracts } from '../hooks/useContracts';

export const ContractsPage: React.FC = () => {
  const navigate = useNavigate();
  const { contracts, isLoading, error, fetchContracts } = useContracts();

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return (
    <PageContainer
      title="Contracts"
      description="Manage legally binding contracts with your clients."
      action={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/contracts/create')}
        >
          Create Contract
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress />
            </Box>
          ) : contracts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No contracts yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first contract from a confirmed booking.
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/contracts/create')}>
                Create Contract
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Contract #</TableCell>
                    <TableCell>Booking / Client</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {contract.contract_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {contract.vendor_bookings?.client_name || '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {contract.vendor_bookings?.event_name || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(contract.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <ContractStatusBadge status={contract.status as any} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => navigate(`/contracts/${contract.id}`)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => navigate(`/contracts/${contract.id}/edit`)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};
