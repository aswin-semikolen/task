import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

/** Blocks protected pages until the session is known, so nothing flashes on screen. */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="page-loader">Loading…</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
