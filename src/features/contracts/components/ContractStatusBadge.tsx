import React from 'react';
import { Chip } from '@mui/material';
import type { ContractStatus } from '../types/contract.types';
import { CONTRACT_STATUS_LABELS } from '../types/contract.types';

const STATUS_COLORS: Record<ContractStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  draft: 'default',
  sent: 'primary',
  signed: 'success',
  rejected: 'error',
  void: 'warning',
};

interface Props {
  status: ContractStatus;
  size?: 'small' | 'medium';
}

export const ContractStatusBadge: React.FC<Props> = ({ status, size = 'small' }) => (
  <Chip
    label={CONTRACT_STATUS_LABELS[status]}
    color={STATUS_COLORS[status]}
    size={size}
    sx={{ fontWeight: 600, fontSize: size === 'medium' ? '0.85rem' : '0.75rem' }}
  />
);
