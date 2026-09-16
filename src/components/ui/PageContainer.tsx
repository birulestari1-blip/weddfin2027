import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageContainerProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PageContainer — standard wrapper for all V3.2 feature pages.
 * Provides consistent page title, description, action slot, and content area.
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  action,
  children,
}) => {
  return (
    <Box>
      {/* Page header */}
      {(title || description || action) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            {title && (
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                {title}
              </Typography>
            )}
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
          {action && <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>{action}</Box>}
        </Box>
      )}

      {/* Page content */}
      {children}
    </Box>
  );
};
