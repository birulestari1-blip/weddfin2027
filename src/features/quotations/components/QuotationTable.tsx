import React, { useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Menu,
} from '@mui/material';
import { Edit, Visibility, MoreVert } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { QuotationStatusBadge } from './QuotationStatusBadge';
import type { QuotationStatus } from '../types/quotation.types';

interface QuotationTableProps {
  quotations: any[];
  onDelete: (id: string) => Promise<boolean>;
  onStatusChange: (id: string, status: QuotationStatus) => Promise<boolean>;
}

const NEXT_STATUSES: Record<QuotationStatus, QuotationStatus[]> = {
  draft: ['sent', 'canceled'],
  sent: ['accepted', 'rejected', 'expired', 'canceled'],
  accepted: [],
  rejected: [],
  expired: [],
  canceled: [],
};

const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;

export const QuotationTable: React.FC<QuotationTableProps> = ({
  quotations,
  onDelete,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuQuotation, setMenuQuotation] = useState<any | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    await onDelete(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, quotation: any) => {
    setMenuAnchor(event.currentTarget);
    setMenuQuotation(quotation);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuQuotation(null);
  };

  if (quotations.length === 0) {
    return (
      <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">No quotations found.</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Quotation No.</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Valid Until</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotations.map((quotation) => (
              <TableRow key={quotation.id} hover sx={{ cursor: 'pointer' }}>
                <TableCell onClick={() => navigate(`/quotations/${quotation.id}`)}>
                  <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                    {quotation.quotation_number}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => navigate(`/quotations/${quotation.id}`)}>
                  <Typography variant="body2">{quotation.title}</Typography>
                </TableCell>
                <TableCell onClick={() => navigate(`/quotations/${quotation.id}`)}>
                  <Typography variant="body2" fontWeight={500}>
                    {quotation.clients?.full_name || '—'}
                  </Typography>
                  {quotation.clients?.company_name && (
                    <Typography variant="caption" color="text.secondary">
                      {quotation.clients.company_name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell onClick={() => navigate(`/quotations/${quotation.id}`)}>
                  <Typography variant="body2">
                    {quotation.valid_until
                      ? new Date(quotation.valid_until).toLocaleDateString('id-ID')
                      : '—'}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => navigate(`/quotations/${quotation.id}`)}>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(quotation.total_amount)}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => navigate(`/quotations/${quotation.id}`)}>
                  <QuotationStatusBadge status={quotation.status} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/quotations/${quotation.id}`)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/quotations/${quotation.id}/edit`)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="More">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, quotation)}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status change menu */}
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={handleMenuClose}>
        {menuQuotation &&
          NEXT_STATUSES[menuQuotation.status as QuotationStatus]?.map((nextStatus) => (
            <MenuItem
              key={nextStatus}
              onClick={async () => {
                handleMenuClose();
                await onStatusChange(menuQuotation.id, nextStatus);
              }}
            >
              Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
            </MenuItem>
          ))}
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            setDeleteId(menuQuotation?.id || null);
            handleMenuClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete this quotation? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit" disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
