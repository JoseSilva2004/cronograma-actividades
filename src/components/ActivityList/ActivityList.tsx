import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Button,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AddActivityDialog } from '../AddActivityDialog';
import { EditActivityDialog } from '../EditActivityDialog';
import { ConfirmDialog } from '../ConfirmDialog';
import { fetchActivities, deleteActivity, fetchZonas, Zona } from '../../services/api';
import { Activity, statusLabels } from './../../types/activity';
import { getCurrentUser } from '../../services/api';
import { formatNullableValue } from '../../utils/helpers';

export const ActivityList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const user = getCurrentUser();
  const isGuest = user.rol === 'guest';

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [activitiesData, zonasData] = await Promise.all([
        fetchActivities(),
        fetchZonas()
      ]);
      setZonas(zonasData);
      setActivities(
        activitiesData.map((activity) => ({
          ...activity,
          estado: activity.estado as Activity['estado'],
          zona: zonasData.find(z => z.id === activity.zona_id) || null,
        })) as Activity[]
      );
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteClick = (id: number) => {
    setActivityToDelete(id);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (activityToDelete) {
      try {
        await deleteActivity(activityToDelete);
        await loadData();
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
    setConfirmDialogOpen(false);
    setActivityToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setActivityToDelete(null);
  };

  const handleRefresh = () => {
    loadData();
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'success';
      case 'en_progreso': return 'warning';
      case 'en_ejecucion': return 'info';
      case 'programado': return 'secondary';
      default: return 'default';
    }
  };

 // En el componente ActivityList, modifica estas funciones:
const getRowBackgroundColor = (index: number) => {
  return index % 2 === 0 
    ? '#ffffff' // Blanco para filas pares
    : '#ecececff'; // Gris muy claro para filas impares
};

const getRowHoverColor = (index: number) => {
  return index % 2 === 0 
    ? '#e3f2fd' // Azul muy claro al hover para filas pares
    : '#bbdefb'; // Azul un poco más oscuro al hover para filas impares
};
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          📋 Tabla de Actividades
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Actualizar lista">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          {!isGuest && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setAddDialogOpen(true)}
              startIcon={<span>+</span>}
            >
              Nueva Actividad
            </Button>
          )}
        </Box>
      </Box>

      <TableContainer 
        component={Paper} 
        elevation={2}
        sx={{
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: '#1976d2',
              backgroundImage: 'linear-gradient(45deg, #1565c0 0%, #1976d2 100%)'
            }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px', py: 2, borderBottom: 'none', backgroundColor: '#1976d2' }}>#</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px', minWidth: 200, py: 2, borderBottom: 'none', backgroundColor: '#1976d2' }}>Actividad</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px', minWidth: 120, py: 2, borderBottom: 'none', backgroundColor: '#1976d2' }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px', minWidth: 150, py: 2, borderBottom: 'none', backgroundColor: '#1976d2' }}>Responsable</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px', minWidth: 120, py: 2, borderBottom: 'none', backgroundColor: '#1976d2' }}>Zona</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px', minWidth: 150, py: '2px', borderBottom: 'none', backgroundColor: '#1976d2' }}>Sub-zona</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px', minWidth: 120, py: 2, borderBottom: 'none', backgroundColor: '#1976d2' }}>Tienda</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px', minWidth: 150, py: 2, borderBottom: 'none', backgroundColor: '#1976d2' }}>Razón Social</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px', minWidth: 180, py: 2, borderBottom: 'none', backgroundColor: '#1976d2' }}>Asignado</TableCell>
              {!isGuest && <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px', width: 120, py: 2, borderBottom: 'none', backgroundColor: '#1976d2' }}>Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isGuest ? 9 : 10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay actividades registradas
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity, index) => (
                <TableRow 
                  key={activity.id}
                  sx={{ 
                    backgroundColor: getRowBackgroundColor(index),
                    '&:hover': { 
                      backgroundColor: getRowHoverColor(index),
                      transition: 'background-color 0.2s ease'
                    },
                    '& .MuiTableCell-root': {
                      borderBottom: '1px solid',
                      borderBottomColor: theme.palette.divider,
                      py: 1.5,
                      color: theme.palette.text.primary // Asegura texto oscuro
                    }
                  }}
                >
                  <TableCell>{activity.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                      {activity.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={statusLabels[activity.estado]} 
                      color={getStatusColor(activity.estado) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatNullableValue(activity.responsable)}
                      variant="outlined"
                      size="small"
                      sx={{ color: 'text.primary' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>{formatNullableValue(activity.zona?.zona)}</TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>{formatNullableValue(activity.zona?.subzona)}</TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>{formatNullableValue(activity.zona?.tienda)}</TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>{formatNullableValue(activity.zona?.empresa)}</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {activity.created_at ? formatDate(activity.created_at) : '—'}
                    </Typography>
                  </TableCell>
                  {!isGuest && (
                    <TableCell>
                      <Tooltip title="Editar actividad">
                        <IconButton
                          onClick={() => {
                            setCurrentActivity(activity);
                            setEditDialogOpen(true);
                          }}
                          size="small"
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {user.rol === 'admin' && (
                        <Tooltip title="Eliminar actividad">
                          <IconButton 
                            onClick={() => handleDeleteClick(activity.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!isGuest && (
        <>
          <AddActivityDialog
            open={addDialogOpen}
            onClose={() => setAddDialogOpen(false)}
            onActivityAdded={loadData}
            zonas={zonas}
          />

          {currentActivity && (
            <EditActivityDialog
              open={editDialogOpen}
              onClose={() => setEditDialogOpen(false)}
              onActivityUpdated={loadData}
              activity={currentActivity}
              zonas={zonas}
            />
          )}

          <ConfirmDialog
            open={confirmDialogOpen}
            title="Confirmar eliminación"
            message="¿Estás seguro que deseas eliminar esta actividad?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </>
      )}
    </>
  );
};
