import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button,
} from '@mui/material';
import { RestaurantMenu, RoomService, Fastfood, WarningAmber } from '@mui/icons-material';
import { useCateringMenus } from '../hooks/useCateringMenus';

export const CateringOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { overviewStats, isLoading, error, fetchOverview } = useCateringMenus();
  
  // We need to fetch low stock directly or via service since the hook doesn't expose it directly yet,
  // Actually the service exposes it. Let's fetch it here.
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loadingStock, setLoadingStock] = useState(true);

  useEffect(() => {
    fetchOverview();
    
    // Fetch low stock from service
    import('../services/catering-menu.service').then(({ cateringMenuService }) => {
      cateringMenuService.getLowStockIngredients().then(res => {
        if (!res.error && res.data) {
          setLowStock(res.data);
        }
        setLoadingStock(false);
      });
    });
  }, [fetchOverview]);

  if (isLoading || loadingStock) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom={false}>
            Catering Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of your menus, items, and inventory requirements.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          onClick={() => navigate('/catering/menus')}
          startIcon={<RestaurantMenu />}
        >
          Manage Menus
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box p={1} borderRadius={1} bgcolor="primary.50" color="primary.main">
                  <RestaurantMenu />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Menus
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={800}>{overviewStats?.totalMenus ?? 0}</Typography>
              <Typography variant="caption" color="text.secondary">
                {overviewStats?.activeMenus ?? 0} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box p={1} borderRadius={1} bgcolor="success.50" color="success.main">
                  <RoomService />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Menu Items
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={800}>{overviewStats?.totalItems ?? 0}</Typography>
              <Typography variant="caption" color="text.secondary">Across all menus</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box p={1} borderRadius={1} bgcolor="info.50" color="info.main">
                  <Fastfood />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Recipes
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={800}>{overviewStats?.totalRecipes ?? 0}</Typography>
              <Typography variant="caption" color="text.secondary">Ingredients linked</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'error.main', borderRadius: 2, bgcolor: 'error.50' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box p={1} borderRadius={1} bgcolor="error.main" color="white">
                  <WarningAmber />
                </Box>
                <Typography variant="subtitle2" color="error.dark" fontWeight={600}>
                  Low Stock Ingredients
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={800} color="error.main">{lowStock.length}</Typography>
              <Typography variant="caption" color="error.dark">Require attention</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={700} mb={2}>
        Low Stock Ingredients Alerts
      </Typography>
      
      {lowStock.length === 0 ? (
        <Alert severity="success" icon={<CheckCircle />}>
          All inventory items used in catering are sufficiently stocked.
        </Alert>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Ingredient Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Current Stock</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Minimum Stock</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lowStock.map((item) => {
                const isOutOfStock = item.current_stock <= 0;
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color={isOutOfStock ? 'error.main' : 'warning.main'} fontWeight={700}>
                        {item.current_stock} {item.unit}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{item.minimum_stock} {item.unit}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={isOutOfStock ? 'Out of Stock' : 'Low Stock'} 
                        color={isOutOfStock ? 'error' : 'warning'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => navigate('/inventory')}
                        id={`restock-${item.id}`}
                      >
                        Restock
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

// CheckCircle missing import fix
import { CheckCircle } from '@mui/icons-material';
