import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function InicioPorRol() {
  const { user } = useAuth();
  return <Navigate to={user?.rol === 'admin' ? '/admin' : '/usuario'} replace />;
}
