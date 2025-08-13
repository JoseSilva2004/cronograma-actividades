import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { Activity, Status, statusLabels, responsables } from '../types/activity';
import { Zona } from '../services/api';
import { updateActivity } from '../services/api';

export interface EditActivityDialogProps {
  open: boolean;
  onClose: () => void;
  onActivityUpdated: () => Promise<void>;
  activity: Activity;
  zonas: Zona[];
}

export const EditActivityDialog: React.FC<EditActivityDialogProps> = ({
  open,
  onClose,
  onActivityUpdated,
  activity,
  zonas
}) => {
  const [nombre, setNombre] = useState(activity.nombre);
  const [estado, setEstado] = useState<Status>(activity.estado);
  const [responsable, setResponsable] = useState(activity.responsable);
  const [zonaId, setZonaId] = useState<number | ''>(activity.zona_id ?? '');
  const [errors, setErrors] = useState({
    nombre: false,
    responsable: false,
    zona: false,
    form: ''
  });

  const handleSubmit = async () => {
    // Validación de campos
    const validationErrors = {
      nombre: !nombre.trim(),
      responsable: !responsable,
      zona: zonaId === '',
      form: ''
    };

    setErrors(validationErrors);

    if (Object.values(validationErrors).some(error => error)) {
      return;
    }

    try {
      await updateActivity(activity.id, {
        nombre: nombre.trim(),
        estado,
        responsable: responsable === '—' ? '' : responsable,
        zona_id: zonaId as number // Ya validamos que no es ''
      });
      await onActivityUpdated();
      onClose();
    } catch (err) {
      setErrors(prev => ({...prev, form: 'Error al actualizar la actividad'}));
      console.error('Error al actualizar la actividad:', err);
    }
  };

  const handleClose = () => {
    setErrors({
      nombre: false,
      responsable: false,
      zona: false,
      form: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Editar Actividad</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {errors.form && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.form}
          </Alert>
        )}

        <TextField
          autoFocus
          margin="dense"
          label="Nombre de la actividad *"
          fullWidth
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setErrors(prev => ({...prev, nombre: false}));
          }}
          error={errors.nombre}
          helperText={errors.nombre ? "Este campo es obligatorio" : ""}
          required
        />

        <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
          <InputLabel id="estado-label">Estado *</InputLabel>
          <Select
            labelId="estado-label"
            label="Estado *"
            value={estado}
            onChange={(e) => setEstado(e.target.value as Status)}
            required
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense" sx={{ mt: 2 }} error={errors.responsable}>
          <InputLabel id="responsable-label">Responsable *</InputLabel>
          <Select
            labelId="responsable-label"
            label="Responsable *"
            value={responsable}
            onChange={(e) => {
              setResponsable(e.target.value as string);
              setErrors(prev => ({...prev, responsable: false}));
            }}
            required
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
          {errors.responsable && <FormHelperText>Seleccione un responsable</FormHelperText>}
        </FormControl>

        <FormControl fullWidth margin="dense" sx={{ mt: 2 }} error={errors.zona}>
          <InputLabel id="zona-label">Zona *</InputLabel>
          <Select
            labelId="zona-label"
            label="Zona *"
            value={zonaId}
            onChange={(e) => {
              setZonaId(e.target.value as number);
              setErrors(prev => ({...prev, zona: false}));
            }}
            required
          >
            {zonas.map((zona) => (
              <MenuItem key={zona.id} value={zona.id}>
                {zona.zona} - {zona.subzona} - {zona.tienda} - {zona.empresa}
              </MenuItem>
            ))}
          </Select>
          {errors.zona && <FormHelperText>Seleccione una zona</FormHelperText>}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          color="primary"
          disabled={!nombre.trim() || !responsable || zonaId === ''}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};