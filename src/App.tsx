import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import { lightTheme } from './styles/theme';
import { GlobalStyles } from './styles/globalStyles';
import { ActivityList } from './components/ActivityList/ActivityList';
import { Login } from './components/Login';
import { AuthProvider } from './components/AuthContext';
import { AppHeader } from './components/AppHeader';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard/Dashboard';
import { NotificationProvider } from './components/Notifications/NotificationContext';
import { UserManagement } from './components/UserManagement/UserManagement';
import { ProtectedRoute, SuperAdminRoute, PublicRoute } from './components/ProyectedRoute';

const AppContent: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppHeader />
      <Box component="main" sx={{ flex: 1, py: { xs: 2, sm: 3 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
          <Routes>
            {/* Ruta pública (solo para no autenticados) */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            {/* Rutas protegidas para todos los usuarios */}
            <Route
              path="/activities"
              element={
                <ProtectedRoute allowedRoles={["super_admin", "admin", "user", "guest"]}>
                  <ActivityList />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["super_admin", "admin", "user", "guest"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Ruta solo para super administrador */}
            <Route
              path="/users"
              element={
                <SuperAdminRoute>
                  <UserManagement />
                </SuperAdminRoute>
              }
            />
            
            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/activities" replace />} />
            
            {/* Ruta para páginas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <GlobalStyles />
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;