import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Menu,
} from '@mui/material';
import { ArrowBack, Edit, MoreVert, Description } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { ContractStatusBadge } from '../components/ContractStatusBadge';
import { contractService } from '../services/contract.service';
import { useContracts } from '../hooks/useContracts';
import type { ContractWithDetails, ContractStatus } from '../types/contract.types';
import { CONTRACT_STATUS_LABELS } from '../types/contract.types';

const ALLOWED_TRANSITIONS: Partial<Record<ContractStatus, ContractStatus[]>> = {
  draft: ['sent', 'void'],
  sent: ['signed', 'rejected', 'void'],
  rejected: ['draft', 'void'], // can revert to draft to edit and resend
};

export const ContractDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateStatus, deleteContract } = useContracts();
  const [contract, setContract] = useState<ContractWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      const { data, error } = await contractService.getContractById(id);
      if (error) setLoadError(error.message);
      else setContract(data as unknown as ContractWithDetails);
      setIsLoading(false);
    };
    load();
  }, [id]);

  const handleStatusChange = async (status: ContractStatus) => {
    if (!id) return;
    setMenuAnchor(null);
    setActionError(null);
    const result = await updateStatus(id, status);
    if (result.success) {
      setContract((prev) => (prev ? { ...prev, status } : prev));
    } else {
      setActionError(result.error?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const result = await deleteContract(id);
    setIsDeleting(false);
    if (result.success) navigate('/contracts');
    else setActionError(result.error?.message || 'Failed to delete contract.');
  };

  if (isLoading) return <PageContainer title="Contract Detail"><Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box></PageContainer>;
  if (loadError || !contract) return <PageContainer title="Contract Detail"><Alert severity="error">{loadError || 'Contract not found.'}</Alert></PageContainer>;

  const nextStatuses = ALLOWED_TRANSITIONS[contract.status as ContractStatus] || [];
  const booking = contract.vendor_bookings;
  const client = booking?.clients;

  return (
    <PageContainer
      title={contract.contract_number}
      description={`Booking: ${booking?.client_name}`}
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/contracts')} color="inherit">Back</Button>
          {contract.status !== 'void' && contract.status !== 'rejected' && (
            <Button startIcon={<Edit />} variant="outlined" onClick={() => navigate(`/contracts/${id}/edit`)}>Edit</Button>
          )}
          <Button
            variant="contained"
            endIcon={<MoreVert />}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            disabled={nextStatuses.length === 0}
          >
            Actions
          </Button>
          <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
            {nextStatuses.map((s) => (
              <MenuItem key={s} onClick={() => handleStatusChange(s)}>
                Mark as {CONTRACT_STATUS_LABELS[s]}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem sx={{ color: 'error.main' }} onClick={() => setDeleteDialogOpen(true)}>
              Delete Contract
            </MenuItem>
          </Menu>
        </Box>
      }
    >
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Description color="primary" />
                    <Typography variant="h6" fontWeight={700}>{contract.contract_number}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(contract.created_at).toLocaleDateString('id-ID')}
                  </Typography>
                </Box>
                <ContractStatusBadge status={contract.status as ContractStatus} size="medium" />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Client & Booking */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                {client && (
                  <Box sx={{ flex: 1, minWidth: 200, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Client Info</Typography>
                    <Typography fontWeight={600}>{client.full_name}</Typography>
                    {client.company_name && <Typography variant="body2">{client.company_name}</Typography>}
                  </Box>
                )}
                {booking && (
                  <Box sx={{ flex: 1, minWidth: 200, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Booking Reference</Typography>
                    <Typography variant="body2" fontWeight={600}>{booking.client_name}</Typography>
                    <Typography variant="body2" color="text.secondary">{booking.event_name}</Typography>
                    <Button size="small" sx={{ mt: 1 }} variant="outlined" onClick={() => navigate(`/bookings/${booking.id}`)}>
                      View Booking
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Terms */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Terms & Conditions</Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {contract.terms_and_conditions}
                </Typography>
              </Box>

            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Signatures & Documents</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Client Signature Date</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {contract.client_signed_at ? new Date(contract.client_signed_at).toLocaleString('id-ID') : 'Pending'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Vendor Signature Date</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {contract.vendor_signed_at ? new Date(contract.vendor_signed_at).toLocaleString('id-ID') : 'Pending'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {contract.pdf_url ? (
                <Button fullWidth variant="outlined" href={contract.pdf_url} target="_blank" sx={{ mb: 1 }}>
                  View PDF Document
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                  No PDF document attached
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Contract</DialogTitle>
        <DialogContent>
          <Typography>Permanently delete <strong>{contract.contract_number}</strong>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" disabled={isDeleting}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};
