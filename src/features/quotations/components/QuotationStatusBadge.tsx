import React from 'react';
import { Chip } from '@mui/material';
import type { QuotationStatus } from '../types/quotation.types';

const STATUS_CONFIG: Record<
  QuotationStatus,
  { label: string; color: 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' }
> = {
  draft: { label: 'Draft', color: 'default' },
  sent: { label: 'Sent', color: 'info' },
  accepted: { label: 'Accepted', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  expired: { label: 'Expired', color: 'warning' },
  canceled: { label: 'Canceled', color: 'default' },
};

interface QuotationStatusBadgeProps {
  status: QuotationStatus;
  size?: 'small' | 'medium';
}

export const QuotationStatusBadge: React.FC<QuotationStatusBadgeProps> = ({
  status,
  size = 'small',
}) => {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'default' };
  return <Chip label={config.label} color={config.color} size={size} />;
};
