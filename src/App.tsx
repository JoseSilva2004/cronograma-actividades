import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { lightTheme } from './styles/theme';
import { GlobalStyles } from './styles/globalStyles';
import { ActivityList } from './components/ActivityList/ActivityList';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './components/AuthContext';

// Componente ProtectedRoute mejorado
const ProtectedRoute = ({ 
  children,
  allowedRoles = ['admin', 'user', 'guest']
}: { 
  children: React.ReactElement;
  allowedRoles?: string[];
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; // Puedes reemplazar con un spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Componente AppBar reutilizable
const AppHeader = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const showUserInfo = user && location.pathname !== '/login';

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#fff' }}>
          📋 Cronograma de Actividades - Soporte Técnico
        </Typography>
        {showUserInfo && (
          <>
            {'nombre' in user ? (
              <Typography variant="subtitle1" sx={{ mr: 2, color: '#fff' }}>
                {user.nombre} ({user.rol})
              </Typography>
            ) : (
              <Typography variant="subtitle1" sx={{ mr: 2, color: '#fff' }}>
                Invitado
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={logout}
              sx={{
                bgcolor: '#0d47a1', // Un azul oscuro (Material-UI Blue 900)
                '&:hover': {
                  bgcolor: '#1565c0', // Un azul un poco más claro al pasar el mouse
                },
              }}>
              {user.rol === 'guest' ? 'Iniciar Sesión' : 'Cerrar Sesión'}
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <GlobalStyles />
      <AuthProvider>
        <BrowserRouter>
          <AppHeader />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/activities" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'user', 'guest']}>
                    <ActivityList />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/activities" replace />} />
            </Routes>
          </Container>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;