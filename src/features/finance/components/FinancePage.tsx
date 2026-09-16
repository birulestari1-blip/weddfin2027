import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { Refresh, TrendingUp, TrendingDown, AccountBalance, Assessment } from '@mui/icons-material';
import { PageContainer } from '@/components/ui/PageContainer';
import { useFinance } from '../hooks/useFinance';

const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;

const TYPE_COLOR: Record<string, 'success' | 'error' | 'warning'> = {
  income: 'success',
  expense: 'error',
  payout: 'warning',
};
const TYPE_LABEL: Record<string, string> = {
  income: 'Pemasukan',
  expense: 'Pengeluaran',
  payout: 'Pembayaran Keluar',
};

const KpiCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isLoading: boolean;
  error?: string | null;
}> = ({ title, value, icon, color, isLoading, error }) => (
  <Card sx={{ height: '100%', borderLeft: `4px solid ${color}` }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : error ? (
            <Typography variant="body2" color="error">
              Error loading
            </Typography>
          ) : (
            <Typography variant="h5" fontWeight={700}>
              {formatCurrency(value)}
            </Typography>
          )}
        </Box>
        <Box sx={{ color, opacity: 0.8, fontSize: 40 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

export const FinancePage: React.FC = () => {
  const { transactions, count, summary, isLoading, summaryLoading, error, summaryError, fetchTransactions, fetchSummary } = useFinance();

  useEffect(() => {
    fetchSummary();
    fetchTransactions(undefined, undefined, 50, 0);
  }, [fetchSummary, fetchTransactions]);

  return (
    <PageContainer
      title="Finance & Transactions"
      description="Financial summary and transaction history."
      action={
        <Button
          startIcon={<Refresh />}
          onClick={() => { fetchSummary(); fetchTransactions(); }}
          color="inherit"
        >
          Refresh
        </Button>
      }
    >
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Total Pemasukan"
            value={summary?.totalIncome ?? 0}
            icon={<TrendingUp fontSize="inherit" />}
            color="#2e7d32"
            isLoading={summaryLoading}
            error={summaryError}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Total Pengeluaran"
            value={summary?.totalExpense ?? 0}
            icon={<TrendingDown fontSize="inherit" />}
            color="#c62828"
            isLoading={summaryLoading}
            error={summaryError}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Total Pembayaran Keluar"
            value={summary?.totalPayout ?? 0}
            icon={<AccountBalance fontSize="inherit" />}
            color="#e65100"
            isLoading={summaryLoading}
            error={summaryError}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Saldo Bersih"
            value={summary?.netBalance ?? 0}
            icon={<Assessment fontSize="inherit" />}
            color="#1565c0"
            isLoading={summaryLoading}
            error={summaryError}
          />
        </Grid>
      </Grid>

      {/* Summary error */}
      {summaryError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load financial summary: {summaryError}
        </Alert>
      )}

      {/* Transaction List */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Transactions ({count})
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load transactions: {error}
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary">No transactions recorded yet.</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Transactions are recorded when bookings and invoices are processed.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Booking</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        {new Date(tx.transaction_date).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{tx.description}</Typography>
                        {tx.reference_id && (
                          <Typography variant="caption" color="text.secondary">
                            Ref: {tx.reference_id}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {(tx as any).vendor_bookings ? (
                          <Typography variant="body2">
                            {(tx as any).vendor_bookings.client_name}
                          </Typography>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={TYPE_LABEL[tx.type] || tx.type}
                          color={TYPE_COLOR[tx.type] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{tx.payment_method || '—'}</TableCell>
                      <TableCell align="right">
                        <Typography
                          fontWeight={600}
                          color={tx.type === 'income' ? 'success.main' : 'error.main'}
                        >
                          {tx.type !== 'income' ? '-' : ''}
                          {formatCurrency(tx.amount)}
                        </Typography>
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
