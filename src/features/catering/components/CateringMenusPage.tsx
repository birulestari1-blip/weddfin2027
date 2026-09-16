import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, CardMedia,
  Grid, Chip, CircularProgress, Alert,
  InputAdornment, TextField, MenuItem,
} from '@mui/material';
import { Add, Search, RestaurantMenu, FilterList } from '@mui/icons-material';
import { useCateringMenus } from '../hooks/useCateringMenus';


export const CateringMenusPage: React.FC = () => {
  const navigate = useNavigate();
  const { menus, isLoading, error, fetchMenus } = useCateringMenus();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchMenus(100, 0); // Fetch up to 100 menus for now
  }, [fetchMenus]);

  const filteredMenus = menus.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.category && m.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' 
                          ? true 
                          : statusFilter === 'active' ? m.is_active : !m.is_active;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" gap={2} mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom={false}>
            Catering Menus
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your catering packages and their associated items/recipes.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/catering/menus/create')}
          id="create-menu-btn"
          sx={{ minWidth: 140 }}
        >
          Create Menu
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Filters */}
      <Box display="flex" gap={2} mb={4} flexDirection={{ xs: 'column', sm: 'row' }}>
        <TextField
          placeholder="Search menus by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          fullWidth
          sx={{ maxWidth: { sm: 400 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          id="search-menus"
        />
        <TextField
          select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          size="small"
          sx={{ minWidth: 150 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterList fontSize="small" />
              </InputAdornment>
            ),
          }}
          id="filter-menus"
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </Box>

      {/* Content */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : filteredMenus.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <RestaurantMenu sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            No Menus Found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'You haven\'t created any catering menus yet.'}
          </Typography>
          {!(searchTerm || statusFilter !== 'all') && (
            <Button variant="outlined" onClick={() => navigate('/catering/menus/create')}>
              Create Your First Menu
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredMenus.map((menu) => {
            const itemCount = (menu as any).catering_menu_items?.[0]?.count ?? 0;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={menu.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <Box position="relative">
                    {menu.image_url ? (
                      <CardMedia
                        component="img"
                        height="160"
                        image={menu.image_url}
                        alt={menu.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        height={160}
                        bgcolor="grey.100"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <RestaurantMenu sx={{ color: 'text.disabled', fontSize: 40 }} />
                      </Box>
                    )}
                    <Chip
                      label={menu.is_active ? 'Active' : 'Inactive'}
                      color={menu.is_active ? 'success' : 'default'}
                      size="small"
                      sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 600 }}
                    />
                  </Box>
                  <CardContent sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" fontWeight={700} noWrap title={menu.name} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/catering/menus/${menu.id}`)}>
                      {menu.name}
                    </Typography>
                    
                    {menu.category && (
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        {menu.category}
                      </Typography>
                    )}
                    
                    <Typography variant="body1" fontWeight={600} color="primary.main" mb={2}>
                      Rp {menu.price_per_pax.toLocaleString('id-ID')} / pax
                    </Typography>
                    
                    <Box mt="auto" display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        {itemCount} items
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/catering/menus/${menu.id}`)}
                        id={`view-menu-${menu.id}`}
                      >
                        Manage
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
