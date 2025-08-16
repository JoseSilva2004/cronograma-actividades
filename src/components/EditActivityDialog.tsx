import React, { useState, useEffect } from 'react';
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
import { Zona, updateActivity } from '../services/api';

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
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState<Status>('pendiente');
  const [responsable, setResponsable] = useState('');
  const [errors, setErrors] = useState({
    nombre: false,
    responsable: false,
    zona: false,
    subzona: false,
    tienda: false,
    empresa: false,
    form: ''
  });

  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>('');
  const [subzonaSeleccionada, setSubzonaSeleccionada] = useState<string>('');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<string>('');
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string>('');

  const [zonasUnicas, setZonasUnicas] = useState<string[]>([]);
  const [subzonasFiltradas, setSubzonasFiltradas] = useState<string[]>([]);
  const [tiendasFiltradas, setTiendasFiltradas] = useState<string[]>([]);
  const [empresasFiltradas, setEmpresasFiltradas] = useState<string[]>([]);

  // Cargar datos iniciales cada vez que cambian open, activity o zonas
  useEffect(() => {
    if (!open || zonas.length === 0) return;

    const zonaCompleta = activity.zona_id
      ? zonas.find(z => z.id === activity.zona_id)
      : null;

    setNombre(activity.nombre);
    setEstado(activity.estado);
    setResponsable(activity.responsable || '');

    if (zonaCompleta) {
      setZonaSeleccionada(zonaCompleta.zona || '');
      setSubzonaSeleccionada(zonaCompleta.subzona || '');
      setTiendaSeleccionada(zonaCompleta.tienda || '');
      setEmpresaSeleccionada(zonaCompleta.empresa || '');

      const subzonas = Array.from(new Set(
        zonas
          .filter(z => z.zona === zonaCompleta.zona)
          .map(z => z.subzona || '')
          .filter(Boolean)
      ));
      setSubzonasFiltradas(subzonas);

      const tiendas = Array.from(new Set(
        zonas
          .filter(z => z.zona === zonaCompleta.zona && z.subzona === zonaCompleta.subzona)
          .map(z => z.tienda || '')
          .filter(Boolean)
      ));
      setTiendasFiltradas(tiendas);

      const empresas = Array.from(new Set(
        zonas
          .filter(z =>
            z.zona === zonaCompleta.zona &&
            z.subzona === zonaCompleta.subzona &&
            z.tienda === zonaCompleta.tienda
          )
          .map(z => z.empresa || '')
          .filter(Boolean)
      ));
      setEmpresasFiltradas(empresas);
    } else {
      setZonaSeleccionada('');
      setSubzonaSeleccionada('');
      setTiendaSeleccionada('');
      setEmpresaSeleccionada('');
    }
  }, [open, activity, zonas]);

  // Zonas únicas
  useEffect(() => {
    if (zonas.length > 0) {
      const zUnicas = Array.from(new Set(zonas.map(z => z.zona)));
      setZonasUnicas(zUnicas);
    }
  }, [zonas]);

  // Actualizar subzonas cuando cambia la zona seleccionada
  useEffect(() => {
    if (zonaSeleccionada) {
      const subzonas = Array.from(new Set(
        zonas
          .filter(z => z.zona === zonaSeleccionada)
          .map(z => z.subzona || '')
          .filter(Boolean)
      ));
      setSubzonasFiltradas(subzonas);

      if (!subzonas.includes(subzonaSeleccionada)) {
        setSubzonaSeleccionada('');
      }
    } else {
      setSubzonasFiltradas([]);
      setSubzonaSeleccionada('');
    }
  }, [zonaSeleccionada, zonas, subzonaSeleccionada]);

  // Actualizar tiendas cuando cambia subzona
  useEffect(() => {
    if (zonaSeleccionada && subzonaSeleccionada) {
      const tiendas = Array.from(new Set(
        zonas
          .filter(z => z.zona === zonaSeleccionada && z.subzona === subzonaSeleccionada)
          .map(z => z.tienda || '')
          .filter(Boolean)
      ));
      setTiendasFiltradas(tiendas);

      if (!tiendas.includes(tiendaSeleccionada)) {
        setTiendaSeleccionada('');
      }
    } else {
      setTiendasFiltradas([]);
      setTiendaSeleccionada('');
    }
  }, [subzonaSeleccionada, zonaSeleccionada, zonas, tiendaSeleccionada]);

  // Actualizar empresas cuando cambia tienda
  useEffect(() => {
    if (zonaSeleccionada && subzonaSeleccionada && tiendaSeleccionada) {
      const empresas = Array.from(new Set(
        zonas
          .filter(z =>
            z.zona === zonaSeleccionada &&
            z.subzona === subzonaSeleccionada &&
            z.tienda === tiendaSeleccionada
          )
          .map(z => z.empresa || '')
          .filter(Boolean)
      ));
      setEmpresasFiltradas(empresas);

      if (!empresas.includes(empresaSeleccionada)) {
        setEmpresaSeleccionada('');
      }
    } else {
      setEmpresasFiltradas([]);
      setEmpresaSeleccionada('');
    }
  }, [tiendaSeleccionada, zonaSeleccionada, subzonaSeleccionada, zonas, empresaSeleccionada]);

  const handleSubmit = async () => {
    const validationErrors = {
      nombre: !nombre.trim(),
      responsable: !responsable,
      zona: !zonaSeleccionada,
      subzona: subzonasFiltradas.length > 0 ? !subzonaSeleccionada : false,
      tienda: tiendasFiltradas.length > 0 ? !tiendaSeleccionada : false,
      empresa: empresasFiltradas.length > 0 ? !empresaSeleccionada : false
    };

    setErrors({ ...validationErrors, form: '' });
    if (Object.values(validationErrors).some(Boolean)) return;

    try {
      const zonaCompleta = zonas.find(z =>
        z.zona === zonaSeleccionada &&
        (subzonasFiltradas.length === 0 || z.subzona === subzonaSeleccionada) &&
        (tiendasFiltradas.length === 0 || z.tienda === tiendaSeleccionada) &&
        (empresasFiltradas.length === 0 || z.empresa === empresaSeleccionada)
      );

      if (!zonaCompleta) {
        setErrors(prev => ({
          ...prev,
          form: 'No se encontró la ubicación seleccionada. Verifica Zona/Subzona/Tienda/Empresa.'
        }));
        return;
      }

      await updateActivity(activity.id, {
        nombre: nombre.trim(),
        estado,
        responsable: responsable === '—' ? '' : responsable,
        zona_id: zonaCompleta.id
      });

      await onActivityUpdated();
      onClose();
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        form: err instanceof Error ? err.message : 'Error al actualizar la actividad'
      }));
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
            setErrors(prev => ({ ...prev, nombre: false, form: '' }));
          }}
          error={errors.nombre}
          helperText={errors.nombre ? 'Este campo es obligatorio' : ''}
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
              setErrors(prev => ({ ...prev, responsable: false, form: '' }));
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
            value={zonaSeleccionada}
            onChange={(e) => setZonaSeleccionada(e.target.value as string)}
            required
          >
            <MenuItem value="" disabled>Seleccione una zona</MenuItem>
            {zonasUnicas.map((zona) => (
              <MenuItem key={zona} value={zona}>
                {zona}
              </MenuItem>
            ))}
          </Select>
          {errors.zona && <FormHelperText>Seleccione una zona</FormHelperText>}
        </FormControl>

        {zonaSeleccionada && subzonasFiltradas.length > 0 && (
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }} error={errors.subzona}>
            <InputLabel id="subzona-label">Subzona *</InputLabel>
            <Select
              labelId="subzona-label"
              label="Subzona *"
              value={subzonaSeleccionada}
              onChange={(e) => setSubzonaSeleccionada(e.target.value as string)}
              required={subzonasFiltradas.length > 0}
            >
              <MenuItem value="" disabled>Seleccione una subzona</MenuItem>
              {subzonasFiltradas.map((subzona) => (
                <MenuItem key={subzona} value={subzona}>
                  {subzona}
                </MenuItem>
              ))}
            </Select>
            {errors.subzona && <FormHelperText>Seleccione una subzona</FormHelperText>}
          </FormControl>
        )}

        {subzonaSeleccionada && tiendasFiltradas.length > 0 && (
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }} error={errors.tienda}>
            <InputLabel id="tienda-label">Tienda *</InputLabel>
            <Select
              labelId="tienda-label"
              label="Tienda *"
              value={tiendaSeleccionada}
              onChange={(e) => setTiendaSeleccionada(e.target.value as string)}
              required={tiendasFiltradas.length > 0}
            >
              <MenuItem value="" disabled>Seleccione una tienda</MenuItem>
              {tiendasFiltradas.map((tienda) => (
                <MenuItem key={tienda} value={tienda}>
                  {tienda}
                </MenuItem>
              ))}
            </Select>
            {errors.tienda && <FormHelperText>Seleccione una tienda</FormHelperText>}
          </FormControl>
        )}

        {tiendaSeleccionada && empresasFiltradas.length > 0 && (
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }} error={errors.empresa}>
            <InputLabel id="empresa-label">Empresa *</InputLabel>
            <Select
              labelId="empresa-label"
              label="Empresa *"
              value={empresaSeleccionada}
              onChange={(e) => setEmpresaSeleccionada(e.target.value as string)}
              required={empresasFiltradas.length > 0}
            >
              <MenuItem value="" disabled>Seleccione una empresa</MenuItem>
              {empresasFiltradas.map((empresa) => (
                <MenuItem key={empresa} value={empresa}>
                  {empresa}
                </MenuItem>
              ))}
            </Select>
            {errors.empresa && <FormHelperText>Seleccione una empresa</FormHelperText>}
          </FormControl>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={
            !nombre.trim() ||
            !responsable ||
            !zonaSeleccionada ||
            (subzonasFiltradas.length > 0 && !subzonaSeleccionada) ||
            (tiendasFiltradas.length > 0 && !tiendaSeleccionada) ||
            (empresasFiltradas.length > 0 && !empresaSeleccionada)
          }
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
