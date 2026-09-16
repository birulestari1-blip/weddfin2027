import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { portfolioService } from '../services/portfolio.service';
import { usePortfolio } from '../hooks/usePortfolio';
import { PortfolioMediaManager } from '../components/PortfolioMediaManager';
import type { PortfolioWithMedia } from '../types/portfolio.types';

export const PortfolioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deletePortfolio, addMedia, deleteMedia } = usePortfolio();
  const [portfolio, setPortfolio] = useState<PortfolioWithMedia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    if (!id) return;
    const { data, error } = await portfolioService.getPortfolioById(id);
    if (error) setLoadError(error.message);
    else setPortfolio(data as unknown as PortfolioWithMedia);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const result = await deletePortfolio(id);
    setIsDeleting(false);
    if (result.success) navigate('/portfolio');
    else setActionError(result.error?.message || 'Failed to delete portfolio.');
  };

  const handleAddMedia = async (input: any) => {
    if (!id) return { success: false };
    const res = await addMedia(id, input);
    if (res.success) {
      await fetchPortfolio();
    }
    return res;
  };

  const handleDeleteMedia = async (mediaId: string) => {
    const res = await deleteMedia(mediaId);
    if (res.success) {
      await fetchPortfolio();
    }
    return res;
  };

  if (isLoading) return <PageContainer title="Portfolio Detail"><Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box></PageContainer>;
  if (loadError || !portfolio) return <PageContainer title="Portfolio Detail"><Alert severity="error">{loadError || 'Portfolio not found.'}</Alert></PageContainer>;

  return (
    <PageContainer
      title={portfolio.title}
      description={`Slug: ${portfolio.slug}`}
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/portfolio')} color="inherit">Back</Button>
          <Button startIcon={<Edit />} variant="outlined" onClick={() => navigate(`/portfolio/${id}/edit`)}>Edit</Button>
          <Button startIcon={<Delete />} color="error" variant="outlined" onClick={() => setDeleteDialogOpen(true)}>Delete</Button>
        </Box>
      }
    >
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {portfolio.is_featured && <Chip label="Featured" color="primary" />}
                <Chip label={portfolio.is_published ? 'Published' : 'Draft'} color={portfolio.is_published ? 'success' : 'default'} />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Event Date</Typography>
                  <Typography fontWeight={500}>
                    {portfolio.event_date ? new Date(portfolio.event_date).toLocaleDateString('id-ID') : '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Venue</Typography>
                  <Typography fontWeight={500}>{portfolio.venue_name || '—'}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Description</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {portfolio.description || 'No description provided.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <PortfolioMediaManager
                media={portfolio.portfolio_media || []}
                onAdd={handleAddMedia}
                onDelete={handleDeleteMedia}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Portfolio</DialogTitle>
        <DialogContent>
          <Typography>Permanently delete <strong>{portfolio.title}</strong>? All associated media will be deleted.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" disabled={isDeleting}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};
