import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Sidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar';
import { AppHeader } from './AppHeader';

export const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleMobileSidebar = () => setMobileSidebarOpen((prev) => !prev);
  const handleCloseMobileSidebar = () => setMobileSidebarOpen(false);
  const handleToggleCollapse = () => setSidebarCollapsed((prev) => !prev);

  const sidebarOffset = isMobile
    ? 0
    : sidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Sidebar
        open={mobileSidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={handleCloseMobileSidebar}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          ml: isMobile ? 0 : `${sidebarOffset}px`,
          transition: theme.transitions.create('margin-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Top header */}
        <AppHeader
          sidebarOpen={mobileSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={handleToggleMobileSidebar}
        />

        {/* Content offset below fixed header */}
        <Box sx={{ mt: '64px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              flex: 1,
              p: { xs: 2, sm: 3 },
              maxWidth: '100%',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
