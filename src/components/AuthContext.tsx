import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout, getCurrentUser, User } from '../services/api';
import { useNotification } from '../components/Notifications/NotificationContext';
import { isAuthenticatedUser, getUserName } from '../types/user';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const navigate = useNavigate(); // Usar navigate de React Router

  // Calcular si el usuario está autenticado
  const isAuthenticated = user !== null && isAuthenticatedUser(user);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const userData = getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error al cargar usuario', error);
        setUser({ rol: 'guest' });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

 const login = async (email: string, password: string) => {
  try {
    setLoading(true);
    const { token, user: userData } = await apiLogin(email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    const userName = getUserName(userData);
    showNotification(`¡Bienvenido ${userName}! Sesión iniciada correctamente`, 'success');
    
    // Redirigir a activities después del login exitoso
    navigate('/activities', { replace: true });
  } catch (error: any) {
    // Mostrar el mensaje específico del error (incluyendo el de usuario inactivo)
    const errorMessage = error.message || 'Error al iniciar sesión. Verifica tus credenciales';
    showNotification(errorMessage, 'error');
    throw error;
  } finally {
    setLoading(false);
  }
};

  const logout = () => {
    const userName = user ? getUserName(user) : 'Usuario';
    
    // Limpiar localStorage
    apiLogout();
    setUser({ rol: 'guest' });
    
    // Mostrar notificación
    showNotification(`Sesión cerrada. ¡Hasta pronto ${userName}!`, 'info');
    
    // Redirigir a login usando navigate (sin recargar la página)
    navigate('/login', { replace: true });
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};