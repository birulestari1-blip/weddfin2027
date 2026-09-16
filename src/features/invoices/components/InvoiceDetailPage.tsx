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
import { ArrowBack, Edit, MoreVert, Receipt } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge';
import { invoiceService } from '../services/invoice.service';
import { useInvoices } from '../hooks/useInvoices';
import type { InvoiceWithDetails, InvoiceStatus } from '../types/invoice.types';
import { INVOICE_STATUS_LABELS, PAYMENT_STAGE_LABELS } from '../types/invoice.types';

const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;

const ALLOWED_TRANSITIONS: Partial<Record<InvoiceStatus, InvoiceStatus[]>> = {
  unpaid: ['paid', 'overdue', 'canceled'],
  overdue: ['paid', 'canceled'],
};

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateStatus, deleteInvoice } = useInvoices();
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
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
      const { data, error } = await invoiceService.getInvoiceById(id);
      if (error) setLoadError(error.message);
      else setInvoice(data as InvoiceWithDetails);
      setIsLoading(false);
    };
    load();
  }, [id]);

  const handleStatusChange = async (status: InvoiceStatus) => {
    if (!id) return;
    setMenuAnchor(null);
    setActionError(null);
    const result = await updateStatus(id, status);
    if (result.success) {
      setInvoice((prev) => (prev ? { ...prev, status } : prev));
    } else {
      setActionError(result.error?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const result = await deleteInvoice(id);
    setIsDeleting(false);
    if (result.success) navigate('/invoices');
    else setActionError(result.error?.message || 'Failed to delete invoice.');
  };

  if (isLoading) return <PageContainer title="Invoice Detail"><Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box></PageContainer>;
  if (loadError || !invoice) return <PageContainer title="Invoice Detail"><Alert severity="error">{loadError || 'Invoice not found.'}</Alert></PageContainer>;

  const nextStatuses = ALLOWED_TRANSITIONS[invoice.status] || [];
  const booking = invoice.vendor_bookings;
  const client = booking?.clients;

  return (
    <PageContainer
      title={invoice.invoice_number}
      description={`${PAYMENT_STAGE_LABELS[invoice.payment_stage]} — ${formatCurrency(invoice.amount)}`}
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/invoices')} color="inherit">Back</Button>
          {invoice.status !== 'paid' && invoice.status !== 'canceled' && (
            <Button startIcon={<Edit />} variant="outlined" onClick={() => navigate(`/invoices/${id}/edit`)}>Edit</Button>
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
                Mark as {INVOICE_STATUS_LABELS[s]}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem sx={{ color: 'error.main' }} onClick={() => setDeleteDialogOpen(true)}>
              Delete Invoice
            </MenuItem>
          </Menu>
        </Box>
      }
    >
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

      <Grid container spacing={3}>
        {/* Header */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Receipt color="primary" />
                    <Typography variant="h6" fontWeight={700}>{invoice.invoice_number}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Issued: {new Date(invoice.created_at).toLocaleDateString('id-ID')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due: {new Date(invoice.due_date).toLocaleDateString('id-ID')}
                  </Typography>
                  {invoice.paid_at && (
                    <Typography variant="body2" color="success.main">
                      Paid: {new Date(invoice.paid_at).toLocaleDateString('id-ID')}
                    </Typography>
                  )}
                </Box>
                <InvoiceStatusBadge status={invoice.status} size="medium" />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Client */}
              {client && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Bill To</Typography>
                  <Typography fontWeight={600}>{client.full_name}</Typography>
                  {client.company_name && <Typography variant="body2">{client.company_name}</Typography>}
                  {client.email && <Typography variant="body2" color="text.secondary">{client.email}</Typography>}
                  {client.phone_number && <Typography variant="body2" color="text.secondary">{client.phone_number}</Typography>}
                </Box>
              )}

              {/* Booking reference */}
              {booking && (
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Booking Reference</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{booking.client_name}</Typography>
                      {booking.event_name && (
                        <Typography variant="body2" color="text.secondary">{booking.event_name}</Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Event: {new Date(booking.event_date).toLocaleDateString('id-ID')}
                      </Typography>
                    </Box>
                    <Button size="small" variant="outlined" onClick={() => navigate(`/bookings/${booking.id}`)}>
                      View Booking
                    </Button>
                  </Box>
                </Box>
              )}

              {invoice.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                  <Typography variant="body2">{invoice.notes}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Financials */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Invoice Summary</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Payment Stage</Typography>
                <Typography fontWeight={500}>{PAYMENT_STAGE_LABELS[invoice.payment_stage]}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={700} variant="h6">Total</Typography>
                <Typography fontWeight={700} variant="h6" color="primary.main">
                  {formatCurrency(invoice.amount)}
                </Typography>
              </Box>

              {invoice.payment_method && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                  <Typography variant="body2">{invoice.payment_method}</Typography>
                </Box>
              )}
              {invoice.payment_reference_id && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">Reference ID</Typography>
                  <Typography variant="body2">{invoice.payment_reference_id}</Typography>
                </Box>
              )}
              {invoice.payment_link && (
                <Button
                  fullWidth
                  variant="outlined"
                  href={invoice.payment_link}
                  target="_blank"
                  sx={{ mt: 2 }}
                >
                  Payment Link
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <Typography>Permanently delete <strong>{invoice.invoice_number}</strong>? This cannot be undone.</Typography>
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
