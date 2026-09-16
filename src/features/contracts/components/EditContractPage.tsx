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
import { ContractForm } from '../components/ContractForm';
import { useContracts } from '../hooks/useContracts';
import { contractService } from '../services/contract.service';
import { bookingService } from '@/features/bookings/services/booking.service';
import type { ContractFormInput } from '../schemas/contract.schema';
import { contractSchema } from '../schemas/contract.schema';
import type { ContractWithDetails } from '../types/contract.types';

export const EditContractPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateContract } = useContracts();
  const [formData, setFormData] = useState<ContractFormInput | null>(null);
  const [contract, setContract] = useState<ContractWithDetails | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const init = async () => {
      const [contractRes, bookRes] = await Promise.all([
        contractService.getContractById(id),
        bookingService.getBookings(undefined, undefined, 200, 0),
      ]);
      if (contractRes.error) { setLoadError(contractRes.error.message); setIsLoading(false); return; }

      const ctr = contractRes.data as unknown as ContractWithDetails;
      setContract(ctr);
      setFormData({
        booking_id: ctr.booking_id,
        contract_number: ctr.contract_number,
        terms_and_conditions: ctr.terms_and_conditions,
        scope_of_work: ctr.scope_of_work as any,
        status: ctr.status as any,
        client_signed_at: ctr.client_signed_at,
        vendor_signed_at: ctr.vendor_signed_at,
        client_signature_url: ctr.client_signature_url,
        vendor_signature_url: ctr.vendor_signature_url,
        pdf_url: ctr.pdf_url,
      });
      setBookings(bookRes.data || []);
      setIsLoading(false);
    };
    init();
  }, [id]);

  const handleSave = async () => {
    if (!id || !formData) return;
    setErrors({});

    // Business rule: Void or rejected contracts shouldn't be edited.
    if (contract?.status === 'void' || contract?.status === 'rejected') {
      setErrors({ form: 'Void or rejected contracts cannot be modified.' });
      return;
    }

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
    const { success, error } = await updateContract(id, formData);
    setIsSaving(false);

    if (!success) {
      setErrors({ form: error?.message || 'Failed to update contract.' });
      return;
    }

    navigate(`/contracts/${id}`);
  };

  if (isLoading) return <PageContainer title="Edit Contract"><CircularProgress /></PageContainer>;
  if (loadError || !formData) return <PageContainer title="Edit Contract"><Alert severity="error">{loadError || 'Not found.'}</Alert></PageContainer>;

  return (
    <PageContainer
      title={`Edit Contract ${contract?.contract_number}`}
      description="Update contract terms and status."
      action={
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/contracts/${id}`)} color="inherit">
          Back
        </Button>
      }
    >
      {errors.form && (
        <Alert severity="error" sx={{ mb: 3 }}>{errors.form}</Alert>
      )}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <ContractForm
            formData={formData}
            setFormData={setFormData as any}
            errors={errors}
            bookings={bookings}
            editingId={id}
          />
        </CardContent>
      </Card>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={() => navigate(`/contracts/${id}`)} color="inherit" disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || contract?.status === 'void' || contract?.status === 'rejected'}
        >
          {isSaving ? <CircularProgress size={22} /> : 'Save Changes'}
        </Button>
      </Box>
    </PageContainer>
  );
};
