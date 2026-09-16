import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add, Edit, Visibility } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge';
import { useInvoices } from '../hooks/useInvoices';
import { INVOICE_STATUS_VALUES, INVOICE_STATUS_LABELS, PAYMENT_STAGE_LABELS } from '../types/invoice.types';
import type { InvoiceStatus } from '../types/invoice.types';

const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;

export const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, isLoading, error, fetchInvoices } = useInvoices();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInvoices(search || undefined, statusFilter === 'all' ? undefined : statusFilter);
  }, [fetchInvoices, search, statusFilter]);

  return (
    <PageContainer
      title="Invoices"
      description="Issue and manage client invoices."
      action={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/invoices/create')}
        >
          Create Invoice
        </Button>
      }
    >
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Search by Invoice #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                {INVOICE_STATUS_VALUES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {INVOICE_STATUS_LABELS[s as InvoiceStatus]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress />
            </Box>
          ) : invoices.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No invoices yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first invoice from a confirmed booking.
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/invoices/create')}>
                Create Invoice
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Booking / Client</TableCell>
                    <TableCell>Stage</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {inv.invoice_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {(inv as any).vendor_bookings?.client_name || '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(inv as any).vendor_bookings?.event_name || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {PAYMENT_STAGE_LABELS[inv.payment_stage]}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>{formatCurrency(inv.amount)}</Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(inv.due_date).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => navigate(`/invoices/${inv.id}`)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => navigate(`/invoices/${inv.id}/edit`)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};
