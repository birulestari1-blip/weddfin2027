import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { InvoiceForm } from '../components/InvoiceForm';
import { useInvoices } from '../hooks/useInvoices';
import { bookingService } from '@/features/bookings/services/booking.service';
import type { InvoiceFormInput } from '../schemas/invoice.schema';
import { invoiceSchema } from '../schemas/invoice.schema';

const defaultForm = (): InvoiceFormInput => ({
  booking_id: '',
  invoice_number: '',
  payment_stage: 'down_payment',
  amount: 0,
  due_date: '',
  status: 'unpaid',
  paid_at: null,
  payment_link: null,
  payment_reference_id: null,
  payment_method: null,
  notes: null,
});

export const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const { createInvoice } = useInvoices();
  const [formData, setFormData] = useState<InvoiceFormInput>(defaultForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    bookingService.getBookings(undefined, undefined, 200, 0).then((res) => {
      if (!res.error) setBookings(res.data || []);
    });
  }, []);

  const handleSave = async () => {
    setErrors({});
    const validation = invoiceSchema.safeParse(formData);
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
    const { success, data, error } = await createInvoice(formData);
    setIsSaving(false);

    if (!success || error) {
      setErrors({ form: error?.message || 'Failed to create invoice.' });
      return;
    }

    navigate(`/invoices/${(data as any).id}`);
  };

  return (
    <PageContainer
      title="Create Invoice"
      description="Issue a new invoice for a confirmed booking."
      action={
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/invoices')} color="inherit">
          Back
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
          <InvoiceForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            bookings={bookings}
          />
        </CardContent>
      </Card>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={() => navigate('/invoices')} color="inherit" disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <CircularProgress size={22} /> : 'Create Invoice'}
        </Button>
      </Box>
    </PageContainer>
  );
};
