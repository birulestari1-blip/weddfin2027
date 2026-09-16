import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Settings,
  Logout,
  Person,
} from '@mui/icons-material';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Breadcrumb } from './Breadcrumb';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar';

interface AppHeaderProps {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

/** Returns initials from a full name or email. */
function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return parts[0]![0]?.toUpperCase() ?? 'U';
  }
  if (email) return email[0]?.toUpperCase() ?? 'U';
  return 'U';
}

/** Returns a deterministic avatar background color from a string. */
function getAvatarColor(seed: string): string {
  const colors = ['#5D87FF', '#49BEFF', '#13DEB9', '#FFAE1F', '#FA896B', '#539BFF'];
  let hash = 0;
  for (const ch of seed) hash = (hash << 5) - hash + ch.charCodeAt(0);
  return colors[Math.abs(hash) % colors.length]!;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  sidebarCollapsed,
  onToggleSidebar,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseUserMenu = () => setAnchorEl(null);

  const handleSignOut = async () => {
    handleCloseUserMenu();
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.email || '';
  const email = user?.email ?? '';
  const initials = getInitials(profile?.full_name, email);
  const avatarColor = getAvatarColor(email);

  const sidebarOffset = isMobile ? 0 : sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: `calc(100% - ${sidebarOffset}px)`,
        ml: `${sidebarOffset}px`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        boxShadow: 'none',
        zIndex: theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: { xs: 2, sm: 3 } }}>
        {/* Mobile menu toggle */}
        {isMobile && (
          <IconButton
            edge="start"
            onClick={onToggleSidebar}
            sx={{ mr: 1, color: 'text.primary' }}
            aria-label="open navigation"
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Breadcrumb */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Breadcrumb />
        </Box>

        {/* Right actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
          {/* Notifications placeholder */}
          <Tooltip title="Notifications">
            <IconButton
              size="medium"
              aria-label="notifications"
              sx={{
                color: 'text.secondary',
                '&:hover': { backgroundColor: 'primary.light', color: 'primary.main' },
              }}
            >
              <Badge badgeContent={0} color="error" max={9}>
                <Notifications fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User avatar menu */}
          <Tooltip title="Account">
            <IconButton
              onClick={handleOpenUserMenu}
              size="small"
              sx={{ ml: 0.5 }}
              aria-label="account menu"
              aria-controls={anchorEl ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={anchorEl ? 'true' : undefined}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: avatarColor,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseUserMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 220,
                borderRadius: 2,
                mt: 0.5,
                border: '1px solid rgba(0,0,0,0.06)',
                '& .MuiMenuItem-root': {
                  borderRadius: 1,
                  mx: 0.5,
                  px: 1.5,
                  py: 1,
                  fontSize: '0.875rem',
                },
              },
            }}
          >
            {/* User info header */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {displayName || 'Vendor User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {email}
              </Typography>
              {profile?.role && (
                <Typography
                  variant="overline"
                  sx={{ display: 'block', color: 'primary.main', fontSize: '0.6875rem', mt: 0.25 }}
                >
                  {profile.role.replace('_', ' ')}
                </Typography>
              )}
            </Box>
            <Divider sx={{ my: 0.5 }} />

            <MenuItem component={RouterLink} to="/profile" onClick={handleCloseUserMenu}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>

            <MenuItem component={RouterLink} to="/settings" onClick={handleCloseUserMenu}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem onClick={handleSignOut} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
