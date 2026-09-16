import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Alert, CircularProgress, Card, CardContent } from '@mui/material';
import { ArrowBack, SwapHoriz } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { BookingForm } from '../components/BookingForm';
import { useBookings } from '../hooks/useBookings';
import type { BookingFormInput } from '../schemas/booking.schema';
import { bookingSchema } from '../schemas/booking.schema';
import { clientService } from '@/features/clients/services/client.service';
import { vendorServiceService } from '@/features/services/services/service.service';
import { quotationService } from '@/features/quotations/services/quotation.service';
import type { QuotationWithDetails } from '@/features/quotations/types/quotation.types';

const defaultFormData = (): BookingFormInput => ({
  client_id: null,
  service_id: null,
  client_name: '',
  client_email: '',
  client_phone: '',
  event_name: '',
  event_date: '',
  event_end_date: '',
  venue_name: '',
  venue_address: '',
  quantity: 1,
  unit_price: 0,
  discount_amount: 0,
  total_cost: 0,
  amount_paid: 0,
  status: 'pending',
  payment_status: 'unpaid',
  source_quotation_id: null,
});

export const CreateBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromQuotationId = searchParams.get('from_quotation');

  const { createBooking } = useBookings();
  const [formData, setFormData] = useState<BookingFormInput>(defaultFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [acceptedQuotations, setAcceptedQuotations] = useState<any[]>([]);
  const [sourceQuotation, setSourceQuotation] = useState<QuotationWithDetails | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [clientsRes, servicesRes, quotationsRes] = await Promise.all([
          clientService.getClients(undefined, 500, 0),
          vendorServiceService.getServices(undefined, true, 500, 0),
          quotationService.getQuotations(undefined, 'accepted', 100, 0),
        ]);

        if (clientsRes.error) throw clientsRes.error;
        if (servicesRes.error) throw servicesRes.error;

        setClients(clientsRes.data || []);
        setServices(servicesRes.data || []);

        // Only offer quotations that haven't been converted yet
        const available = (quotationsRes.data || []).filter((q: any) => !q.booking_id);
        setAcceptedQuotations(available);

        // If we navigated here from a specific quotation, auto-load it
        if (fromQuotationId) {
          // Check if this specific quotation is valid for conversion
          const { data: q, error: qErr } = await quotationService.getQuotationById(fromQuotationId);
          if (qErr || !q) throw new Error('Failed to load the source quotation.');

          const quotation = q as QuotationWithDetails;

          if (quotation.status !== 'accepted') {
            throw new Error(`Cannot convert: quotation status is "${quotation.status}". Only accepted quotations can be converted.`);
          }
          if (quotation.booking_id) {
            // Already converted — redirect to the existing booking
            navigate(`/bookings/${quotation.booking_id}`, { replace: true });
            return;
          }

          setSourceQuotation(quotation);
          prefillFromQuotation(quotation);
        }
      } catch (err: any) {
        setInitError(err?.message || 'Failed to load form data.');
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromQuotationId]);

  const prefillFromQuotation = (q: QuotationWithDetails) => {
    setFormData({
      source_quotation_id: q.id,
      client_id: q.client_id || null,
      service_id: null,
      client_name: q.clients?.full_name || '',
      client_email: q.clients?.email || '',
      client_phone: q.clients?.phone_number || '',
      event_name: q.title || '',
      event_date: '',
      event_end_date: '',
      venue_name: '',
      venue_address: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      total_cost: Number(q.total_amount),
      amount_paid: 0,
      status: 'pending',
      payment_status: 'unpaid',
    });
  };

  const handleQuotationSelect = (qId: string) => {
    const q = acceptedQuotations.find((x: any) => x.id === qId);
    if (!q) return;

    // Load full details to get client info
    quotationService.getQuotationById(qId).then(({ data }) => {
      if (data) {
        const full = data as QuotationWithDetails;
        setSourceQuotation(full);
        prefillFromQuotation(full);
      }
    });
  };

  const handleSave = async () => {
    setErrors({});
    const validation = bookingSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const key = issue.path.join('.');
        if (!newErrors[key]) newErrors[key] = issue.message;
      }
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    const { success, data, error } = await createBooking(formData);
    setIsSaving(false);

    if (!success || error) {
      setErrors({ form: error?.message || 'Failed to create booking.' });
      return;
    }

    navigate(`/bookings/${data?.id}`);
  };

  if (initError) {
    return (
      <PageContainer title="New Booking">
        <Alert severity="error" sx={{ mb: 2 }}>
          {initError}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/quotations')}>
          Back to Quotations
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="New Booking"
      description={
        sourceQuotation
          ? `Creating booking from Quotation ${sourceQuotation.quotation_number}`
          : 'Create a new event booking manually or from an accepted quotation.'
      }
      action={
        <Button
          startIcon={<ArrowBack />}
          onClick={() =>
            fromQuotationId
              ? navigate(`/quotations/${fromQuotationId}`)
              : navigate('/bookings')
          }
          color="inherit"
        >
          Back
        </Button>
      }
    >
      {/* Source quotation banner */}
      {sourceQuotation && (
        <Alert severity="info" icon={<SwapHoriz />} sx={{ mb: 3 }}>
          Converting from Quotation <strong>{sourceQuotation.quotation_number}</strong> —{' '}
          {sourceQuotation.title}. Client and financial data have been pre-filled.
        </Alert>
      )}

      {errors.form && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.form}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <BookingForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            clients={clients}
            services={services}
            acceptedQuotations={sourceQuotation ? [] : acceptedQuotations} // hide selector if already pre-selected
            onQuotationSelect={handleQuotationSelect}
          />
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          onClick={() =>
            fromQuotationId ? navigate(`/quotations/${fromQuotationId}`) : navigate('/bookings')
          }
          color="inherit"
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <CircularProgress size={22} /> : 'Create Booking'}
        </Button>
      </Box>
    </PageContainer>
  );
};
