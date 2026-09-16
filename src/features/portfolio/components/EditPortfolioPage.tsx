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
import { PortfolioForm } from '../components/PortfolioForm';
import { usePortfolio } from '../hooks/usePortfolio';
import { portfolioService } from '../services/portfolio.service';
import type { PortfolioFormInput } from '../schemas/portfolio.schema';
import { portfolioSchema } from '../schemas/portfolio.schema';
import type { PortfolioWithMedia } from '../types/portfolio.types';

export const EditPortfolioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updatePortfolio } = usePortfolio();
  const [formData, setFormData] = useState<PortfolioFormInput | null>(null);
  const [, setPortfolio] = useState<PortfolioWithMedia | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const init = async () => {
      const { data, error } = await portfolioService.getPortfolioById(id);
      if (error) { setLoadError(error.message); setIsLoading(false); return; }

      const item = data as unknown as PortfolioWithMedia;
      setPortfolio(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        event_date: item.event_date || '',
        venue_name: item.venue_name || '',
        is_featured: item.is_featured,
        is_published: item.is_published,
      });
      setIsLoading(false);
    };
    init();
  }, [id]);

  const handleSave = async () => {
    if (!id || !formData) return;
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
    const { success, error } = await updatePortfolio(id, formData);
    setIsSaving(false);

    if (!success) {
      setErrors({ form: error?.message || 'Failed to update portfolio.' });
      return;
    }

    navigate(`/portfolio/${id}`);
  };

  if (isLoading) return <PageContainer title="Edit Portfolio"><CircularProgress /></PageContainer>;
  if (loadError || !formData) return <PageContainer title="Edit Portfolio"><Alert severity="error">{loadError || 'Not found.'}</Alert></PageContainer>;

  return (
    <PageContainer
      title={`Edit Portfolio`}
      description="Update project details and settings."
      action={
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/portfolio/${id}`)} color="inherit">
          Back
        </Button>
      }
    >
      {errors.form && (
        <Alert severity="error" sx={{ mb: 3 }}>{errors.form}</Alert>
      )}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <PortfolioForm
            formData={formData}
            setFormData={setFormData as any}
            errors={errors}
          />
        </CardContent>
      </Card>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={() => navigate(`/portfolio/${id}`)} color="inherit" disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <CircularProgress size={22} /> : 'Save Changes'}
        </Button>
      </Box>
    </PageContainer>
  );
};
