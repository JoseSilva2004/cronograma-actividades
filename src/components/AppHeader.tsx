//AppHeader.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, ButtonGroup } from '@mui/material';
import { useAuth } from './AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

export const AppHeader = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const showUserInfo = user && location.pathname !== '/login';

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Logo size="medium" showText={false} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2, color: 'white' }}>
          Sistema de Gestión de Actividades
        </Typography>
        
        {showUserInfo && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Navegación */}
            <ButtonGroup variant="text" sx={{ mr: 2 }}>
              <Button 
                color="inherit" 
                onClick={() => navigate('/activities')}
                variant={location.pathname === '/activities' ? 'outlined' : 'text'}
                sx={{ 
                  margin: '5px',
                  color: 'white',
                  backgroundColor: '#0c4b8aff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Actividades
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/dashboard')}
                variant={location.pathname === '/dashboard' ? 'outlined' : 'text'}
                sx={{ 
                  margin: '5px',
                  color: 'white',
                  backgroundColor: '#0c4b8aff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white'
                  }
                }}
              >
                Dashboard
              </Button>
            </ButtonGroup>

            {'nombre' in user ? (
              <Typography variant="body2" sx={{ color: 'white' }}>
                {user.nombre} ({user.rol})
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: 'white' }}>
                Invitado
              </Typography>
            )}
            <Button
              variant="outlined"
              onClick={logout}
              sx={{
                color: 'white',
                backgroundColor: '#0c4b8aff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'white'
                }
              }}
            >
              {user.rol === 'guest' ? 'Iniciar Sesión' : 'Cerrar Sesión'}
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};