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
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AddActivityDialog } from './../AddActivityDialog';
import { EditActivityDialog } from './../EditActivityDialog';
import { ConfirmDialog } from './../ConfirmDialog';
import { fetchActivities, deleteActivity } from './../../services/api';
import { Activity, statusLabels } from '../../types/activity';

export const ActivityList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);

  const loadActivities = async () => {
    const data = await fetchActivities();
    setActivities(data);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleDeleteClick = (id: number) => {
    setActivityToDelete(id);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (activityToDelete) {
      await deleteActivity(activityToDelete);
      await loadActivities();
    }
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

    const handleCancelDelete = () => {
        setConfirmDialogOpen(false);
        setActivityToDelete(null);
    };

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setAddDialogOpen(true)}
        >
          Añadir Actividad
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Actividad</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Fecha Creación</TableCell> {/* Nueva columna */}
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{activity.id}</TableCell>
                <TableCell>{activity.nombre}</TableCell>
                <TableCell>{statusLabels[activity.estado]}</TableCell>
                <TableCell>{activity.responsable || '—'}</TableCell>
                <TableCell>
                  {activity.created_at ? formatDate(activity.created_at) : '—'}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setCurrentActivity(activity);
                      setEditDialogOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(activity.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogos (se mantienen igual) */}
      <AddActivityDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onActivityAdded={loadActivities}
      />

      {currentActivity && (
        <EditActivityDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onActivityUpdated={loadActivities}
          activity={currentActivity}
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
  );
};