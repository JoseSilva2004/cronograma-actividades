import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';
import { Logo } from './Logo';

export const AppHeader = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

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