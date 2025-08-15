// EditActivityDialog.tsx
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
  const [zonaOriginal, setZonaOriginal] = useState<string>('');

  const [zonasUnicas, setZonasUnicas] = useState<string[]>([]);
  const [subzonasFiltradas, setSubzonasFiltradas] = useState<string[]>([]);
  const [tiendasFiltradas, setTiendasFiltradas] = useState<string[]>([]);
  const [empresasFiltradas, setEmpresasFiltradas] = useState<string[]>([]);

  // Inicializar valores al abrir el diálogo
  useEffect(() => {
    if (!open) return;

    setNombre(activity.nombre);
    setEstado(activity.estado);
    setResponsable(activity.responsable || '');
    setErrors({
      nombre: false,
      responsable: false,
      zona: false,
      subzona: false,
      tienda: false,
      empresa: false,
      form: ''
    });

    if (activity.zona_id && zonas.length > 0) {
      const zonaCompleta = zonas.find(z => z.id === activity.zona_id);
      if (zonaCompleta) {
        setZonaOriginal(zonaCompleta.zona || '');
        setZonaSeleccionada(zonaCompleta.zona || '');
        setSubzonaSeleccionada(zonaCompleta.subzona || '');
        setTiendaSeleccionada(zonaCompleta.tienda || '');
        setEmpresaSeleccionada(zonaCompleta.empresa || '');
      } else {
        // Si no encontramos la zona por id, limpiar
        setZonaOriginal('');
        setZonaSeleccionada('');
        setSubzonaSeleccionada('');
        setTiendaSeleccionada('');
        setEmpresaSeleccionada('');
      }
    } else {
      setZonaOriginal('');
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
    } else {
      setZonasUnicas([]);
    }
  }, [zonas]);

  // Subzonas según zona
  useEffect(() => {
    if (zonaSeleccionada) {
      const subzonas = zonas
        .filter(z => z.zona === zonaSeleccionada)
        .map(z => z.subzona || '')
        .filter(Boolean);
      const únicas = Array.from(new Set(subzonas));
      setSubzonasFiltradas(únicas);

      // Si la subzona actual no pertenece a la nueva zona, limpiar descendientes
      if (subzonaSeleccionada && !únicas.includes(subzonaSeleccionada)) {
        setSubzonaSeleccionada('');
        setTiendaSeleccionada('');
        setEmpresaSeleccionada('');
        setEmpresasFiltradas([]);
        setTiendasFiltradas([]);
      }
    } else {
      setSubzonasFiltradas([]);
      if (subzonaSeleccionada) setSubzonaSeleccionada('');
      if (tiendaSeleccionada) setTiendaSeleccionada('');
      if (empresaSeleccionada) setEmpresaSeleccionada('');
      setTiendasFiltradas([]);
      setEmpresasFiltradas([]);
    }
    // incluir dependencias usadas dentro del efecto
  }, [zonaSeleccionada, zonas, subzonaSeleccionada, tiendaSeleccionada, empresaSeleccionada]);

  // Tiendas según zona + subzona
  useEffect(() => {
    if (zonaSeleccionada && subzonaSeleccionada) {
      const tiendas = zonas
        .filter(z => z.zona === zonaSeleccionada && z.subzona === subzonaSeleccionada)
        .map(z => z.tienda || '')
        .filter(Boolean);

      const únicas = Array.from(new Set(tiendas));
      setTiendasFiltradas(únicas);

      // Limpiar tienda/empresa solo si la tienda seleccionada YA no es válida
      if (tiendaSeleccionada && !únicas.includes(tiendaSeleccionada)) {
        setTiendaSeleccionada('');
        setEmpresaSeleccionada('');
        setEmpresasFiltradas([]);
      }
    } else {
      setTiendasFiltradas([]);
      if (tiendaSeleccionada) setTiendaSeleccionada('');
      if (empresaSeleccionada) setEmpresaSeleccionada('');
      setEmpresasFiltradas([]);
    }
  }, [zonaSeleccionada, subzonaSeleccionada, zonas, tiendaSeleccionada, empresaSeleccionada]);

  // Empresas según zona + subzona + tienda
  useEffect(() => {
    if (zonaSeleccionada && subzonaSeleccionada && tiendaSeleccionada) {
      const empresas = zonas
        .filter(
          z =>
            z.zona === zonaSeleccionada &&
            z.subzona === subzonaSeleccionada &&
            z.tienda === tiendaSeleccionada
        )
        .map(z => z.empresa || '')
        .filter(Boolean);
      const únicas = Array.from(new Set(empresas));
      setEmpresasFiltradas(únicas);

      if (empresaSeleccionada && !únicas.includes(empresaSeleccionada)) {
        setEmpresaSeleccionada('');
      }
    } else {
      setEmpresasFiltradas([]);
      if (empresaSeleccionada) setEmpresaSeleccionada('');
    }
  }, [zonaSeleccionada, subzonaSeleccionada, tiendaSeleccionada, zonas, empresaSeleccionada]);

  // FIX: actualizar empresa/otros datos si cambian los datos de `zonas`
  useEffect(() => {
    if (!tiendaSeleccionada) return;

    const tiendaData = zonas.find(
      z =>
        z.zona === zonaSeleccionada &&
        z.subzona === subzonaSeleccionada &&
        z.tienda === tiendaSeleccionada
    );

    if (tiendaData) {
      // solo setear si hay cambio real para evitar renders extra
      if (empresaSeleccionada !== (tiendaData.empresa || '')) {
        setEmpresaSeleccionada(tiendaData.empresa || '');
      }
    } else {
      // si la tienda ya no existe en las zonas actuales, limpiamos
      setTiendaSeleccionada('');
      setEmpresaSeleccionada('');
    }
  }, [tiendaSeleccionada, zonaSeleccionada, subzonaSeleccionada, zonas, empresaSeleccionada]);

  const handleSubmit = async () => {
    const validationErrors = {
      nombre: !nombre.trim(),
      responsable: !responsable,
      zona: !zonaSeleccionada,
      subzona: zonaSeleccionada !== zonaOriginal ? !subzonaSeleccionada : false,
      tienda: zonaSeleccionada !== zonaOriginal ? !tiendaSeleccionada : false,
      empresa: zonaSeleccionada !== zonaOriginal ? !empresaSeleccionada : false
    };

    setErrors({ ...validationErrors, form: '' });
    if (Object.values(validationErrors).some(Boolean)) return;

    try {
      // Determinar la zona a usar (si no cambió, usar la original por id; si cambió, buscar coincidencia exacta)
      let zonaCompleta: Zona | undefined;

      if (zonaSeleccionada === zonaOriginal) {
        zonaCompleta = zonas.find(z => z.id === activity.zona_id);
      } else {
        zonaCompleta = zonas.find(
          z =>
            z.zona === zonaSeleccionada &&
            z.subzona === subzonaSeleccionada &&
            z.tienda === tiendaSeleccionada &&
            z.empresa === empresaSeleccionada
        );
      }

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
        responsable: responsable === '—' ? '' : responsable, // siempre string
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

        {zonaSeleccionada && (
          <FormControl
            fullWidth
            margin="dense"
            sx={{ mt: 2 }}
            error={errors.subzona && zonaSeleccionada !== zonaOriginal}
          >
            <InputLabel id="subzona-label">Subzona {zonaSeleccionada !== zonaOriginal ? '*' : ''}</InputLabel>
            <Select
              labelId="subzona-label"
              label={`Subzona ${zonaSeleccionada !== zonaOriginal ? '*' : ''}`}
              value={subzonaSeleccionada}
              onChange={(e) => setSubzonaSeleccionada(e.target.value as string)}
              required={zonaSeleccionada !== zonaOriginal}
            >
              <MenuItem value="" disabled>Seleccione una subzona</MenuItem>
              {subzonasFiltradas.map((subzona) => (
                <MenuItem key={subzona} value={subzona}>
                  {subzona}
                </MenuItem>
              ))}
            </Select>
            {errors.subzona && zonaSeleccionada !== zonaOriginal && (
              <FormHelperText>Seleccione una subzona</FormHelperText>
            )}
          </FormControl>
        )}

        {subzonaSeleccionada && (
          <FormControl
            fullWidth
            margin="dense"
            sx={{ mt: 2 }}
            error={errors.tienda && zonaSeleccionada !== zonaOriginal}
          >
            <InputLabel id="tienda-label">Tienda {zonaSeleccionada !== zonaOriginal ? '*' : ''}</InputLabel>
            <Select
              labelId="tienda-label"
              label={`Tienda ${zonaSeleccionada !== zonaOriginal ? '*' : ''}`}
              value={tiendaSeleccionada}
              onChange={(e) => setTiendaSeleccionada(e.target.value as string)}
              required={zonaSeleccionada !== zonaOriginal}
            >
              <MenuItem value="" disabled>Seleccione una tienda</MenuItem>
              {tiendasFiltradas.map((tienda) => (
                <MenuItem key={tienda} value={tienda}>
                  {tienda}
                </MenuItem>
              ))}
            </Select>
            {errors.tienda && zonaSeleccionada !== zonaOriginal && (
              <FormHelperText>Seleccione una tienda</FormHelperText>
            )}
          </FormControl>
        )}

        {tiendaSeleccionada && (
          <FormControl
            fullWidth
            margin="dense"
            sx={{ mt: 2 }}
            error={errors.empresa && zonaSeleccionada !== zonaOriginal}
          >
            <InputLabel id="empresa-label">Empresa {zonaSeleccionada !== zonaOriginal ? '*' : ''}</InputLabel>
            <Select
              labelId="empresa-label"
              label={`Empresa ${zonaSeleccionada !== zonaOriginal ? '*' : ''}`}
              value={empresaSeleccionada}
              onChange={(e) => setEmpresaSeleccionada(e.target.value as string)}
              required={zonaSeleccionada !== zonaOriginal}
            >
              <MenuItem value="" disabled>Seleccione una empresa</MenuItem>
              {empresasFiltradas.map((empresa) => (
                <MenuItem key={empresa} value={empresa}>
                  {empresa}
                </MenuItem>
              ))}
            </Select>
            {errors.empresa && zonaSeleccionada !== zonaOriginal && (
              <FormHelperText>Seleccione una empresa</FormHelperText>
            )}
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
            (zonaSeleccionada !== zonaOriginal &&
              (!subzonaSeleccionada || !tiendaSeleccionada || !empresaSeleccionada))
          }
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
