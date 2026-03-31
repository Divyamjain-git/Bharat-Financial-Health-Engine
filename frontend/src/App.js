import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import GoalsPage from './pages/GoalsPage';
import NetWorthPage from './pages/NetWorthPage';
import BudgetPage from './pages/BudgetPage';
import SimulationPage from './pages/SimulationPage';
import AlertsPage from './pages/AlertsPage';
import InflationPage from './pages/InflationPage';
import Sidebar from './components/shared/Sidebar';

const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(s => s.auth);
  return isAuthenticated ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  if (isAuthenticated) return <Navigate to={user?.isOnboardingComplete ? '/dashboard' : '/onboarding'} replace />;
  return children;
};

const ProtectedRouteNoLayout = ({ children }) => {
  const { isAuthenticated } = useSelector(s => s.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page at root */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth pages */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Onboarding (no sidebar) */}
        <Route path="/onboarding" element={
          <ProtectedRouteNoLayout><OnboardingPage /></ProtectedRouteNoLayout>
        } />

        {/* App pages (with sidebar) */}
        <Route path="/dashboard"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/net-worth"   element={<ProtectedRoute><NetWorthPage /></ProtectedRoute>} />
        <Route path="/goals"       element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
        <Route path="/budget"      element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
        <Route path="/simulation"  element={<ProtectedRoute><SimulationPage /></ProtectedRoute>} />
        <Route path="/alerts"      element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
        <Route path="/inflation"   element={<ProtectedRoute><InflationPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
