import { Navigate } from 'react-router-dom';
import { useTenantAuth } from '../../hooks/useTenantAuth';

export default function TenantProtectedRoute({ children }) {
  const { tenant } = useTenantAuth();
  if (!tenant) return <Navigate to="/login" replace />;
  return children;
}
