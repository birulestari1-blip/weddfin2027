import React from 'react';
import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

// ─────────────────────────────────────────────
// Lazy-loaded / inline auth pages
// ─────────────────────────────────────────────
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ClientsPage } from '@/features/clients/pages/ClientsPage';
import { ServicesPage } from '@/features/services/pages/ServicesPage';
import { QuotationsPage } from '@/features/quotations/pages/QuotationsPage';
import { CreateQuotationPage } from '@/features/quotations/pages/CreateQuotationPage';
import { QuotationDetailPage } from '@/features/quotations/pages/QuotationDetailPage';
import { EditQuotationPage } from '@/features/quotations/pages/EditQuotationPage';
import { BookingsPage } from '@/features/bookings/pages/BookingsPage';
import { CreateBookingPage } from '@/features/bookings/pages/CreateBookingPage';
import { BookingDetailPage } from '@/features/bookings/pages/BookingDetailPage';
import { EditBookingPage } from '@/features/bookings/pages/EditBookingPage';
import { FinancePage } from '@/features/finance/components/FinancePage';
import { InvoicesPage } from '@/features/invoices/components/InvoicesPage';
import { CreateInvoicePage } from '@/features/invoices/components/CreateInvoicePage';
import { InvoiceDetailPage } from '@/features/invoices/components/InvoiceDetailPage';
import { EditInvoicePage } from '@/features/invoices/components/EditInvoicePage';
import { ContractsPage } from '@/features/contracts/components/ContractsPage';
import { CreateContractPage } from '@/features/contracts/components/CreateContractPage';
import { ContractDetailPage } from '@/features/contracts/components/ContractDetailPage';
import { EditContractPage } from '@/features/contracts/components/EditContractPage';
import { PortfolioPage } from '@/features/portfolio/components/PortfolioPage';
import { CreatePortfolioPage } from '@/features/portfolio/components/CreatePortfolioPage';
import { PortfolioDetailPage } from '@/features/portfolio/components/PortfolioDetailPage';
import { EditPortfolioPage } from '@/features/portfolio/components/EditPortfolioPage';

// ─────────────────────────────────────────────
// Catering Module Pages
// ─────────────────────────────────────────────
import { CateringOverviewPage } from '@/features/catering/components/CateringOverviewPage';
import { CateringMenusPage } from '@/features/catering/components/CateringMenusPage';
import { CreateCateringMenuPage } from '@/features/catering/components/CreateCateringMenuPage';
import { EditCateringMenuPage } from '@/features/catering/components/EditCateringMenuPage';
import { CateringMenuDetailPage } from '@/features/catering/components/CateringMenuDetailPage';

// ─────────────────────────────────────────────
// Photography Module Pages
// ─────────────────────────────────────────────
import { PhotographyOverviewPage } from '@/features/photography/components/PhotographyOverviewPage';
import { EquipmentListPage } from '@/features/photography/components/EquipmentListPage';
import { CreateEquipmentPage } from '@/features/photography/components/CreateEquipmentPage';
import { EditEquipmentPage } from '@/features/photography/components/EditEquipmentPage';
import { EquipmentDetailPage } from '@/features/photography/components/EquipmentDetailPage';

// ─────────────────────────────────────────────
// Error / Utility pages
// ─────────────────────────────────────────────
const UnauthorizedPage: React.FC = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F4F6F9 0%, #FDEDE8 100%)',
      p: 3,
    }}
  >
    <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
      <Typography
        variant="h1"
        sx={{ fontWeight: 800, fontSize: '5rem', color: 'error.main', lineHeight: 1, mb: 1 }}
      >
        403
      </Typography>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        You do not have permission to access this resource.
        Please contact your administrator if you believe this is an error.
      </Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained" id="unauthorized-back">
        Return to Dashboard
      </Button>
    </Box>
  </Box>
);

const NotFoundPage: React.FC = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F4F6F9 0%, #ECF2FF 100%)',
      p: 3,
    }}
  >
    <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
      <Typography
        variant="h1"
        sx={{ fontWeight: 800, fontSize: '5rem', color: 'primary.main', lineHeight: 1, mb: 1 }}
      >
        404
      </Typography>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained" id="notfound-back">
        Back to Dashboard
      </Button>
    </Box>
  </Box>
);

// ─────────────────────────────────────────────
// Route tree
// ─────────────────────────────────────────────
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ── Public routes (outside AppLayout) ── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ── Authenticated routes (inside AppLayout) ── */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Core */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* CRM & Sales */}
        <Route
          path="clients"
          element={
            <ProtectedRoute>
              <ClientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="services"
          element={
            <ProtectedRoute>
              <ServicesPage />
            </ProtectedRoute>
          }
        />
        {/* Quotations */}
        <Route
          path="quotations"
          element={
            <ProtectedRoute>
              <QuotationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="quotations/create"
          element={
            <ProtectedRoute>
              <CreateQuotationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="quotations/:id"
          element={
            <ProtectedRoute>
              <QuotationDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="quotations/:id/edit"
          element={
            <ProtectedRoute>
              <EditQuotationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings/create"
          element={
            <ProtectedRoute>
              <CreateBookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings/:id/edit"
          element={
            <ProtectedRoute>
              <EditBookingPage />
            </ProtectedRoute>
          }
        />

        {/* Finance */}
        <Route
          path="finance"
          element={
            <ProtectedRoute>
              <FinancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices"
          element={
            <ProtectedRoute>
              <InvoicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices/create"
          element={
            <ProtectedRoute>
              <CreateInvoicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices/:id"
          element={
            <ProtectedRoute>
              <InvoiceDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices/:id/edit"
          element={
            <ProtectedRoute>
              <EditInvoicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="contracts"
          element={
            <ProtectedRoute>
              <ContractsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="contracts/create"
          element={
            <ProtectedRoute>
              <CreateContractPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="contracts/:id"
          element={
            <ProtectedRoute>
              <ContractDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="contracts/:id/edit"
          element={
            <ProtectedRoute>
              <EditContractPage />
            </ProtectedRoute>
          }
        />

        {/* Operations */}
        <Route
          path="portfolio"
          element={
            <ProtectedRoute>
              <PortfolioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="portfolio/create"
          element={
            <ProtectedRoute>
              <CreatePortfolioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="portfolio/:id"
          element={
            <ProtectedRoute>
              <PortfolioDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="portfolio/:id/edit"
          element={
            <ProtectedRoute>
              <EditPortfolioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Inventory Management" description="Track and manage equipment inventory." module="inventory_items" />
            </ProtectedRoute>
          }
        />
        <Route
          path="workflows"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Operational Workflows" description="Configure booking workflow stages." module="vendor_workflows" />
            </ProtectedRoute>
          }
        />

        {/* Vendor-specific modules */}
        <Route
          path="catering/overview"
          element={
            <ProtectedRoute>
              <CateringOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="catering/menus"
          element={
            <ProtectedRoute>
              <CateringMenusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="catering/menus/create"
          element={
            <ProtectedRoute>
              <CreateCateringMenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="catering/menus/:id"
          element={
            <ProtectedRoute>
              <CateringMenuDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="catering/menus/:id/edit"
          element={
            <ProtectedRoute>
              <EditCateringMenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="photography/overview"
          element={
            <ProtectedRoute>
              <PhotographyOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="photography/equipment"
          element={
            <ProtectedRoute>
              <EquipmentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="photography/equipment/create"
          element={
            <ProtectedRoute>
              <CreateEquipmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="photography/equipment/:id"
          element={
            <ProtectedRoute>
              <EquipmentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="photography/equipment/:id/edit"
          element={
            <ProtectedRoute>
              <EditEquipmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="dekorasi/themes"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Decoration Themes" description="Manage decoration themes and items." module="decoration_themes" />
            </ProtectedRoute>
          }
        />
        <Route
          path="mua/artists"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="MUA Artists" description="Manage your makeup artist roster." module="mua_artists" />
            </ProtectedRoute>
          }
        />
        <Route
          path="wedding-organizer/rundowns"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="WO Rundowns" description="Plan and track wedding rundowns." module="wo_rundowns" />
            </ProtectedRoute>
          }
        />

        {/* Settings & Profile */}
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Settings" description="Manage your vendor account settings." module="settings" />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="My Profile" description="View and update your profile information." module="profiles" />
            </ProtectedRoute>
          }
        />

        {/* Super Admin */}
        <Route
          path="super-admin"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Super Admin Portal" description="Platform administration dashboard." module="super_admin" phase="Phase 4" />
            </ProtectedRoute>
          }
        />

        {/* 404 within layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
