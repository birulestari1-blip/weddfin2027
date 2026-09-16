import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { invoiceService } from '../services/invoice.service';
import { bookingService } from '@/features/bookings/services/booking.service';
import type { InvoiceFormInput } from '../schemas/invoice.schema';
import { invoiceSchema } from '../schemas/invoice.schema';
import type { InvoiceWithDetails } from '../types/invoice.types';

export const EditInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateInvoice } = useInvoices();
  const [formData, setFormData] = useState<InvoiceFormInput | null>(null);
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const init = async () => {
      const [invRes, bookRes] = await Promise.all([
        invoiceService.getInvoiceById(id),
        bookingService.getBookings(undefined, undefined, 200, 0),
      ]);
      if (invRes.error) { setLoadError(invRes.error.message); setIsLoading(false); return; }

      const inv = invRes.data as InvoiceWithDetails;
      setInvoice(inv);
      setFormData({
        booking_id: inv.booking_id,
        invoice_number: inv.invoice_number,
        payment_stage: inv.payment_stage,
        amount: inv.amount,
        due_date: inv.due_date,
        status: inv.status,
        paid_at: inv.paid_at || null,
        payment_link: inv.payment_link || null,
        payment_reference_id: inv.payment_reference_id || null,
        payment_method: inv.payment_method || null,
        notes: inv.notes || null,
      });
      setBookings(bookRes.data || []);
      setIsLoading(false);
    };
    init();
  }, [id]);

  const handleSave = async () => {
    if (!id || !formData) return;
    setErrors({});

    // Paid invoices: prevent editing core financial fields
    if (invoice?.status === 'paid') {
      setErrors({ form: 'Paid invoices cannot be modified. Only notes and payment reference may be updated.' });
      return;
    }

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
    const { success, error } = await updateInvoice(id, formData);
    setIsSaving(false);

    if (!success) {
      setErrors({ form: error?.message || 'Failed to update invoice.' });
      return;
    }

    navigate(`/invoices/${id}`);
  };

  if (isLoading) return <PageContainer title="Edit Invoice"><CircularProgress /></PageContainer>;
  if (loadError || !formData) return <PageContainer title="Edit Invoice"><Alert severity="error">{loadError || 'Not found.'}</Alert></PageContainer>;

  return (
    <PageContainer
      title={`Edit Invoice ${invoice?.invoice_number}`}
      description="Update invoice details."
      action={
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/invoices/${id}`)} color="inherit">
          Back
        </Button>
      }
    >
      {errors.form && (
        <Alert severity="error" sx={{ mb: 3 }}>{errors.form}</Alert>
      )}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <InvoiceForm
            formData={formData}
            setFormData={setFormData as any}
            errors={errors}
            bookings={bookings}
            editingId={id}
          />
        </CardContent>
      </Card>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={() => navigate(`/invoices/${id}`)} color="inherit" disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || invoice?.status === 'paid'}
        >
          {isSaving ? <CircularProgress size={22} /> : 'Save Changes'}
        </Button>
      </Box>
    </PageContainer>
  );
};
