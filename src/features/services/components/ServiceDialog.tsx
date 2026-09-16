import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { ServiceForm } from './ServiceForm';
import type { ServiceInput } from '../schemas/service.schema';
import { serviceSchema } from '../schemas/service.schema';
import type { VendorService } from '../repositories/service.repository';

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ServiceInput) => Promise<boolean>;
  service?: VendorService | null;
}

const defaultValues: ServiceInput = {
  name: '',
  description: '',
  pricing_type: 'fixed_package',
  base_price: undefined,
  min_order_qty: undefined,
  is_active: true,
  image_url: '',
};

export const ServiceDialog: React.FC<ServiceDialogProps> = ({ open, onClose, onSave, service }) => {
  const [formData, setFormData] = useState<ServiceInput>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        pricing_type: service.pricing_type,
        base_price: service.base_price || undefined,
        min_order_qty: service.min_order_qty || undefined,
        is_active: service.is_active,
        image_url: service.image_url || '',
      });
    } else {
      setFormData(defaultValues);
    }
    setErrors({});
  }, [service, open]);

  const handleSave = async () => {
    setErrors({});
    const validation = serviceSchema.safeParse(formData);
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
      <DialogTitle>{service ? 'Edit Service' : 'Add New Service'}</DialogTitle>
      <DialogContent dividers>
        <ServiceForm formData={formData} setFormData={setFormData} errors={errors} />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSaving} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} /> : 'Save Service'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
