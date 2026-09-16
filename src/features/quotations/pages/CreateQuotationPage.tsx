import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Alert, CircularProgress, Card, CardContent } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { QuotationForm } from '../components/QuotationForm';
import { quotationService } from '../services/quotation.service';
import { useQuotations } from '../hooks/useQuotations';
import type { QuotationFormInput } from '../schemas/quotation.schema';
import { quotationSchema } from '../schemas/quotation.schema';
import { clientService } from '@/features/clients/services/client.service';
import { vendorServiceService } from '@/features/services/services/service.service';
import { authService } from '@/features/auth/services/auth.service';

const defaultFormData = (): QuotationFormInput => ({
  client_id: null,
  quotation_number: '',
  title: '',
  subtotal: 0,
  discount_amount: 0,
  tax_amount: 0,
  total_amount: 0,
  valid_until: '',
  status: 'draft',
  notes: '',
  items: [
    {
      service_id: null,
      item_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      line_total: 0,
      display_order: 0,
    },
  ],
});

export const CreateQuotationPage: React.FC = () => {
  const navigate = useNavigate();
  const { createQuotation } = useQuotations();
  const [formData, setFormData] = useState<QuotationFormInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Load clients and services concurrently
        const [clientsResult, servicesResult, sessionResult] = await Promise.all([
          clientService.getClients(undefined, 500, 0),
          vendorServiceService.getServices(undefined, true, 500, 0),
          authService.getCurrentSession(),
        ]);

        if (clientsResult.error) throw clientsResult.error;
        if (servicesResult.error) throw servicesResult.error;

        setClients(clientsResult.data || []);
        setServices(servicesResult.data || []);

        // Auto-generate quotation number
        if (sessionResult.profile?.tenant_id) {
          const qNum = await quotationService.generateQuotationNumber(
            sessionResult.profile.tenant_id
          );
          setFormData((prev) => ({ ...prev, quotation_number: qNum }));
        }
      } catch (err: any) {
        setInitError(err?.message || 'Failed to load form data');
      }
    };
    init();
  }, []);

  const handleSave = async () => {
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
    const { success, data, error } = await createQuotation(formData);
    setIsSaving(false);

    if (!success || error) {
      setErrors({ form: error?.message || 'Failed to create quotation' });
      return;
    }

    navigate(`/quotations/${data?.id}`);
  };

  if (initError) {
    return (
      <PageContainer title="New Quotation">
        <Alert severity="error">{initError}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="New Quotation"
      description="Create a new price quotation for your client."
      action={
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/quotations')} color="inherit">
          Back to List
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
        <Button onClick={() => navigate('/quotations')} color="inherit" disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <CircularProgress size={22} /> : 'Create Quotation'}
        </Button>
      </Box>
    </PageContainer>
  );
};
