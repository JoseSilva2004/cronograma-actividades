import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack,
  InputAdornment,
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Refresh, 
  Person, 
  Security, 
  Block, 
  CheckCircle, 
  DeleteForever 
} from '@mui/icons-material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNotification } from '../Notifications/NotificationContext';
import { 
  fetchUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  deleteUserPermanent,
  ManageableUser 
} from '../../services/api';
import { ConfirmDialog } from '../ConfirmDialog';
import { UserFormData } from '../../types/user';
import { useAuth } from '../AuthContext';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<ManageableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManageableUser | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ManageableUser | null>(null);
  const [permanentDialogOpen, setPermanentDialogOpen] = useState(false);
  const [userToDeletePermanent, setUserToDeletePermanent] = useState<ManageableUser | null>(null);
  const [statusChangeInfo, setStatusChangeInfo] = useState<{ user: ManageableUser, newStatus: boolean } | null>(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [form, setForm] = useState<UserFormData>({
    email: '',
    nombre: '',
    password: '',
    rol: 'user'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const { showNotification } = useNotification();
  const { user: currentUser } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isSuperAdmin = currentUser?.rol === 'super_admin';

  // Función para cargar usuarios
  const loadUsers = useCallback(async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      setUsers([]);
      return;
    }
    try {
      setLoading(true);
      const usersData = await fetchUsers();
      console.log('Usuarios cargados:', usersData);
      setUsers(usersData);
    } catch (error: any) {
      console.error('Error loading users:', error);
      if (!error.message.includes('No tienes permisos')) {
        showNotification('Error al cargar usuarios: ' + (error.message || 'Error desconocido'), 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, showNotification]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers();
    }
  }, [isSuperAdmin, loadUsers]);

  // Funciones para manejar visibilidad de contraseñas
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // Funciones auxiliares
  const getRolColor = (rol: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (rol) {
      case 'super_admin': return 'error';
      case 'admin': return 'warning';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  const getRolLabel = (rol: string): string => {
    switch (rol) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Administrador';
      case 'user': return 'Usuario';
      default: return rol;
    }
  };

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case 'super_admin': return <Security />;
      case 'admin': return <Security />;
      case 'user': return <Person />;
      default: return <Person />;
    }
  };

  const canEditUser = (user: ManageableUser): boolean => {
    return user.rol !== 'super_admin';
  };

   const canDeleteUser = (user: ManageableUser): boolean => {
    return user.rol !== 'super_admin';
  };

  // Componente UserCard para móviles
  const UserCard = ({ user }: { user: ManageableUser }) => (
    <Card sx={{ 
      mb: 2, 
      p: 2, 
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      backgroundColor: user.activo ? '#ffffff' : '#f5f5f5'
    }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        {/* Header de la tarjeta */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={getRolLabel(user.rol)}
            color={getRolColor(user.rol)}
            size="small"
            icon={getRolIcon(user.rol)}
          />
          <Chip
            label={user.activo ? 'Activo' : 'Inactivo'}
            color={user.activo ? 'success' : 'default'}
            size="small"
          />
        </Box>

        {/* Información del usuario */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1, fontSize: '1rem' }}>
            {user.nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            📧 {user.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            📅 Registrado: {new Date(user.created_at).toLocaleDateString('es-ES')}
          </Typography>
          {user.updated_at !== user.created_at && (
            <Typography variant="caption" color="text.secondary">
              ✏️ Modificado: {new Date(user.updated_at).toLocaleDateString('es-ES')}
            </Typography>
          )}
        </Box>

        {/* Acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Tooltip title={user.activo ? "Desactivar usuario" : "Activar usuario"}>
            <span>
              <IconButton
                onClick={() => handleToggleUserStatus(user)}
                color={user.activo ? "warning" : "success"}
                size="small"
                disabled={user.rol === 'super_admin'}
              >
                {user.activo ? <Block /> : <CheckCircle />}
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={canEditUser(user) ? "Editar usuario" : "No editable"}>
            <span>
              <IconButton
                onClick={() => handleOpenDialog(user)}
                color="primary"
                size="small"
                disabled={!canEditUser(user)}
              >
                <Edit />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={canDeleteUser(user) ? "Eliminar definitivamente" : "No eliminable"}>
            <span>
              <IconButton
                onClick={() => handlePermanentDeleteRequest(user)}
                color="error"
                size="small"
                disabled={!canDeleteUser(user)}
              >
                <DeleteForever />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );

  // Handlers de las acciones
  const handleOpenDialog = (user?: ManageableUser) => {
    if (!isSuperAdmin) {
      showNotification('No tienes permisos para realizar esta acción', 'warning');
      return;
    }
    if (user) {
      setEditingUser(user);
      setForm({
        email: user.email,
        nombre: user.nombre,
        password: '',
        rol: user.rol === 'super_admin' ? 'admin' : user.rol
      });
    } else {
      setEditingUser(null);
      setForm({
        email: '',
        nombre: '',
        password: '',
        rol: 'user'
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setErrors({});
    setShowPassword(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email no válido';
    }
    if (!form.nombre.trim()) {
      newErrors.nombre = 'Nombre es obligatorio';
    }
    if (!editingUser && !form.password) {
      newErrors.password = 'Contraseña es obligatoria';
    } else if (form.password && form.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isSuperAdmin) {
      showNotification('No tienes permisos para realizar esta acción', 'warning');
      return;
    }
    if (!validateForm()) return;
    try {
      if (editingUser) {
        if (editingUser.rol === 'super_admin') {
          showNotification('No se pueden modificar usuarios super administrador', 'warning');
          return;
        }
        const updateData: any = {
          email: form.email,
          nombre: form.nombre,
          rol: form.rol
        };
        if (form.password.trim()) {
          updateData.password = form.password;
        }
        await updateUser(editingUser.id, updateData);
        showNotification('Usuario actualizado exitosamente', 'success');
      } else {
        const createData = {
          email: form.email,
          nombre: form.nombre,
          password: form.password,
          rol: form.rol
        };
        await createUser(createData);
        showNotification('Usuario creado exitosamente', 'success');
      }
      handleCloseDialog();
      await loadUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      showNotification(error.message || 'Error al guardar usuario', 'error');
    }
  };

  const handleToggleUserStatus = (user: ManageableUser) => {
    if (!isSuperAdmin) {
      showNotification('No tienes permisos para realizar esta acción', 'warning');
      return;
    }
    if (user.rol === 'super_admin') {
      showNotification('No se puede cambiar el estado de un Super Administrador', 'warning');
      return;
    }
    setStatusChangeInfo({ user, newStatus: !user.activo });
    setStatusConfirmOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusChangeInfo) return;
    const { user, newStatus } = statusChangeInfo;
    try {
      await updateUser(user.id, { activo: newStatus });
      showNotification(`Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`, 'success');
      await loadUsers();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      showNotification(error.message || 'Error al cambiar el estado del usuario', 'error');
    } finally {
      setStatusConfirmOpen(false);
      setStatusChangeInfo(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      showNotification('Usuario desactivado exitosamente', 'success');
      setUsers((prev) => prev.filter(u => u.id !== userToDelete.id));
      await loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showNotification(error.message || 'Error al desactivar usuario', 'error');
    } finally {
      setConfirmDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handlePermanentDeleteRequest = (user: ManageableUser) => {
    if (!isSuperAdmin) {
      showNotification('No tienes permisos para realizar esta acción', 'warning');
      return;
    }
    if (user.rol === 'super_admin') {
      showNotification('No se pueden eliminar usuarios super administrador', 'warning');
      return;
    }
    setUserToDeletePermanent(user);
    setPermanentDialogOpen(true);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!userToDeletePermanent) return;
    try {
      await deleteUserPermanent(userToDeletePermanent.id);
      showNotification('Usuario eliminado definitivamente', 'success');
      setUsers((prev) => prev.filter(u => u.id !== userToDeletePermanent.id));
      await loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showNotification(error.message || 'Error al eliminar usuario', 'error');
    } finally {
      setPermanentDialogOpen(false);
      setUserToDeletePermanent(null);
    }
  };

  // Resto del código del componente
  if (!isSuperAdmin) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: 2,
        p: 3
      }}>
        <Security sx={{ fontSize: 64, color: 'error.main' }} />
        <Typography variant="h5" color="error" textAlign="center">
          Acceso No Autorizado
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary">
          Se requieren permisos de Super Administrador para acceder a esta sección.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.href = '/activities'}
          sx={{ mt: 2 }}
        >
          Volver a Actividades
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 3 
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1rem', sm: '1.5rem', md: '1.8rem' },
            textAlign: { xs: 'center', sm: 'left' },
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            mb: { xs: 2, sm: 0 }
          }}
        >
          👥 Lista de Usuarios
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={1} 
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadUsers}
            size={isSmallMobile ? "small" : "medium"}
            fullWidth={isMobile}
          >
            {isMobile ? 'Actualizar' : 'Actualizar Lista'}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            size={isSmallMobile ? "small" : "medium"}
            fullWidth={isMobile}
          >
            {isMobile ? 'Nuevo' : 'Nuevo Usuario'}
          </Button>
        </Stack>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      {isMobile ? (
        <Box>
          {users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="textSecondary">
                No hay usuarios registrados
              </Typography>
            </Box>
          ) : (
            users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))
          )}
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 650 }} aria-label="tabla de usuarios">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', backgroundColor: theme.palette.primary.main}}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', backgroundColor: theme.palette.primary.main }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', backgroundColor: theme.palette.primary.main }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', backgroundColor: theme.palette.primary.main }}>Rol</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', backgroundColor: theme.palette.primary.main }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', backgroundColor: theme.palette.primary.main }}>Fecha Creación</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', backgroundColor: theme.palette.primary.main }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No hay usuarios registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {user.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRolLabel(user.rol)}
                        color={getRolColor(user.rol)}
                        size="small"
                        icon={getRolIcon(user.rol)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.activo ? 'Activo' : 'Inactivo'}
                        color={user.activo ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={canEditUser(user) ? "Editar usuario" : "No editable"}>
                          <span>
                            <IconButton
                              onClick={() => handleOpenDialog(user)}
                              color="primary"
                              size="small"
                              disabled={!canEditUser(user)}
                            >
                              <Edit />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={user.activo ? "Desactivar usuario" : "Activar usuario"}>
                          <span>
                            <IconButton
                              onClick={() => handleToggleUserStatus(user)}
                              color={user.activo ? "warning" : "success"}
                              size="small"
                              disabled={user.rol === 'super_admin'}
                            >
                              {user.activo ? <Block /> : <CheckCircle />}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={canDeleteUser(user) ? "Eliminar usuario" : "No eliminable"}>
                          <span>
                            <IconButton
                              onClick={() => handlePermanentDeleteRequest(user)}
                              color="error"
                              size="small"
                              disabled={!canDeleteUser(user)}
                            >
                              <DeleteForever />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo para crear/editar usuario */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isSmallMobile}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            mt: 1,
            pt: { xs: 1, sm: 0 }
          }}>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              size={isSmallMobile ? "small" : "medium"}
              disabled={editingUser?.rol === 'super_admin'}
            />
            <TextField
              label="Nombre Completo"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              error={!!errors.nombre}
              helperText={errors.nombre}
              fullWidth
              size={isSmallMobile ? "small" : "medium"}
              disabled={editingUser?.rol === 'super_admin'}
            />
            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={!!errors.password}
              helperText={errors.password || (editingUser ? 'Dejar en blanco para mantener la contraseña actual' : 'Mínimo 6 caracteres')}
              fullWidth
              size={isSmallMobile ? "small" : "medium"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth size={isSmallMobile ? "small" : "medium"}>
              <InputLabel id="rol-select-label">Rol</InputLabel>
              <Select
                labelId="rol-select-label"
                value={form.rol}
                label="Rol"
                onChange={(e) => setForm({ ...form, rol: e.target.value as 'admin' | 'user' })}
                disabled={editingUser?.rol === 'super_admin'}
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="user">Usuario Normal</MenuItem>
              </Select>
            </FormControl>
            {editingUser?.rol === 'super_admin' && (
              <Alert severity="warning" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                Los usuarios Super Administrador no pueden ser modificados
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            fullWidth={isSmallMobile}
            size={isSmallMobile ? "small" : "medium"}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={editingUser?.rol === 'super_admin'}
            fullWidth={isSmallMobile}
            size={isSmallMobile ? "small" : "medium"}
          >
            {editingUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogos de confirmación */}
      {userToDelete && (
        <ConfirmDialog
          open={confirmDialogOpen}
          title="Confirmar Desactivación"
          message={`¿Estás seguro de que deseas desactivar al usuario ${userToDelete.nombre}? El usuario podrá ser reactivado posteriormente.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDialogOpen(false)}
        />
      )}
      
      {userToDeletePermanent && (
        <ConfirmDialog
          open={permanentDialogOpen}
          title="Eliminar Definitivamente"
          message={`¿Estás seguro de que deseas eliminar al usuario ${userToDeletePermanent.nombre}? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmPermanentDelete}
          onCancel={() => setPermanentDialogOpen(false)}
        />
      )}
      
      {statusChangeInfo && (
        <ConfirmDialog
          open={statusConfirmOpen}
          title="Confirmar Cambio de Estado"
          message={`¿Estás seguro de que deseas ${statusChangeInfo.newStatus ? 'activar' : 'desactivar'} al usuario ${statusChangeInfo.user.nombre}?`}
          onConfirm={handleConfirmToggleStatus}
          onCancel={() => setStatusConfirmOpen(false)}
        />
      )}
    </Box>
  );
};