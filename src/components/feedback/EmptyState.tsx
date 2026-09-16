import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There is currently no data available to display.',
  actionLabel,
  onAction,
}) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 4,
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: 'background.paper',
        borderStyle: 'dashed',
        my: 2,
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
        <Typography variant="h6" color="text.primary">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={400}>
          {description}
        </Typography>
        {actionLabel && onAction && (
          <Box mt={1}>
            <Button variant="contained" color="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
