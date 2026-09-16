import React, { useState } from 'react';
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
import { PortfolioForm } from '../components/PortfolioForm';
import { usePortfolio } from '../hooks/usePortfolio';
import type { PortfolioFormInput } from '../schemas/portfolio.schema';
import { portfolioSchema } from '../schemas/portfolio.schema';

const defaultForm = (): PortfolioFormInput => ({
  title: '',
  description: '',
  event_date: '',
  venue_name: '',
  is_featured: false,
  is_published: false,
});

export const CreatePortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const { createPortfolio } = usePortfolio();
  const [formData, setFormData] = useState<PortfolioFormInput>(defaultForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setErrors({});
    const validation = portfolioSchema.safeParse(formData);
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
    const { success, data, error } = await createPortfolio(formData);
    setIsSaving(false);

    if (!success || error) {
      setErrors({ form: error?.message || 'Failed to create portfolio.' });
      return;
    }

    // Redirect to detail page to allow adding media
    navigate(`/portfolio/${(data as any).id}`);
  };

  return (
    <PageContainer
      title="Create Portfolio"
      description="Add a new project to your showcase."
      action={
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/portfolio')} color="inherit">
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
          <PortfolioForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        </CardContent>
      </Card>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={() => navigate('/portfolio')} color="inherit" disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <CircularProgress size={22} /> : 'Save & Add Media'}
        </Button>
      </Box>
    </PageContainer>
  );
};
