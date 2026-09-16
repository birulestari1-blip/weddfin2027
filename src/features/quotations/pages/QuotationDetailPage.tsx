import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { Edit, ArrowBack, MoreVert, SwapHoriz, Launch } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { QuotationStatusBadge } from '../components/QuotationStatusBadge';
import { quotationService } from '../services/quotation.service';
import { useQuotations } from '../hooks/useQuotations';
import type { QuotationWithDetails, QuotationStatus } from '../types/quotation.types';

const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;

// Status transitions available at the application layer
const NEXT_STATUSES: Partial<Record<QuotationStatus, QuotationStatus[]>> = {
  draft: ['sent', 'canceled'],
  sent: ['accepted', 'rejected', 'expired', 'canceled'],
};

export const QuotationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateStatus, deleteQuotation } = useQuotations();
  const [quotation, setQuotation] = useState<QuotationWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      const { data, error: loadErr } = await quotationService.getQuotationById(id);
      if (loadErr) {
        setLoadError(loadErr.message);
      } else {
        setQuotation(data as QuotationWithDetails);
      }
      setIsLoading(false);
    };
    load();
  }, [id]);

  const handleStatusChange = async (status: QuotationStatus) => {
    if (!id) return;
    setMenuAnchor(null);
    const { success } = await updateStatus(id, status);
    if (success) {
      setQuotation((prev) => (prev ? { ...prev, status } : prev));
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const { success } = await deleteQuotation(id);
    setIsDeleting(false);
    if (success) {
      navigate('/quotations');
    }
  };

  // Navigate to the Create Booking page, pre-seeded with this quotation's ID
  const handleConvertToBooking = async () => {
    if (!quotation) return;
    setConvertError(null);

    // Guard: only accepted quotations can be converted
    if (quotation.status !== 'accepted') {
      setConvertError('Only accepted quotations can be converted to bookings.');
      return;
    }

    // Guard: already converted
    if (quotation.booking_id) {
      navigate(`/bookings/${quotation.booking_id}`);
      return;
    }

    setIsConverting(true);
    // Navigate to create booking page with the quotation pre-selected
    navigate(`/bookings/create?from_quotation=${quotation.id}`);
    // No need to reset isConverting since we navigate away
  };

  if (isLoading) {
    return (
      <PageContainer title="Quotation Detail">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (loadError || !quotation) {
    return (
      <PageContainer title="Quotation Detail">
        <Alert severity="error">{loadError || 'Quotation not found.'}</Alert>
      </PageContainer>
    );
  }

  const nextStatuses = NEXT_STATUSES[quotation.status] || [];
  const isAccepted = quotation.status === 'accepted';
  const isAlreadyConverted = !!quotation.booking_id;
  const canConvert = isAccepted && !isAlreadyConverted;
  const nonConvertibleStatuses: QuotationStatus[] = ['draft', 'sent', 'rejected', 'expired', 'canceled'];

  return (
    <PageContainer
      title={quotation.quotation_number}
      description={quotation.title}
      action={
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/quotations')}
            color="inherit"
          >
            Back
          </Button>

          {/* --- Conversion CTA section --- */}
          {canConvert && (
            <Button
              variant="contained"
              color="success"
              startIcon={<SwapHoriz />}
              onClick={handleConvertToBooking}
              disabled={isConverting}
            >
              Convert to Booking
            </Button>
          )}

          {isAlreadyConverted && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<Launch />}
              onClick={() => navigate(`/bookings/${quotation.booking_id}`)}
            >
              View Booking
            </Button>
          )}

          {!nonConvertibleStatuses.includes(quotation.status) && !isAccepted && null}

          <Button
            startIcon={<Edit />}
            variant="outlined"
            onClick={() => navigate(`/quotations/${id}/edit`)}
          >
            Edit
          </Button>

          <Button
            variant="contained"
            endIcon={<MoreVert />}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            disabled={nextStatuses.length === 0}
          >
            Actions
          </Button>
          <Menu
            anchorEl={menuAnchor}
            open={!!menuAnchor}
            onClose={() => setMenuAnchor(null)}
          >
            {nextStatuses.map((s) => (
              <MenuItem key={s} onClick={() => handleStatusChange(s)}>
                Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem sx={{ color: 'error.main' }} onClick={() => setDeleteDialogOpen(true)}>
              Delete Quotation
            </MenuItem>
          </Menu>
        </Box>
      }
    >
      {/* Conversion error display */}
      {convertError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setConvertError(null)}>
          {convertError}
        </Alert>
      )}

      {/* Already-converted banner */}
      {isAlreadyConverted && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate(`/bookings/${quotation.booking_id}`)}
            >
              View Booking
            </Button>
          }
        >
          This quotation has been converted to a booking.
        </Alert>
      )}

      {/* Eligibility notice for non-accepted statuses */}
      {nonConvertibleStatuses.includes(quotation.status) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This quotation is <strong>{quotation.status}</strong>. Only{' '}
          <strong>accepted</strong> quotations can be converted to bookings.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Header card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {quotation.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(quotation.created_at).toLocaleDateString('id-ID')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <QuotationStatusBadge status={quotation.status} size="medium" />
                  {isAlreadyConverted && (
                    <Chip label="Booking Created" color="success" size="small" variant="outlined" />
                  )}
                </Box>
              </Box>

              {quotation.clients && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Bill To
                  </Typography>
                  <Typography fontWeight={600}>{quotation.clients.full_name}</Typography>
                  {quotation.clients.company_name && (
                    <Typography variant="body2">{quotation.clients.company_name}</Typography>
                  )}
                  {quotation.clients.email && (
                    <Typography variant="body2" color="text.secondary">
                      {quotation.clients.email}
                    </Typography>
                  )}
                  {quotation.clients.phone_number && (
                    <Typography variant="body2" color="text.secondary">
                      {quotation.clients.phone_number}
                    </Typography>
                  )}
                </Box>
              )}

              {quotation.valid_until && (
                <Typography variant="body2" color="text.secondary">
                  Valid Until: {new Date(quotation.valid_until).toLocaleDateString('id-ID')}
                </Typography>
              )}

              {quotation.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body2">{quotation.notes}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Totals card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight={500}>{formatCurrency(quotation.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Discount</Typography>
                <Typography fontWeight={500} color="error.main">
                  -{formatCurrency(quotation.discount_amount)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Tax</Typography>
                <Typography fontWeight={500}>{formatCurrency(quotation.tax_amount)}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={700} variant="h6">
                  Total
                </Typography>
                <Typography fontWeight={700} variant="h6" color="primary.main">
                  {formatCurrency(quotation.total_amount)}
                </Typography>
              </Box>

              {/* Convert to Booking CTA — also visible in the sidebar */}
              {canConvert && (
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<SwapHoriz />}
                  sx={{ mt: 3 }}
                  onClick={handleConvertToBooking}
                  disabled={isConverting}
                >
                  Convert to Booking
                </Button>
              )}
              {isAlreadyConverted && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="success"
                  startIcon={<Launch />}
                  sx={{ mt: 3 }}
                  onClick={() => navigate(`/bookings/${quotation.booking_id}`)}
                >
                  View Booking
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Items table */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Items ({quotation.quotation_items.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Discount</TableCell>
                      <TableCell align="right">Line Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quotation.quotation_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {item.item_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {item.description || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell align="right">
                          {item.discount_amount > 0
                            ? formatCurrency(item.discount_amount)
                            : '—'}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>
                            {formatCurrency(item.line_total)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Quotation</DialogTitle>
        <DialogContent>
          <Typography>
            Permanently delete <strong>{quotation.quotation_number}</strong>? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};
