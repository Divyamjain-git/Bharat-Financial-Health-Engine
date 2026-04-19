import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Sidebar from './components/shared/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import BudgetPage from './pages/BudgetPage';
import GoalsPage from './pages/GoalsPage';
import NetWorthPage from './pages/NetWorthPage';
import SimulationPage from './pages/SimulationPage';
import InflationPage from './pages/InflationPage';
import AlertsPage from './pages/AlertsPage';
import RecommendationsPage from './pages/RecommendationsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function AppShell({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, marginLeft: '240px' }}>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/dashboard"        element={<ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute>} />
        <Route path="/recommendations"  element={<ProtectedRoute><AppShell><RecommendationsPage /></AppShell></ProtectedRoute>} />
        <Route path="/budget"           element={<ProtectedRoute><AppShell><BudgetPage /></AppShell></ProtectedRoute>} />
        <Route path="/goals"            element={<ProtectedRoute><AppShell><GoalsPage /></AppShell></ProtectedRoute>} />
        <Route path="/net-worth"        element={<ProtectedRoute><AppShell><NetWorthPage /></AppShell></ProtectedRoute>} />
        <Route path="/simulation"       element={<ProtectedRoute><AppShell><SimulationPage /></AppShell></ProtectedRoute>} />
        <Route path="/inflation"        element={<ProtectedRoute><AppShell><InflationPage /></AppShell></ProtectedRoute>} />
        <Route path="/alerts"           element={<ProtectedRoute><AppShell><AlertsPage /></AppShell></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}