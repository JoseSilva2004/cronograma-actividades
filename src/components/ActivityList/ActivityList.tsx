// ActivityList.tsx
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
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AddActivityDialog } from '../AddActivityDialog';
import { EditActivityDialog } from '../EditActivityDialog';
import { ConfirmDialog } from '../ConfirmDialog';
import { fetchActivities, deleteActivity, fetchZonas, Zona } from '../../services/api';
import { Activity, statusLabels } from './../../types/activity';
import { getCurrentUser } from '../../services/api';

export const ActivityList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);

  const user = getCurrentUser();
  const isGuest = user.rol === 'guest';

  const loadData = async () => {
    try {
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

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }} textAlign={'center'}>
          Lista de Actividades
        </Typography>
        {!isGuest && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setAddDialogOpen(true)}
          >
            Añadir Actividad
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }}>#</TableCell>
              <TableCell sx={{ minWidth: 180 }}>Actividad</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Estado</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Responsable</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Zona</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Sub-zona</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Tienda</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Razón Social</TableCell>
              <TableCell sx={{ minWidth: 180 }}>Asignado</TableCell>
              {!isGuest && <TableCell sx={{ width: 120 }}>Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{activity.id}</TableCell>
                <TableCell>{activity.nombre}</TableCell>
                <TableCell>{statusLabels[activity.estado]}</TableCell>
                <TableCell>{activity.responsable || '—'}</TableCell>
                <TableCell>{activity.zona?.zona || '—'}</TableCell>
                <TableCell>{activity.zona?.subzona || '—'}</TableCell>
                <TableCell>{activity.zona?.tienda || '—'}</TableCell>
                <TableCell>{activity.zona?.empresa || '—'}</TableCell>
                <TableCell>
                  {activity.created_at ? formatDate(activity.created_at) : '—'}
                </TableCell>
                {!isGuest && (
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setCurrentActivity(activity);
                        setEditDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    {user.rol === 'admin' && (
                      <IconButton onClick={() => handleDeleteClick(activity.id)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
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