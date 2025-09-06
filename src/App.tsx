import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import { lightTheme } from './styles/theme';
import { GlobalStyles } from './styles/globalStyles';
import { ActivityList } from './components/ActivityList/ActivityList';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './components/AuthContext';
import { AppHeader } from './components/AppHeader';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard/Dashboard';

// Componente ProtectedRoute mejorado
const ProtectedRoute = ({ 
  children,
  allowedRoles = ['admin', 'user', 'guest']
}: { 
  children: React.ReactElement;
  allowedRoles?: string[];
}) => {
  const { user, loading } = useAuth();

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CssBaseline />
        Cargando...
      </Box>
    );
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verifica si el rol del usuario está en la lista de roles permitidos
  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppHeader />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/activities"
            element={
              <ProtectedRoute allowedRoles={["admin", "user", "guest"]}>
                <ActivityList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "user", "guest"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/activities" replace />} />
        </Routes>
      </Container>
      <Footer />
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <GlobalStyles />
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;