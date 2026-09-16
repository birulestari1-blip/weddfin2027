import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, InputAdornment, Alert, CircularProgress, MenuItem } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/ui/PageContainer';
import { BookingTable } from '../components/BookingTable';
import { useBookings } from '../hooks/useBookings';
import type { BookingStatus } from '../types/booking.types';
import { BOOKING_STATUS_VALUES } from '../types/booking.types';

export const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookings, isLoading, error, fetchBookings, updateStatus, deleteBooking } = useBookings();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings(searchTerm, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchBookings]);

  const handleDelete = async (id: string) => {
    const { success } = await deleteBooking(id);
    return success;
  };

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    const { success } = await updateStatus(id, status);
    return success;
  };

  return (
    <PageContainer
      title="Bookings"
      description="Manage your event bookings and projects."
      action={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/bookings/create')}
        >
          New Booking
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
          placeholder="Search by client or event..."
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
          {BOOKING_STATUS_VALUES.map((s) => (
            <MenuItem key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {isLoading && bookings.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <BookingTable
          bookings={bookings}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    </PageContainer>
  );
};
