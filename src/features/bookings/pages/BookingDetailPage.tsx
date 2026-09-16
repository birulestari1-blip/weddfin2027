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
  MenuItem,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { Edit, ArrowBack, MoreVert, Event, LocationOn, Receipt } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { BookingStatusBadge } from '../components/BookingStatusBadge';
import { bookingService } from '../services/booking.service';
import { useBookings } from '../hooks/useBookings';
import type { BookingWithDetails, BookingStatus } from '../types/booking.types';
import { BOOKING_STATUS_VALUES } from '../types/booking.types';
import { contractService } from '@/features/contracts/services/contract.service';
import { PhotographyBookingDetailManager } from '@/features/photography/components/PhotographyBookingDetailManager';

const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateStatus, deleteBooking } = useBookings();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [sourceQuotation, setSourceQuotation] = useState<any | null>(null);
  const [contract, setContract] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      const [bookingRes, quotationRes, contractRes] = await Promise.all([
        bookingService.getBookingById(id),
        bookingService.getSourceQuotation(id),
        contractService.getContractByBookingId(id),
      ]);
      if (bookingRes.error) {
        setLoadError(bookingRes.error.message);
      } else {
        setBooking(bookingRes.data as BookingWithDetails);
      }
      if (!quotationRes.error && quotationRes.data) {
        setSourceQuotation(quotationRes.data);
      }
      if (!contractRes.error && contractRes.data) {
        setContract(contractRes.data);
      }
      setIsLoading(false);
    };
    load();
  }, [id]);

  const handleStatusChange = async (status: BookingStatus) => {
    if (!id) return;
    setMenuAnchor(null);
    const { success } = await updateStatus(id, status);
    if (success) {
      setBooking((prev) => (prev ? { ...prev, status } : prev));
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const { success } = await deleteBooking(id);
    setIsDeleting(false);
    if (success) {
      navigate('/bookings');
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Booking Detail">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (loadError || !booking) {
    return (
      <PageContainer title="Booking Detail">
        <Alert severity="error">{loadError || 'Booking not found.'}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={booking.event_name || 'Booking Detail'}
      description={`Client: ${booking.client_name}`}
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/bookings')}
            color="inherit"
          >
            Back
          </Button>
          <Button
            startIcon={<Edit />}
            variant="outlined"
            onClick={() => navigate(`/bookings/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            endIcon={<MoreVert />}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            Actions
          </Button>
          <Menu
            anchorEl={menuAnchor}
            open={!!menuAnchor}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 600, fontSize: '0.85rem' }}>
              Update Status
            </MenuItem>
            {BOOKING_STATUS_VALUES.map((s) => (
              <MenuItem key={s} onClick={() => handleStatusChange(s)}>
                Mark as {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem sx={{ color: 'error.main' }} onClick={() => setDeleteDialogOpen(true)}>
              Delete Booking
            </MenuItem>
          </Menu>
        </Box>
      }
    >
      {/* Source quotation banner */}
      {sourceQuotation && (
        <Alert
          severity="info"
          icon={<Receipt />}
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate(`/quotations/${sourceQuotation.id}`)}
            >
              View Quotation
            </Button>
          }
        >
          Created from Quotation{' '}
          <strong>{sourceQuotation.quotation_number}</strong> — {sourceQuotation.title}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {booking.event_name || 'Unnamed Event'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(booking.created_at).toLocaleDateString('id-ID')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <BookingStatusBadge status={booking.status} size="medium" />
                  <Chip
                    label={booking.payment_status.replace('_', ' ').toUpperCase()}
                    color={
                      booking.payment_status === 'fully_paid'
                        ? 'success'
                        : booking.payment_status === 'dp_paid'
                        ? 'primary'
                        : 'default'
                    }
                    size="small"
                  />
                </Box>
              </Box>

              {/* Source Quotation Reference */}
              {sourceQuotation && (
                <>
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'info.50', borderRadius: 2, border: '1px solid', borderColor: 'info.200' }}>
                    <Typography variant="subtitle2" color="info.800" sx={{ mb: 0.5 }}>
                      Source Quotation
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {sourceQuotation.quotation_number}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sourceQuotation.title}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/quotations/${sourceQuotation.id}`)}
                      >
                        View
                      </Button>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                </>
              )}

              {/* Contract Reference */}
              <Box sx={{ mb: 2, p: 2, bgcolor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
                <Typography variant="subtitle2" color="success.800" sx={{ mb: 0.5 }}>
                  Contract
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    {contract ? (
                      <>
                        <Typography variant="body2" fontWeight={600}>{contract.contract_number}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No contract created yet.</Typography>
                    )}
                  </Box>
                  <Button
                    size="small"
                    variant={contract ? 'outlined' : 'contained'}
                    color={contract ? 'primary' : 'success'}
                    onClick={() =>
                      navigate(contract ? `/contracts/${contract.id}` : `/contracts/create`)
                    }
                  >
                    {contract ? 'View Contract' : 'Create Contract'}
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Event color="action" />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Date & Time</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start: {new Date(booking.event_date).toLocaleString('id-ID')}
                      </Typography>
                      {booking.event_end_date && (
                        <Typography variant="body2" color="text.secondary">
                          End: {new Date(booking.event_end_date).toLocaleString('id-ID')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocationOn color="action" />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Venue</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.venue_name || 'Not specified'}
                      </Typography>
                      {booking.venue_address && (
                        <Typography variant="body2" color="text.secondary">
                          {booking.venue_address}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Client Details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body2" fontWeight={500}>{booking.client_name}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Contact</Typography>
                  <Typography variant="body2">{booking.client_email || 'No email'}</Typography>
                  <Typography variant="body2">{booking.client_phone || 'No phone'}</Typography>
                </Grid>
              </Grid>

              {/* Service */}
              {booking.vendor_services && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    Primary Service
                  </Typography>
                  <Typography variant="body2">{booking.vendor_services.name}</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Photography Booking Details — shown for all bookings; manager only persists data if populated */}
        {id && (
          <Grid size={{ xs: 12 }}>
            <PhotographyBookingDetailManager bookingId={id} />
          </Grid>
        )}

        {/* Financials / Right Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Financial Summary
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Quantity</Typography>
                <Typography fontWeight={500}>{booking.quantity}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Unit Price</Typography>
                <Typography fontWeight={500}>{formatCurrency(booking.unit_price)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Discount</Typography>
                <Typography fontWeight={500} color="error.main">
                  -{formatCurrency(booking.discount_amount)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography fontWeight={700}>Total Cost</Typography>
                <Typography fontWeight={700}>{formatCurrency(booking.total_cost)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Amount Paid</Typography>
                <Typography fontWeight={500} color="primary.main">
                  {formatCurrency(booking.amount_paid)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  bgcolor: 'grey.50',
                  p: 1,
                  borderRadius: 1,
                }}
              >
                <Typography fontWeight={600}>Remaining Balance</Typography>
                <Typography
                  fontWeight={600}
                  color={booking.total_cost - booking.amount_paid > 0 ? 'error.main' : 'success.main'}
                >
                  {formatCurrency(Math.max(0, booking.total_cost - booking.amount_paid))}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Workflow state display if active */}
          {booking.booking_workflow_states && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Workflow Stage
                </Typography>
                <Typography variant="body2" color="primary.main" fontWeight={600}>
                  {booking.booking_workflow_states.workflow_stages?.name || 'Active'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Stage code: {booking.booking_workflow_states.workflow_stages?.code || '—'}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Team assignments — read-only */}
          {Array.isArray((booking as any).project_team_assignments) &&
            (booking as any).project_team_assignments.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    Team
                  </Typography>
                  {(booking as any).project_team_assignments.map((ta: any) => (
                    <Box key={ta.id} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {ta.role_in_project}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {ta.profile_id}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
        </Grid>
      </Grid>

      {/* Delete dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Permanently delete booking for{' '}
            <strong>{booking.event_name || booking.client_name}</strong>? This action cannot be
            undone.
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
