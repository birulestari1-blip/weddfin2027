import React from 'react';
import { Chip } from '@mui/material';
import type { InvoiceStatus } from '../types/invoice.types';
import { INVOICE_STATUS_LABELS } from '../types/invoice.types';

const STATUS_COLORS: Record<InvoiceStatus, 'default' | 'warning' | 'success' | 'error'> = {
  unpaid: 'warning',
  paid: 'success',
  overdue: 'error',
  canceled: 'default',
};

interface Props {
  status: InvoiceStatus;
  size?: 'small' | 'medium';
}

export const InvoiceStatusBadge: React.FC<Props> = ({ status, size = 'small' }) => (
  <Chip
    label={INVOICE_STATUS_LABELS[status]}
    color={STATUS_COLORS[status]}
    size={size}
    sx={{ fontWeight: 600, fontSize: size === 'medium' ? '0.85rem' : '0.75rem' }}
  />
);
