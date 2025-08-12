import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { createActivity } from './../services/api';
import { Status, statusLabels, responsables } from './../types/activity';

interface AddActivityDialogProps {
  open: boolean;
  onClose: () => void;
  onActivityAdded: () => void;
}

export const AddActivityDialog: React.FC<AddActivityDialogProps> = ({
  open,
  onClose,
  onActivityAdded
}) => {
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState<Status>('pendiente');
  const [responsable, setResponsable] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('El nombre de la actividad es requerido');
      return;
    }

    if (!responsable) {
      setError('Por favor seleccione un responsable');
      return;
    }

    try {
      await createActivity({ 
        nombre: nombre.trim(), 
        estado, 
        responsable: responsable === '—' ? '' : responsable 
      });
      onActivityAdded();
      onClose();
    } catch (err) {
      setError('Error al crear la actividad');
      console.error('Error al crear la actividad:', err);
    }
  };

  const handleClose = () => {
    setNombre('');
    setEstado('pendiente');
    setResponsable('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Añadir Nueva Actividad</DialogTitle>
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
          error={!!error && !nombre.trim()}
          required
        />

        <Select
          margin="dense"
          label="Estado"
          fullWidth
          value={estado}
          onChange={(e) => setEstado(e.target.value as Status)}
          sx={{ mt: 2 }}
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
          displayEmpty
          renderValue={responsable === "" ? () => "Seleccione una persona" : undefined}
        >
          {responsables.map((persona) => (
            <MenuItem 
              key={persona.value} 
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
        <Button onClick={handleClose}>Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          color="primary"
          disabled={!nombre.trim() || !responsable}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};