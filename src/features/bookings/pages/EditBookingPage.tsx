import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Alert, CircularProgress, Card, CardContent } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { BookingForm } from '../components/BookingForm';
import { useBookings } from '../hooks/useBookings';
import { bookingService } from '../services/booking.service';
import type { BookingFormInput } from '../schemas/booking.schema';
import { bookingSchema } from '../schemas/booking.schema';
import { clientService } from '@/features/clients/services/client.service';
import { vendorServiceService } from '@/features/services/services/service.service';
import type { BookingWithDetails } from '../types/booking.types';

export const EditBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateBooking } = useBookings();
  const [formData, setFormData] = useState<BookingFormInput | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [bookingRes, clientsRes, servicesRes] = await Promise.all([
          bookingService.getBookingById(id),
          clientService.getClients(undefined, 500, 0),
          vendorServiceService.getServices(undefined, true, 500, 0),
        ]);

        if (bookingRes.error) throw bookingRes.error;
        if (clientsRes.error) throw clientsRes.error;
        if (servicesRes.error) throw servicesRes.error;

        setClients(clientsRes.data || []);
        setServices(servicesRes.data || []);
        
        const b = bookingRes.data as BookingWithDetails;
        
        setFormData({
          client_id: b.client_id,
          service_id: b.service_id,
          client_name: b.client_name,
          client_email: b.client_email || '',
          client_phone: b.client_phone || '',
          event_name: b.event_name || '',
          event_date: b.event_date,
          event_end_date: b.event_end_date || '',
          venue_name: b.venue_name || '',
          venue_address: b.venue_address || '',
          quantity: b.quantity,
          unit_price: b.unit_price,
          discount_amount: b.discount_amount,
          total_cost: b.total_cost,
          amount_paid: b.amount_paid,
          status: b.status,
          payment_status: b.payment_status,
          source_quotation_id: undefined, // Don't allow changing source quotation on edit
        });

      } catch (err: any) {
        setLoadError(err?.message || 'Failed to load booking');
      }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    if (!id || !formData) return;
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
    const { success, error } = await updateBooking(id, formData);
    setIsSaving(false);

    if (!success || error) {
      setErrors({ form: error?.message || 'Failed to update booking' });
      return;
    }

    navigate(`/bookings/${id}`);
  };

  if (loadError) {
    return (
      <PageContainer title="Edit Booking">
        <Alert severity="error">{loadError}</Alert>
      </PageContainer>
    );
  }

  if (!formData) {
    return (
      <PageContainer title="Edit Booking">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Edit Booking"
      description={`Update details for ${formData.event_name || formData.client_name}`}
      action={
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/bookings/${id}`)} color="inherit">
          Back to Detail
        </Button>
      }
    >
      {errors.form && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.form}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <BookingForm
            formData={formData}
            setFormData={setFormData as any}
            errors={errors}
            clients={clients}
            services={services}
            isEditMode={true}
          />
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={() => navigate(`/bookings/${id}`)} color="inherit" disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <CircularProgress size={22} /> : 'Save Changes'}
        </Button>
      </Box>
    </PageContainer>
  );
};
