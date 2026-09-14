import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OperationsProvider } from './context/OperationsContext';
import { MusicProvider } from './context/MusicContext';
import { AppShell } from './components/layout/AppShell';
import { ShippingAppShell } from './components/layout/ShippingAppShell';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';

// Port Operations / Admin Pages
import { LoginPage } from './pages/LoginPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { VesselsPage } from './pages/VesselsPage';
import { VesselDetailPage } from './pages/VesselDetailPage';
import { BerthsPage } from './pages/BerthsPage';
import { CranesPage } from './pages/CranesPage';
import { YardPage } from './pages/YardPage';
import { OperationsBoardPage } from './pages/OperationsBoardPage';
import { ForecastPage } from './pages/ForecastPage';
import { OptimizerPage } from './pages/OptimizerPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { PlannerPage } from './pages/PlannerPage';
import { RoutesPage } from './pages/RoutesPage';
import { CopilotPage } from './pages/CopilotPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';

// Shipping Agency Pages
import { ShippingDashboardPage } from './pages/shipping/ShippingDashboardPage';
import { ShippingVesselsPage } from './pages/shipping/ShippingVesselsPage';
import { ShippingAddVesselPage } from './pages/shipping/ShippingAddVesselPage';
import { ShippingVesselDetailPage } from './pages/shipping/ShippingVesselDetailPage';
import { ShippingBerthRequestsPage } from './pages/shipping/ShippingBerthRequestsPage';
import { ShippingSchedulesPage } from './pages/shipping/ShippingSchedulesPage';
import { ShippingCargoPage } from './pages/shipping/ShippingCargoPage';
import { ShippingDocumentsPage } from './pages/shipping/ShippingDocumentsPage';
import { ShippingAlertsPage } from './pages/shipping/ShippingAlertsPage';
import { ShippingCopilotPage } from './pages/shipping/ShippingCopilotPage';
import { ShippingProfilePage } from './pages/shipping/ShippingProfilePage';

/**
 * Directs authenticated users to their designated role portal home,
 * or unauthenticated users to /login.
 */
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
          <span>Verifying port authorization...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ship-agent') {
    return <Navigate to="/shipping/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

/**
 * Catch-all fallback for undefined routes
 */
const CatchAllRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ship-agent') {
    return <Navigate to="/shipping/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <OperationsProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Route */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/login" element={<AuthPage mode="login" />} />
            <Route path="/auth/signup" element={<AuthPage mode="signup" />} />

            {/* Root Portal Router */}
            <Route path="/" element={<RootRedirect />} />

            {/* 1. PORT OPERATIONS ADMIN PORTAL */}
            <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Operations Group */}
                <Route path="/operations/vessels" element={<VesselsPage />} />
                <Route path="/operations/vessels/:id" element={<VesselDetailPage />} />
                <Route path="/operations/berths" element={<BerthsPage />} />
                <Route path="/operations/cranes" element={<CranesPage />} />
                <Route path="/operations/yard" element={<YardPage />} />
                <Route path="/operations" element={<OperationsBoardPage />} />
                <Route path="/operations/board" element={<OperationsBoardPage />} />

                {/* Intelligence Group */}
                <Route path="/intelligence/forecast" element={<ForecastPage />} />
                <Route path="/copilot" element={<CopilotPage />} />
                <Route path="/intelligence/routes" element={<RoutesPage />} />

                {/* Decision Support Group */}
                <Route path="/decision/optimizer" element={<OptimizerPage />} />
                <Route path="/decision/simulator" element={<SimulatorPage />} />
                <Route path="/decision/planner" element={<PlannerPage />} />

                {/* Analytics */}
                <Route path="/analytics" element={<AnalyticsPage />} />

                {/* System */}
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Admin Aliases */}
                <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/operations" element={<OperationsBoardPage />} />
                <Route path="/admin/optimizer" element={<OptimizerPage />} />
                <Route path="/admin/simulator" element={<SimulatorPage />} />
                <Route path="/admin/planner" element={<PlannerPage />} />
                <Route path="/admin/forecast" element={<ForecastPage />} />
                <Route path="/admin/copilot" element={<CopilotPage />} />
                <Route path="/admin/routes" element={<RoutesPage />} />
                <Route path="/admin/analytics" element={<AnalyticsPage />} />
                <Route path="/admin/alerts" element={<AlertsPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
        <MusicProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Root Portal Router */}
              <Route path="/" element={<RootRedirect />} />

              {/* 1. PORT OPERATIONS ADMIN PORTAL */}
              <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<AppShell />}>
                  <Route path="/dashboard" element={<DashboardPage />} />

                  {/* Operations Group */}
                  <Route path="/operations/vessels" element={<VesselsPage />} />
                  <Route path="/operations/vessels/:id" element={<VesselDetailPage />} />
                  <Route path="/operations/berths" element={<BerthsPage />} />
                  <Route path="/operations/cranes" element={<CranesPage />} />
                  <Route path="/operations/yard" element={<YardPage />} />
                  <Route path="/operations" element={<OperationsBoardPage />} />
                  <Route path="/operations/board" element={<OperationsBoardPage />} />

                  {/* Intelligence Group */}
                  <Route path="/intelligence/forecast" element={<ForecastPage />} />
                  <Route path="/copilot" element={<CopilotPage />} />
                  <Route path="/intelligence/routes" element={<RoutesPage />} />

                  {/* Decision Support Group */}
                  <Route path="/decision/optimizer" element={<OptimizerPage />} />
                  <Route path="/decision/simulator" element={<SimulatorPage />} />
                  <Route path="/decision/planner" element={<PlannerPage />} />

                  {/* Analytics */}
                  <Route path="/analytics" element={<AnalyticsPage />} />

                  {/* System */}
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />

                  {/* Admin Aliases */}
                  <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<DashboardPage />} />
                  <Route path="/admin/operations" element={<OperationsBoardPage />} />
                  <Route path="/admin/optimizer" element={<OptimizerPage />} />
                  <Route path="/admin/simulator" element={<SimulatorPage />} />
                  <Route path="/admin/planner" element={<PlannerPage />} />
                  <Route path="/admin/forecast" element={<ForecastPage />} />
                  <Route path="/admin/copilot" element={<CopilotPage />} />
                  <Route path="/admin/routes" element={<RoutesPage />} />
                  <Route path="/admin/analytics" element={<AnalyticsPage />} />
                  <Route path="/admin/alerts" element={<AlertsPage />} />
                  <Route path="/admin/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* 2. SHIPPING AGENCY PORTAL */}
              <Route element={<RoleProtectedRoute allowedRoles={['ship-agent']} />}>
                <Route element={<ShippingAppShell />}>
                  <Route path="/shipping" element={<Navigate to="/shipping/dashboard" replace />} />
                  <Route path="/shipping/dashboard" element={<ShippingDashboardPage />} />
                  <Route path="/shipping/vessels" element={<ShippingVesselsPage />} />
                  <Route path="/shipping/vessels/add" element={<ShippingAddVesselPage />} />
                  <Route path="/shipping/vessels/:id" element={<ShippingVesselDetailPage />} />
                  <Route path="/shipping/berth-requests" element={<ShippingBerthRequestsPage />} />
                  <Route path="/shipping/schedules" element={<ShippingSchedulesPage />} />
                  <Route path="/shipping/cargo" element={<ShippingCargoPage />} />
                  <Route path="/shipping/documents" element={<ShippingDocumentsPage />} />
                  <Route path="/shipping/alerts" element={<ShippingAlertsPage />} />
                  <Route path="/shipping/copilot" element={<ShippingCopilotPage />} />
                  <Route path="/shipping/profile" element={<ShippingProfilePage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<CatchAllRedirect />} />
            </Routes>
          </BrowserRouter>
        </MusicProvider>
      </OperationsProvider>
    </AuthProvider>
  );
};

export default App;
