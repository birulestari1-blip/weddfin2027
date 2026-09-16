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
import { ContractForm } from '../components/ContractForm';
import { useContracts } from '../hooks/useContracts';
import { bookingService } from '@/features/bookings/services/booking.service';
import type { ContractFormInput } from '../schemas/contract.schema';
import { contractSchema } from '../schemas/contract.schema';

const defaultForm = (): ContractFormInput => ({
  booking_id: '',
  contract_number: '',
  terms_and_conditions: '',
  scope_of_work: [],
  status: 'draft',
  client_signed_at: null,
  vendor_signed_at: null,
  client_signature_url: null,
  vendor_signature_url: null,
  pdf_url: null,
});

export const CreateContractPage: React.FC = () => {
  const navigate = useNavigate();
  const { createContract } = useContracts();
  const [formData, setFormData] = useState<ContractFormInput>(defaultForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    // Only fetch bookings that belong to this tenant.
    // In a real app, we might filter to only bookings that don't already have a contract.
    bookingService.getBookings(undefined, undefined, 200, 0).then((res) => {
      if (!res.error) setBookings(res.data || []);
    });
  }, []);

  const handleSave = async () => {
    setErrors({});
    const validation = contractSchema.safeParse(formData);
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
    const { success, data, error } = await createContract(formData);
    setIsSaving(false);

    if (!success || error) {
      setErrors({ form: error?.message || 'Failed to create contract.' });
      return;
    }

    navigate(`/contracts/${(data as any).id}`);
  };

  return (
    <PageContainer
      title="Create Contract"
      description="Draft a new legal agreement for a booking."
      action={
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/contracts')} color="inherit">
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
          <ContractForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            bookings={bookings}
          />
        </CardContent>
      </Card>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={() => navigate('/contracts')} color="inherit" disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <CircularProgress size={22} /> : 'Create Contract'}
        </Button>
      </Box>
    </PageContainer>
  );
};
