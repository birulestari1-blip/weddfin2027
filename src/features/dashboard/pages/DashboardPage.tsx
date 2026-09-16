import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Chip,
  Avatar,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  EventNote,
  People,
  AccountBalance,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';

// ─────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string;
  trend?: { value: string; up: boolean };
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  loading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  trend,
  icon: Icon,
  iconColor,
  iconBg,
  loading = false,
}) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width="60%" height={40} />
          ) : (
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {value}
            </Typography>
          )}
          {trend && !loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              {trend.up ? (
                <ArrowUpward sx={{ fontSize: '0.875rem', color: 'success.main' }} />
              ) : (
                <ArrowDownward sx={{ fontSize: '0.875rem', color: 'error.main' }} />
              )}
              <Typography
                variant="caption"
                fontWeight={600}
                color={trend.up ? 'success.main' : 'error.main'}
              >
                {trend.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                vs last month
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar
          sx={{
            width: 52,
            height: 52,
            borderRadius: '12px',
            bgcolor: iconBg,
            ml: 2,
            flexShrink: 0,
          }}
        >
          <Icon sx={{ color: iconColor, fontSize: '1.5rem' }} />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// ─────────────────────────────────────────────
// Activity skeleton row
// ─────────────────────────────────────────────
const ActivitySkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
    <Skeleton variant="circular" width={40} height={40} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="60%" height={18} />
      <Skeleton variant="text" width="40%" height={14} />
    </Box>
    <Skeleton variant="rounded" width={70} height={24} />
  </Box>
);

// ─────────────────────────────────────────────
// Dashboard page
// ─────────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const { metrics, isLoading: loading } = useDashboard();

  const kpiCards: KpiCardProps[] = [
    {
      title: 'Total Revenue',
      value: 'Rp 0', // TODO: Connect to finance module when available
      trend: { value: '0%', up: true },
      icon: AccountBalance,
      iconColor: '#5D87FF',
      iconBg: '#ECF2FF',
      loading,
    },
    {
      title: 'Active Bookings',
      value: metrics?.activeBookings.toString() || '0',
      icon: EventNote,
      iconColor: '#13DEB9',
      iconBg: '#E6FFFA',
      loading,
    },
    {
      title: 'Total Clients',
      value: metrics?.totalClients.toString() || '0',
      icon: People,
      iconColor: '#49BEFF',
      iconBg: '#E8F7FF',
      loading,
    },
    {
      title: 'Draft Quotations',
      value: metrics?.pendingQuotations.toString() || '0',
      icon: TrendingUp,
      iconColor: '#FFAE1F',
      iconBg: '#FEF5E5',
      loading,
    },
  ];

  return (
    <PageContainer>
      {/* Welcome banner */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #5D87FF 0%, #49BEFF 100%)',
          color: '#fff',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Here's what's happening with your vendor business today.
              </Typography>
              {profile?.role && (
                <Chip
                  label={profile.role.replace('_', ' ').toUpperCase()}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                  }}
                />
              )}
            </Box>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: '2.5rem' }}>📊</Typography>
            </Box>
          </Box>
        </CardContent>
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: 120,
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -40,
            right: 20,
            width: 160,
            height: 160,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />
      </Card>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpiCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity + Quick Stats */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Recent Activity
                </Typography>
                <Button variant="text" size="small" color="primary" sx={{ fontWeight: 600 }}>
                  View All
                </Button>
              </Box>

              {/* Skeleton placeholders — will be populated by Phase 3+ data */}
              {[1, 2, 3, 4, 5].map((i) => (
                <ActivitySkeleton key={i} />
              ))}

              <Box
                sx={{
                  textAlign: 'center',
                  py: 3,
                  color: 'text.secondary',
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  mt: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Activity data will appear here once business modules are connected.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Overview */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Quick Overview
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: 'Booking Acceptance Rate', value: '—', color: '#13DEB9' },
                  { label: 'Invoice Completion Rate', value: '—', color: '#5D87FF' },
                  { label: 'Client Satisfaction', value: '—', color: '#FFAE1F' },
                ].map((stat) => (
                  <Box key={stat.label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.8125rem">
                        {stat.label}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="text.primary">
                        {stat.value}
                      </Typography>
                    </Box>
                    <Skeleton
                      variant="rounded"
                      height={6}
                      sx={{ borderRadius: 3, bgcolor: `${stat.color}20` }}
                    />
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'primary.light',
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="primary.main" fontWeight={600}>
                  Dashboard analytics will be live in Phase 3
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};
