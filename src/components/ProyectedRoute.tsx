import React from 'react';
import { useAuth } from '../components/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNotification } from './Notifications/NotificationContext';

// Define el tipo para las props
interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

// Componente ProtectedRoute mejorado
export const ProtectedRoute = ({ 
  children,
  allowedRoles = ['super_admin', 'admin', 'user', 'guest']
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { showNotification } = useNotification();
  const location = useLocation();

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body1" color="textSecondary">
          Cargando...
        </Typography>
      </Box>
    );
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica si el rol del usuario está en la lista de roles permitidos
  if (!allowedRoles.includes(user.rol)) {
    showNotification('No tienes permisos para acceder a esta página', 'warning');
    return <Navigate to="/" replace />;
  }

  return children;
};

// Componente específico para rutas de super administrador
export const SuperAdminRoute = ({ 
  children 
}: { 
  children: React.ReactElement;
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body1" color="textSecondary">
          Cargando...
        </Typography>
      </Box>
    );
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Componente para rutas que requieren autenticación (cualquier usuario logueado)
export const AuthenticatedRoute = ({ 
  children 
}: { 
  children: React.ReactElement;
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body1" color="textSecondary">
          Cargando...
        </Typography>
      </Box>
    );
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user || user.rol === 'guest') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Componente para rutas públicas (solo accesibles para usuarios no autenticados)
export const PublicRoute = ({ 
  children 
}: { 
  children: React.ReactElement;
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body1" color="textSecondary">
          Cargando...
        </Typography>
      </Box>
    );
  }

  // Si el usuario ya está autenticado, redirige a la página principal
  if (user && user.rol !== 'guest') {
    const from = location.state?.from?.pathname || '/activities';
    return <Navigate to={from} replace />;
  }

  return children;
};

// Exportación por defecto (manteniendo compatibilidad)
const ProtectedRouteComponent = ProtectedRoute;
export default ProtectedRouteComponent;