import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import { Construction } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  module: string;
  phase?: string;
}

/**
 * Generic placeholder for all routes not yet implemented.
 * Designed to visually confirm routing/navigation works while
 * maintaining a production-quality appearance.
 */
export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  module,
  phase = 'Phase 3+',
}) => (
  <PageContainer title={title} description={description}>
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            py: { xs: 4, sm: 6 },
            px: 2,
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #ECF2FF 0%, #E8F7FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Construction sx={{ fontSize: '2.25rem', color: 'primary.main' }} />
          </Box>

          {/* Labels */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={`Module: ${module}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
            />
            <Chip
              label={phase}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                bgcolor: '#FEF5E5',
                color: '#ae8e59',
                border: '1px solid #FFAE1F40',
              }}
            />
          </Box>

          <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: 'text.primary' }}>
            Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 440 }}>
            The <strong>{title}</strong> module is scheduled for implementation in {phase}.
            The application shell, routing, and database foundation are fully in place and ready.
          </Typography>

          <Button
            component={RouterLink}
            to="/dashboard"
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 600 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </CardContent>
    </Card>
  </PageContainer>
);
