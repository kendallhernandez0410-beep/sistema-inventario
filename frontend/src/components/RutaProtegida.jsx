import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RutaProtegida({ role }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <main className="loading-screen" role="status">Comprobando sesión…</main>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user?.rol !== role) {
    return <Navigate to={user?.rol === 'admin' ? '/admin' : '/usuario'} replace />;
  }

  return <Outlet />;
}
