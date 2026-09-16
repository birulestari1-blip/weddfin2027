import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Alert, CircularProgress, Card, CardContent } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { QuotationForm } from '../components/QuotationForm';
import { useQuotations } from '../hooks/useQuotations';
import { quotationService } from '../services/quotation.service';
import type { QuotationFormInput } from '../schemas/quotation.schema';
import { quotationSchema } from '../schemas/quotation.schema';
import { clientService } from '@/features/clients/services/client.service';
import { vendorServiceService } from '@/features/services/services/service.service';
import type { QuotationWithDetails } from '../types/quotation.types';

export const EditQuotationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateQuotation } = useQuotations();
  const [formData, setFormData] = useState<QuotationFormInput | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [quotationResult, clientsResult, servicesResult] = await Promise.all([
          quotationService.getQuotationById(id),
          clientService.getClients(undefined, 500, 0),
          vendorServiceService.getServices(undefined, true, 500, 0),
        ]);

        if (quotationResult.error) throw quotationResult.error;
        if (clientsResult.error) throw clientsResult.error;
        if (servicesResult.error) throw servicesResult.error;

        const q = quotationResult.data as QuotationWithDetails;

        setClients(clientsResult.data || []);
        setServices(servicesResult.data || []);
        setFormData({
          client_id: q.client_id,
          quotation_number: q.quotation_number,
          title: q.title,
          subtotal: q.subtotal,
          discount_amount: q.discount_amount,
          tax_amount: q.tax_amount,
          total_amount: q.total_amount,
          valid_until: q.valid_until || '',
          status: q.status,
          notes: q.notes || '',
          items: q.quotation_items.map((item) => ({
            id: item.id,
            service_id: item.service_id,
            item_name: item.item_name,
            description: item.description || '',
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_amount: item.discount_amount,
            line_total: item.line_total,
            display_order: item.display_order,
          })),
        });
      } catch (err: any) {
        setLoadError(err?.message || 'Failed to load quotation');
      }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    if (!id || !formData) return;
    setErrors({});
    const validation = quotationSchema.safeParse(formData);
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
    const { success, error } = await updateQuotation(id, formData);
    setIsSaving(false);

    if (!success || error) {
      setErrors({ form: error?.message || 'Failed to update quotation' });
      return;
    }

    navigate(`/quotations/${id}`);
  };

  if (loadError) {
    return (
      <PageContainer title="Edit Quotation">
        <Alert severity="error">{loadError}</Alert>
      </PageContainer>
    );
  }

  if (!formData) {
    return (
      <PageContainer title="Edit Quotation">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Edit: ${formData.quotation_number}`}
      description="Update quotation details and items."
      action={
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/quotations/${id}`)} color="inherit">
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
          <QuotationForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            clients={clients}
            services={services}
          />
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={() => navigate(`/quotations/${id}`)} color="inherit" disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <CircularProgress size={22} /> : 'Save Changes'}
        </Button>
      </Box>
    </PageContainer>
  );
};
