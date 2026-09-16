import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { usePortfolio } from '../hooks/usePortfolio';

export const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const { portfolios, isLoading, error, fetchPortfolios } = usePortfolio();

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  return (
    <PageContainer
      title="Portfolio"
      description="Showcase your past work, events, and media gallery."
      action={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/portfolio/create')}
        >
          Create Portfolio
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : portfolios.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No portfolio items yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first portfolio to showcase your work.
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/portfolio/create')}>
              Create Portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {portfolios.map((portfolio) => {
            const coverMedia = portfolio.portfolio_media?.find(m => m.media_type === 'image') || portfolio.portfolio_media?.[0];
            
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={portfolio.id}>
                <Card 
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
                  onClick={() => navigate(`/portfolio/${portfolio.id}`)}
                >
                  <Box sx={{ position: 'relative', paddingTop: '66.66%' }}>
                    {coverMedia && coverMedia.media_type === 'image' ? (
                      <Box
                        component="img"
                        src={coverMedia.media_url}
                        alt={portfolio.title}
                        sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e: any) => { e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image'; }}
                      />
                    ) : (
                      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">No Cover Image</Typography>
                      </Box>
                    )}
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                      {portfolio.is_featured && <Chip label="Featured" size="small" color="primary" />}
                      <Chip label={portfolio.is_published ? 'Published' : 'Draft'} size="small" color={portfolio.is_published ? 'success' : 'default'} />
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700} noWrap>
                      {portfolio.title}
                    </Typography>
                    {portfolio.venue_name && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {portfolio.venue_name}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {portfolio.event_date ? new Date(portfolio.event_date).toLocaleDateString('id-ID') : 'No Date'}
                      {' • '}
                      {portfolio.portfolio_media?.length || 0} media items
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </PageContainer>
  );
};
