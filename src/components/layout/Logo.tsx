import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

interface LogoProps {
  collapsed?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ collapsed = false }) => {
  return (
    <Box
      component={RouterLink}
      to="/dashboard"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        textDecoration: 'none',
        px: collapsed ? 1 : 2,
        py: 1.5,
      }}
    >
      {/* Logo mark */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #5D87FF 0%, #49BEFF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(93, 135, 255, 0.35)',
        }}
      >
        <Typography
          sx={{
            color: '#fff',
            fontWeight: 800,
            fontSize: '1rem',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          V
        </Typography>
      </Box>

      {/* Logotype */}
      {!collapsed && (
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.9375rem',
              color: 'text.primary',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            VendorPro
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            Event Platform V3.2
          </Typography>
        </Box>
      )}
    </Box>
  );
};
