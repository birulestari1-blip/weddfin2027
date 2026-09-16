import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Typography, Link } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';

// ─────────────────────────────────────────────
// Route label map — maps path segments to readable labels
// ─────────────────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  clients: 'Clients',
  services: 'Services & Packages',
  quotations: 'Quotations',
  bookings: 'Bookings & Projects',
  finance: 'Finance',
  invoices: 'Invoices',
  contracts: 'Contracts',
  portfolio: 'Portfolio',
  inventory: 'Inventory',
  workflows: 'Workflows',
  catering: 'Catering',
  menu: 'Menus',
  photography: 'Photography',
  equipment: 'Equipment',
  dekorasi: 'Dekorasi',
  themes: 'Themes',
  mua: 'MUA',
  artists: 'Artists',
  'wedding-organizer': 'Wedding Organizer',
  rundowns: 'Rundowns',
  'super-admin': 'Super Admin',
  vendors: 'Vendors',
  'vendor-categories': 'Vendor Categories',
  subscriptions: 'Subscriptions',
  'subscription-plans': 'Plans',
  payments: 'Payments',
  'audit-logs': 'Audit Logs',
  'platform-settings': 'Platform Settings',
  admins: 'Admins',
  settings: 'Settings',
  profile: 'My Profile',
  new: 'New',
  edit: 'Edit',
};

function getLabel(segment: string): string {
  return ROUTE_LABELS[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  // Build breadcrumb entries
  const crumbs = segments.map((seg, idx) => ({
    label: getLabel(seg),
    path: '/' + segments.slice(0, idx + 1).join('/'),
    isLast: idx === segments.length - 1,
  }));

  // Single segment — just show the title, no links
  if (crumbs.length === 1) {
    return (
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.0625rem', color: 'text.primary' }}>
        {crumbs[0]!.label}
      </Typography>
    );
  }

  return (
    <Breadcrumbs
      separator={<NavigateNext fontSize="small" sx={{ color: 'text.disabled' }} />}
      aria-label="breadcrumb"
      sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap', alignItems: 'center' } }}
    >
      {crumbs.map((crumb) =>
        crumb.isLast ? (
          <Typography
            key={crumb.path}
            variant="body2"
            sx={{ fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}
          >
            {crumb.label}
          </Typography>
        ) : (
          <Link
            key={crumb.path}
            component={RouterLink}
            to={crumb.path}
            underline="hover"
            variant="body2"
            sx={{ color: 'text.secondary', fontWeight: 500, whiteSpace: 'nowrap' }}
          >
            {crumb.label}
          </Link>
        )
      )}
    </Breadcrumbs>
  );
};
