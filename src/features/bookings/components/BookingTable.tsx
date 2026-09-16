import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  MenuItem,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Edit, Visibility, MoreVert } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BookingStatusBadge } from './BookingStatusBadge';
import type { BookingWithDetails, BookingStatus } from '../types/booking.types';
import { BOOKING_STATUS_VALUES } from '../types/booking.types';

interface Props {
  bookings: BookingWithDetails[];
  onStatusChange: (id: string, status: BookingStatus) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const BookingTable: React.FC<Props> = ({ bookings, onStatusChange, onDelete }) => {
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; id: string } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID');

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    setMenuAnchor({ element: e.currentTarget, id });
  };

  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!menuAnchor) return;
    const { id } = menuAnchor;
    setMenuAnchor(null);
    await onStatusChange(id, status);
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    const success = await onDelete(deleteDialog);
    if (success) {
      setDeleteDialog(null);
      setMenuAnchor(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No bookings found.</Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total Cost</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow
                key={booking.id}
                hover
                onClick={() => navigate(`/bookings/${booking.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {booking.event_name || 'Unnamed Event'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {booking.venue_name || 'No Venue'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{booking.client_name}</Typography>
                  {booking.clients?.company_name && (
                    <Typography variant="caption" color="text.secondary">
                      {booking.clients.company_name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(booking.event_date)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {formatCurrency(booking.total_cost)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Paid: {formatCurrency(booking.amount_paid)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.status} />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/bookings/${booking.id}`);
                      }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/bookings/${booking.id}/edit`);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, booking.id)}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={!!menuAnchor}
        onClose={(e: any) => {
          e.stopPropagation();
          setMenuAnchor(null);
        }}
      >
        <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 600, fontSize: '0.85rem' }}>
          Update Status
        </MenuItem>
        {BOOKING_STATUS_VALUES.map((status) => (
          <MenuItem
            key={status}
            onClick={(e) => {
              e.stopPropagation();
              handleStatusUpdate(status);
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </MenuItem>
        ))}
        <MenuItem
          sx={{ color: 'error.main', mt: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            if (menuAnchor) setDeleteDialog(menuAnchor.id);
            setMenuAnchor(null);
          }}
        >
          Delete Booking
        </MenuItem>
      </Menu>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Delete Booking</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this booking? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
