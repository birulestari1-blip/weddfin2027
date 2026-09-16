import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { ClientForm } from './ClientForm';
import type { ClientInput } from '../schemas/client.schema';
import { clientSchema } from '../schemas/client.schema';
import type { Client } from '../repositories/client.repository';

interface ClientDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ClientInput) => Promise<boolean>;
  client?: Client | null;
}

const defaultValues: ClientInput = {
  full_name: '',
  email: '',
  phone_number: '',
  company_name: '',
  address: '',
  notes: '',
};

export const ClientDialog: React.FC<ClientDialogProps> = ({ open, onClose, onSave, client }) => {
  const [formData, setFormData] = useState<ClientInput>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        full_name: client.full_name,
        email: client.email || '',
        phone_number: client.phone_number || '',
        company_name: client.company_name || '',
        address: client.address || '',
        notes: client.notes || '',
      });
    } else {
      setFormData(defaultValues);
    }
    setErrors({});
  }, [client, open]);

  const handleSave = async () => {
    setErrors({});
    const validation = clientSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message;
        }
      }
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    const success = await onSave(formData);
    setIsSaving(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{client ? 'Edit Client' : 'Add New Client'}</DialogTitle>
      <DialogContent dividers>
        <ClientForm formData={formData} setFormData={setFormData} errors={errors} />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSaving} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} /> : 'Save Client'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
