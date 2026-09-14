import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OperationsProvider } from './context/OperationsContext';
import { AppShell } from './components/layout/AppShell';

// Pages
import { LoginPage } from './pages/LoginPage';
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

export const App: React.FC = () => {
  return (
    <OperationsProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Operational Shell Layout */}
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </OperationsProvider>
  );
};

export default App;
