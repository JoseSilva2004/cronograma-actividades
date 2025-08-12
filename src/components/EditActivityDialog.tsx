import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  Button,
  Alert
} from '@mui/material';
import { updateActivity } from './../services/api';
import { Activity, Status, statusLabels, responsables } from './../types/activity';

interface EditActivityDialogProps {
  open: boolean;
  onClose: () => void;
  onActivityUpdated: () => void;
  activity: Activity;
}

export const EditActivityDialog: React.FC<EditActivityDialogProps> = ({
  open,
  onClose,
  onActivityUpdated,
  activity
}) => {
  const [nombre, setNombre] = useState(activity.nombre);
  const [estado, setEstado] = useState<Status>(activity.estado);
  const [responsable, setResponsable] = useState(activity.responsable || '');
  const [error, setError] = useState('');

  // Resetear estados cuando cambia la actividad o se abre/cierra el diálogo
  useEffect(() => {
    if (open) {
      setNombre(activity.nombre);
      setEstado(activity.estado);
      setResponsable(activity.responsable || '');
      setError('');
    }
  }, [open, activity]);

  const handleSubmit = async () => {
    // Validaciones
    if (!nombre.trim()) {
      setError('El nombre de la actividad es requerido');
      return;
    }

    if (!responsable) {
      setError('Por favor seleccione un responsable');
      return;
    }

    try {
      await updateActivity(activity.id, { 
        nombre: nombre.trim(), 
        estado, 
        responsable: responsable === '—' ? '' : responsable 
      });
      onActivityUpdated();
      onClose();
    } catch (err) {
      setError('Error al actualizar la actividad');
      console.error('Error al actualizar la actividad:', err);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Actividad</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          autoFocus
          margin="dense"
          label="Nombre de la actividad"
          fullWidth
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setError('');
          }}
          sx={{ mt: 2 }}
          error={!!error && !nombre.trim()}
          required
        />

        <Select
          margin="dense"
          label="Estado"
          fullWidth
          value={estado}
          onChange={(e) => setEstado(e.target.value as Status)}
          sx={{ mt: 2, mb: 2 }}
          required
        >
          {Object.entries(statusLabels).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>

        <Select
          margin="dense"
          label="Responsable"
          fullWidth
          value={responsable}
          onChange={(e) => {
            setResponsable(e.target.value as string);
            setError('');
          }}
          sx={{ mt: 2 }}
          error={!!error && !responsable}
          required
        >
          {responsables.map((persona) => (
            <MenuItem 
              key={persona.label} 
              value={persona.value}
              disabled={persona.disabled}
              sx={{ 
                fontStyle: persona.disabled ? 'italic' : 'normal',
                color: persona.disabled ? 'text.secondary' : 'text.primary'
              }}
            >
              {persona.label}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={!nombre.trim() || !responsable}
        >
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};