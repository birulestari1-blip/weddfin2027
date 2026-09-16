import React from 'react';
import { Chip } from '@mui/material';
import type { BookingStatus } from '../types/booking.types';

interface Props {
  status: BookingStatus;
  size?: 'small' | 'medium';
}

export const BookingStatusBadge: React.FC<Props> = ({ status, size = 'small' }) => {
  const getStatusColor = (
    s: BookingStatus
  ): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (s) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (s: BookingStatus) => {
    return s
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Chip
      label={getStatusLabel(status)}
      color={getStatusColor(status)}
      size={size}
      variant="filled"
      sx={{ fontWeight: 600 }}
    />
  );
};
