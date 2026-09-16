import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, InputAdornment, Alert, CircularProgress, MenuItem } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/ui/PageContainer';
import { QuotationTable } from '../components/QuotationTable';
import { useQuotations } from '../hooks/useQuotations';
import type { QuotationStatus } from '../types/quotation.types';
import { QUOTATION_STATUS_VALUES } from '../types/quotation.types';

export const QuotationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { quotations, isLoading, error, fetchQuotations, updateStatus, deleteQuotation } =
    useQuotations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuotations(searchTerm, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchQuotations]);

  const handleDelete = async (id: string) => {
    const { success } = await deleteQuotation(id);
    return success;
  };

  const handleStatusChange = async (id: string, status: QuotationStatus) => {
    const { success } = await updateStatus(id, status);
    return success;
  };

  return (
    <PageContainer
      title="Quotations"
      description="Create and manage price quotations for your clients."
      action={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/quotations/create')}
        >
          New Quotation
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search quotations..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          variant="outlined"
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All Statuses</MenuItem>
          {QUOTATION_STATUS_VALUES.map((s) => (
            <MenuItem key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {isLoading && quotations.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <QuotationTable
          quotations={quotations}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    </PageContainer>
  );
};
