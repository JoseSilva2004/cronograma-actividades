// src/components/ProtectedRoute.tsx
import { useAuth } from './AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

// Define el tipo para las props
interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

// Exporta el componente como módulo
export const ProtectedRoute = ({ 
  children,
  allowedRoles = ['admin', 'user', 'guest']
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica si el rol del usuario está en la lista de roles permitidos
  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
};

// Asegúrate de tener al menos una exportación
export default ProtectedRoute;