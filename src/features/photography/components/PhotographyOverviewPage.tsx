import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress,
  Alert, Button, Chip, Divider,
} from '@mui/material';
import {
  CameraAlt, CheckCircle, Build, BrokenImage, Inventory2, ArrowForward,
} from '@mui/icons-material';
import { usePhotographyEquipment } from '../hooks/usePhotographyEquipment';

const StatusCard: React.FC<{
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bgcolor: string;
}> = ({ label, count, icon, color, bgcolor }) => (
  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Box
          sx={{
            width: 48, height: 48, borderRadius: 2,
            bgcolor, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Box sx={{ color }}>{icon}</Box>
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1 }}>
        {count}
      </Typography>
    </CardContent>
  </Card>
);

export const PhotographyOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, equipment, isLoading, error, fetchStats, fetchAll } = usePhotographyEquipment();

  useEffect(() => {
    fetchStats();
    fetchAll();
  }, [fetchStats, fetchAll]);

  const recentEquipment = equipment.slice(0, 5);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Photography Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your photography equipment and booking details.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CameraAlt />}
          onClick={() => navigate('/photography/equipment')}
          id="photography-overview-manage-equipment"
        >
          Manage Equipment
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Stats Grid */}
          <Grid container spacing={3} mb={4}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatusCard
                label="Total Equipment"
                count={stats?.total ?? 0}
                icon={<CameraAlt />}
                color="primary.main"
                bgcolor="primary.50"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatusCard
                label="Available"
                count={stats?.available ?? 0}
                icon={<CheckCircle />}
                color="success.main"
                bgcolor="success.50"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatusCard
                label="In Maintenance"
                count={stats?.maintenance ?? 0}
                icon={<Build />}
                color="warning.main"
                bgcolor="warning.50"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatusCard
                label="Damaged"
                count={stats?.damaged ?? 0}
                icon={<BrokenImage />}
                color="error.main"
                bgcolor="error.50"
              />
            </Grid>
          </Grid>

          {/* Recent Equipment */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Inventory2 color="action" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Recent Equipment
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/photography/equipment')}
                  id="photography-overview-view-all"
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {recentEquipment.length === 0 ? (
                <Box py={4} textAlign="center">
                  <CameraAlt sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">No equipment registered yet.</Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/photography/equipment/create')}
                    id="photography-overview-add-first"
                  >
                    Add First Equipment
                  </Button>
                </Box>
              ) : (
                recentEquipment.map((eq, idx) => (
                  <Box
                    key={eq.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 1.5,
                      borderBottom: idx < recentEquipment.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
                      px: 1,
                    }}
                    onClick={() => navigate(`/photography/equipment/${eq.id}`)}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {eq.equipment_type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[eq.brand, eq.model].filter(Boolean).join(' · ') || 'No brand/model'}
                      </Typography>
                    </Box>
                    <Chip
                      label={eq.status}
                      size="small"
                      color={
                        eq.status === 'available' ? 'success' :
                        eq.status === 'maintenance' ? 'warning' :
                        eq.status === 'damaged' ? 'error' : 'default'
                      }
                      variant="outlined"
                    />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};
