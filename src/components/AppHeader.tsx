import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Badge,
  Avatar,
} from '@mui/material';
import { useAuth } from '../components/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListIcon from '@mui/icons-material/List';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { isAuthenticatedUser, getUserName, hasRole } from '../types/user';

export const AppHeader = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const showUserInfo = user && location.pathname !== '/login';

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMobileMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMobileMenuClose();
  };

  // Obtener iniciales del usuario para el avatar
  const getUserInitials = () => {
    const userName = getUserName(user || { rol: 'guest' });
    if (userName !== 'Invitado') {
      return userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return 'I'; // Invitado
  };

  // Obtener color del avatar basado en el rol
  const getAvatarColor = () => {
    if (!user || user.rol === 'guest') return theme.palette.grey[500];
    if (user.rol === 'super_admin') return theme.palette.error.main;
    if (user.rol === 'admin') return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  // Obtener texto del rol
  const getRolText = () => {
    if (!user) return '';
    if (user.rol === 'super_admin') return 'Super Administrador';
    if (user.rol === 'admin') return 'Administrador';
    if (user.rol === 'user') return 'Usuario';
    return 'Invitado';
  };

  // Verificar si el usuario puede gestionar usuarios
  const canManageUsers = user ? hasRole(user, 'super_admin') : false;

  return (
    <AppBar 
      position="static" 
      color="primary" 
      elevation={3}
      sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` 
      }}
    >
      <Toolbar sx={{ 
        py: { xs: 1, sm: 1.5 },
        minHeight: { xs: '60px', sm: '64px' },
        px: { xs: 1, sm: 2 }
      }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: { xs: 1, sm: 2 } }}>
          <Logo 
            size={isSmallMobile ? "small" : isMobile ? "medium" : "medium"} 
            showText={false} 
            color='white' 
          />
        </Box>
        
        {/* Título */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: { xs: 1, sm: 0 },
            mr: { xs: 1, sm: 3 },
            color: 'white',
            fontSize: { 
              xs: '0.85rem',
              sm: '1.1rem', 
              md: '1.25rem',
              lg: '1.4rem' 
            },
            fontWeight: 'bold',
            whiteSpace: { xs: 'normal', sm: 'nowrap' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: { xs: 2, sm: 1 },
            WebkitBoxOrient: 'vertical',
            lineHeight: { xs: 1.2, sm: 1.5 },
            maxWidth: { 
              xs: '120px',
              sm: '200px', 
              md: '300px',
              lg: 'none' 
            }
          }}
        >
          Sistema de Gestión de Actividades
        </Typography>
        
        {showUserInfo && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, sm: 1, md: 2 },
            ml: 'auto'
          }}>
            {/* Menú para móviles */}
            {isMobile ? (
              <>
                {/* Información de usuario visible en móviles */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mr: 1,
                  flexDirection: 'column',
                  textAlign: 'right'
                }}>
                  {isAuthenticatedUser(user) ? (
                    <>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'white', 
                          fontWeight: 'medium',
                          fontSize: '0.75rem',
                          lineHeight: 1,
                          display: { xs: 'block', sm: 'none' }
                        }}
                      >
                        {user.nombre}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '0.7rem',
                          lineHeight: 1,
                          display: { xs: 'block', sm: 'none' }
                        }}
                      >
                        {getRolText()}
                      </Typography>
                    </>
                  ) : (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'white', 
                        display: { xs: 'block', sm: 'none' },
                        fontSize: '0.75rem'
                      }}
                    >
                      👤 Invitado
                    </Typography>
                  )}
                </Box>

                {/* Avatar del usuario en móvil */}
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  color={
                    user.rol === 'super_admin' ? 'error' : 
                    user.rol === 'admin' ? 'warning' : 'success'
                  }
                >
                  <Avatar 
                    sx={{ 
                      width: { xs: 32, sm: 36 }, 
                      height: { xs: 32, sm: 36 }, 
                      bgcolor: getAvatarColor(),
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      display: { xs: 'flex', sm: 'none' }
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </Badge>

                <IconButton 
                  color="inherit" 
                  onClick={handleMobileMenuOpen}
                  sx={{ 
                    color: 'white',
                    p: { xs: 0.5, sm: 1 }
                  }}
                  size="large"
                >
                  <MenuIcon />
                </IconButton>

                <Menu
                  anchorEl={mobileMenuAnchor}
                  open={Boolean(mobileMenuAnchor)}
                  onClose={handleMobileMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow: theme.shadows[8],
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1.5,
                      }
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  {/* Información del usuario en el menú móvil */}
                  <MenuItem 
                    sx={{
                      backgroundColor: 'primary.light',
                      color: 'white',
                      pointerEvents: 'none',
                      opacity: 1,
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: getAvatarColor(),
                          fontSize: '0.8rem'
                        }}
                      >
                        {getUserInitials()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {getUserName(user)}
                        </Typography>
                        <Typography variant="caption">
                          {getRolText()}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>

                  <MenuItem 
                    onClick={() => handleNavigation('/activities')}
                    selected={isActiveRoute('/activities')}
                    sx={{
                      color: isActiveRoute('/activities') ? 'primary.main' : 'text.primary',
                      backgroundColor: isActiveRoute('/activities') ? 'action.selected' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <ListIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
                    <Typography variant="body2" fontWeight={isActiveRoute('/activities') ? 'bold' : 'normal'}>
                      Actividades
                    </Typography>
                  </MenuItem>
                  
                  <MenuItem 
                    onClick={() => handleNavigation('/dashboard')}
                    selected={isActiveRoute('/dashboard')}
                    sx={{
                      color: isActiveRoute('/dashboard') ? 'primary.main' : 'text.primary',
                      backgroundColor: isActiveRoute('/dashboard') ? 'action.selected' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <DashboardIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
                    <Typography variant="body2" fontWeight={isActiveRoute('/dashboard') ? 'bold' : 'normal'}>
                      Dashboard
                    </Typography>
                  </MenuItem>

                  {/* Opción de Gestión de Usuarios solo para super admin */}
                  {canManageUsers && (
                    <MenuItem 
                      onClick={() => handleNavigation('/users')}
                      selected={isActiveRoute('/users')}
                      sx={{
                        color: isActiveRoute('/users') ? 'primary.main' : 'text.primary',
                        backgroundColor: isActiveRoute('/users') ? 'action.selected' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <ManageAccountsIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
                      <Typography variant="body2" fontWeight={isActiveRoute('/users') ? 'bold' : 'normal'}>
                        Gestión Usuarios
                      </Typography>
                    </MenuItem>
                  )}
                  
                  <MenuItem 
                    onClick={user.rol === 'guest' ? () => handleNavigation('/login') : handleLogout}
                    sx={{
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    {user.rol === 'guest' ? (
                      <>
                        <LoginIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
                        <Typography variant="body2">Iniciar Sesión</Typography>
                      </>
                    ) : (
                      <>
                        <ExitToAppIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
                        <Typography variant="body2">Cerrar Sesión</Typography>
                      </>
                    )}
                  </MenuItem>
                </Menu>
              </>
            ) : (
              /* Menú para desktop */
              <>
                {/* Botones de navegación */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  mr: 3,
                  flex: { lg: 1 },
                  justifyContent: 'center'
                }}>
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/activities')}
                    variant={isActiveRoute('/activities') ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={<ListIcon />}
                    sx={{ 
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      backgroundColor: isActiveRoute('/activities') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      fontSize: { sm: '0.8rem', md: '0.875rem' },
                      minWidth: { sm: '110px', md: '130px' },
                      px: { sm: 1, md: 2 },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'white',
                      },
                      '&.MuiButton-contained': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.35)',
                        }
                      }
                    }}
                  >
                    Actividades
                  </Button>
                  
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/dashboard')}
                    variant={isActiveRoute('/dashboard') ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={<DashboardIcon />}
                    sx={{ 
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      backgroundColor: isActiveRoute('/dashboard') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      fontSize: { sm: '0.8rem', md: '0.875rem' },
                      minWidth: { sm: '110px', md: '130px' },
                      px: { sm: 1, md: 2 },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'white'
                      },
                      '&.MuiButton-contained': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.35)',
                        }
                      }
                    }}
                  >
                    Dashboard
                  </Button>

                  {/* Botón de Gestión de Usuarios solo para super admin */}
                  {canManageUsers && (
                    <Button 
                      color="inherit" 
                      onClick={() => navigate('/users')}
                      variant={isActiveRoute('/users') ? 'contained' : 'outlined'}
                      size="small"
                      startIcon={<ManageAccountsIcon />}
                      sx={{ 
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        backgroundColor: isActiveRoute('/users') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        fontSize: { sm: '0.8rem', md: '0.875rem' },
                        minWidth: { sm: '140px', md: '160px' },
                        px: { sm: 1, md: 2 },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'white'
                        },
                        '&.MuiButton-contained': {
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.35)',
                          }
                        }
                      }}
                    >
                      Gestión Usuarios
                    </Button>
                  )}
                </Box>

                {/* Información de usuario */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  ml: 'auto'
                }}>
                  {isAuthenticatedUser(user) ? (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      flexDirection: { xs: 'column', sm: 'row' },
                      textAlign: { xs: 'center', sm: 'left' }
                    }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        color={
                          user.rol === 'super_admin' ? 'error' : 
                          user.rol === 'admin' ? 'warning' : 'success'
                        }
                      >
                        <Avatar 
                          sx={{ 
                            width: { xs: 32, sm: 36 }, 
                            height: { xs: 32, sm: 36 }, 
                            bgcolor: getAvatarColor(),
                            fontSize: { xs: '0.8rem', sm: '0.9rem' }
                          }}
                        >
                          {getUserInitials()}
                        </Avatar>
                      </Badge>
                      
                      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'white', 
                            fontWeight: 'medium',
                            fontSize: '0.875rem'
                          }}
                        >
                          {user.nombre}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.75rem'
                          }}
                        >
                          {getRolText()}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'white', 
                        display: { xs: 'none', sm: 'block' },
                        fontSize: '0.875rem'
                      }}
                    >
                      👤 Invitado
                    </Typography>
                  )}

                  <Button
                    variant="outlined"
                    onClick={user.rol === 'guest' ? () => navigate('/login') : logout}
                    size="small"
                    startIcon={user.rol === 'guest' ? <LoginIcon /> : <ExitToAppIcon />}
                    sx={{ 
                      color: 'white', 
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      fontSize: { sm: '0.8rem', md: '0.875rem' },
                      minWidth: { xs: 'auto', sm: '120px' },
                      px: { xs: 1, sm: 2 },
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'white'
                      }
                    }}
                  >
                    {user.rol === 'guest' ? 'Iniciar Sesión' : 'Salir'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};