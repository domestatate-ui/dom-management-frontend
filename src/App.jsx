import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { TenantAuthProvider } from './hooks/useTenantAuth';
import { ToastProvider } from './components/shared/Toast';
import ProtectedRoute from './components/landlord/ProtectedRoute';
import TenantProtectedRoute from './components/tenant/ProtectedRoute';
import Layout from './components/landlord/layout/Layout';

import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

import Dashboard    from './pages/landlord/Dashboard';
import Tenants      from './pages/landlord/Tenants';
import TenantDetail from './pages/landlord/TenantDetail';
import Units        from './pages/landlord/Units';
import Properties   from './pages/landlord/Properties';
import Maintenance  from './pages/landlord/Maintenance';
import AddTenant    from './pages/landlord/AddTenant';
import AddUnit      from './pages/landlord/AddUnit';
import AddProperty  from './pages/landlord/AddProperty';

import TenantDashboard    from './pages/tenant/Dashboard';
import TenantRent         from './pages/tenant/Rent';
import TenantMaintenance  from './pages/tenant/Maintenance';
import TenantAgreement    from './pages/tenant/Agreement';
import TenantAnnouncements from './pages/tenant/Announcements';

export default function App() {
  return (
    <AuthProvider>
      <TenantAuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Auth */}
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Tenant login redirect → unified login */}
              <Route path="/tenant/login" element={<Navigate to="/login" replace />} />

              {/* Tenant portal */}
              <Route path="/tenant/dashboard"    element={<TenantProtectedRoute><TenantDashboard /></TenantProtectedRoute>} />
              <Route path="/tenant/rent"         element={<TenantProtectedRoute><TenantRent /></TenantProtectedRoute>} />
              <Route path="/tenant/maintenance"  element={<TenantProtectedRoute><TenantMaintenance /></TenantProtectedRoute>} />
              <Route path="/tenant/agreement"   element={<TenantProtectedRoute><TenantAgreement /></TenantProtectedRoute>} />
              <Route path="/tenant/announcements" element={<TenantProtectedRoute><TenantAnnouncements /></TenantProtectedRoute>} />

              {/* Landlord app */}
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index                element={<Dashboard />} />
                <Route path="tenants"       element={<Tenants />} />
                <Route path="tenants/:id"   element={<TenantDetail />} />
                <Route path="units"         element={<Units />} />
                <Route path="properties"    element={<Properties />} />
                <Route path="maintenance"   element={<Maintenance />} />
                <Route path="add-tenant"    element={<AddTenant />} />
                <Route path="add-unit"      element={<AddUnit />} />
                <Route path="add-property"  element={<AddProperty />} />
              </Route>
            </Routes>
          </Router>
        </ToastProvider>
      </TenantAuthProvider>
    </AuthProvider>
  );
}
