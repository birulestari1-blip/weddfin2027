import React, { useState } from 'react';
import {
  Box, Typography, Button, Chip, Card, CardContent,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, Alert, CircularProgress, Collapse, Divider,
} from '@mui/material';
import {
  Add, Edit, Delete, ExpandMore, ExpandLess,
  Restaurant, PhotoCamera, CheckCircle, Cancel,
} from '@mui/icons-material';
import { useCateringMenuItems } from '../hooks/useCateringMenuItems';
import type { MenuItemWithRecipes } from '../types/catering-menu.types';
import { MenuItemForm } from './MenuItemForm';
import { RecipeManager } from './RecipeManager';
import type { CateringMenuItemFormInput } from '../schemas/catering-menu.schema';

interface MenuItemsManagerProps {
  menuId: string;
  menuName: string;
}

export const MenuItemsManager: React.FC<MenuItemsManagerProps> = ({
  menuId,
  menuName,
}) => {
  const { items, isLoading, error, fetchItemsByMenuId, createItem, updateItem, deleteItem } =
    useCateringMenuItems();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItemWithRecipes | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchItemsByMenuId(menuId);
  }, [menuId, fetchItemsByMenuId]);

  const handleAdd = async (data: CateringMenuItemFormInput) => {
    setSaving(true);
    setFormError(null);
    const result = await createItem(menuId, data);
    if (result.success) {
      setAddOpen(false);
      fetchItemsByMenuId(menuId);
    } else {
      setFormError(result.error?.message || 'Failed to add menu item');
    }
    setSaving(false);
  };

  const handleEdit = async (data: CateringMenuItemFormInput) => {
    if (!editItem) return;
    setSaving(true);
    setFormError(null);
    const result = await updateItem(editItem.id, data);
    if (result.success) {
      setEditItem(null);
      fetchItemsByMenuId(menuId);
    } else {
      setFormError(result.error?.message || 'Failed to update menu item');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteItemId) return;
    setSaving(true);
    const result = await deleteItem(deleteItemId);
    if (!result.success) {
      setFormError(result.error?.message || 'Failed to delete. Item may have recipes associated.');
    }
    setDeleteItemId(null);
    fetchItemsByMenuId(menuId);
    setSaving(false);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Restaurant sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>
            Menu Items
          </Typography>
          {items.length > 0 && (
            <Chip label={items.length} size="small" color="primary" sx={{ ml: 0.5 }} />
          )}
        </Box>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => { setAddOpen(true); setFormError(null); }}
          id="add-menu-item-btn"
          size="small"
        >
          Add Item
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            py: 6,
            textAlign: 'center',
          }}
        >
          <Restaurant sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            No menu items yet
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Add dishes, beverages, or desserts to this menu
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((item: MenuItemWithRecipes) => {
            const expanded = expandedId === item.id;
            const recipeCount = item.catering_recipes?.length ?? 0;

            return (
              <Card
                key={item.id}
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    {/* Thumbnail */}
                    {item.image_url ? (
                      <Box
                        component="img"
                        src={item.image_url}
                        alt={item.name}
                        onError={e => { (e.target as HTMLImageElement).src = ''; }}
                        sx={{ width: 56, height: 56, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 56, height: 56, borderRadius: 1.5, flexShrink: 0,
                          bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <PhotoCamera sx={{ color: 'text.disabled', fontSize: 20 }} />
                      </Box>
                    )}

                    {/* Info */}
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography variant="subtitle2" fontWeight={700}>
                          {item.name}
                        </Typography>
                        {item.course_type && (
                          <Chip label={item.course_type} size="small" variant="outlined" />
                        )}
                        <Chip
                          icon={item.is_active ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                          label={item.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={item.is_active ? 'success' : 'default'}
                        />
                        {recipeCount > 0 && (
                          <Chip label={`${recipeCount} ingredients`} size="small" color="info" />
                        )}
                      </Box>
                      {item.description && (
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                          {item.description}
                        </Typography>
                      )}
                    </Box>

                    {/* Actions */}
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Tooltip title="Edit Item">
                        <IconButton
                          size="small"
                          onClick={() => { setEditItem(item); setFormError(null); }}
                          id={`edit-item-${item.id}`}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Item">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteItemId(item.id)}
                          id={`delete-item-${item.id}`}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={expanded ? 'Collapse' : 'Show Ingredients'}>
                        <IconButton
                          size="small"
                          onClick={() => setExpandedId(expanded ? null : item.id)}
                          id={`expand-item-${item.id}`}
                        >
                          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>

                {/* Recipe section */}
                <Collapse in={expanded}>
                  <Divider />
                  <CardContent sx={{ px: 2, pt: 2, pb: 2 }}>
                    <RecipeManager menuItemId={item.id} menuItemName={item.name} />
                  </CardContent>
                </Collapse>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Menu Item to {menuName}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <MenuItemForm onSubmit={handleAdd} isSubmitting={saving} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} id="add-item-cancel">Cancel</Button>
          <Button
            type="submit"
            form="menu-item-form"
            variant="contained"
            disabled={saving}
            id="add-item-save"
          >
            {saving ? 'Saving...' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Menu Item</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          {editItem && (
            <MenuItemForm
              defaultValues={{
                name: editItem.name,
                description: editItem.description ?? '',
                course_type: editItem.course_type ?? '',
                image_url: editItem.image_url ?? '',
                is_active: editItem.is_active,
                display_order: editItem.display_order,
              }}
              onSubmit={handleEdit}
              isSubmitting={saving}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditItem(null)} id="edit-item-cancel">Cancel</Button>
          <Button
            type="submit"
            form="menu-item-form"
            variant="contained"
            disabled={saving}
            id="edit-item-save"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteItemId} onClose={() => setDeleteItemId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Menu Item</DialogTitle>
        <DialogContent>
          <Typography>
            This will also delete all associated recipes. Are you sure you want to delete this item?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteItemId(null)} id="delete-item-cancel">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={saving} id="delete-item-confirm">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
