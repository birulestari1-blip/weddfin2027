import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  People,
  Inventory2,
  RequestQuote,
  EventNote,
  AccountBalance,
  Receipt,
  Description,
  PhotoLibrary,
  Warehouse,
  AccountTree,
  RestaurantMenu,
  CameraAlt,
  AutoAwesome,
  Face4,
  FormatListNumbered,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { NAV_GROUPS } from './navItems';

// ─────────────────────────────────────────────
// Icon registry
// ─────────────────────────────────────────────
const ICONS: Record<string, React.ElementType> = {
  Dashboard,
  People,
  Inventory2,
  RequestQuote,
  EventNote,
  AccountBalance,
  Receipt,
  Description,
  PhotoLibrary,
  Warehouse,
  AccountTree,
  RestaurantMenu,
  CameraAlt,
  AutoAwesome,
  Face4,
  FormatListNumbered,
  AdminPanelSettings,
};

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface SidebarNavProps {
  collapsed?: boolean;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export const SidebarNav: React.FC<SidebarNavProps> = ({ collapsed = false }) => {
  const location = useLocation();
  const { profile } = useAuth();
  const userRole = profile?.role ?? '';

  return (
    <Box sx={{ px: collapsed ? 0.5 : 1.5, py: 1 }}>
      {NAV_GROUPS.map((group) => {
        // Filter items based on role
        const visibleItems = group.items.filter((item) => {
          if (!item.roles || item.roles.length === 0) return true;
          return item.roles.includes(userRole);
        });

        if (visibleItems.length === 0) return null;

        return (
          <Box key={group.id} sx={{ mb: 1 }}>
            {!collapsed && (
              <Typography
                variant="overline"
                sx={{
                  px: 1.5,
                  py: 0.75,
                  display: 'block',
                  color: 'text.secondary',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}
              >
                {group.title}
              </Typography>
            )}
            {collapsed && <Divider sx={{ my: 0.5, mx: 1 }} />}

            <List dense disablePadding>
              {visibleItems.map((item) => {
                const IconComponent = item.icon ? (ICONS[item.icon] ?? Dashboard) : Dashboard;
                const isActive =
                  item.path === '/dashboard'
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path ?? '');

                const navButton = (
                  <ListItemButton
                    component={RouterLink}
                    to={item.path ?? '#'}
                    selected={isActive}
                    sx={{
                      px: collapsed ? 1.5 : 1.5,
                      py: 0.875,
                      minHeight: 40,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: '8px',
                      mb: 0.25,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 'auto' : 36,
                        color: isActive ? 'primary.main' : 'text.secondary',
                        '& svg': { fontSize: '1.25rem' },
                      }}
                    >
                      <IconComponent />
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? 'primary.main' : 'text.primary',
                          noWrap: true,
                        }}
                      />
                    )}
                  </ListItemButton>
                );

                return (
                  <ListItem key={item.id} disablePadding>
                    {collapsed ? (
                      <Tooltip title={item.title} placement="right" arrow>
                        <span style={{ width: '100%' }}>{navButton}</span>
                      </Tooltip>
                    ) : (
                      navButton
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Box>
        );
      })}
    </Box>
  );
};
