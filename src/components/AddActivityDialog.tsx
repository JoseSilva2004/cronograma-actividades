import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { createActivity } from './../services/api';
import { Status, statusLabels, responsables } from './../types/activity';
import { Zona } from './../services/api';

interface AddActivityDialogProps {
  open: boolean;
  onClose: () => void;
  onActivityAdded: () => void;
  zonas: Zona[];
}

export const AddActivityDialog: React.FC<AddActivityDialogProps> = ({
  open,
  onClose,
  onActivityAdded,
  zonas 
}) => {
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState<Status>('pendiente');
  const [responsable, setResponsable] = useState('');
  const [errors, setErrors] = useState({
    nombre: false,
    responsable: false,
    zona: false,
    form: ''
  });

  // Estados para los filtros
  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>('');
  const [subzonaSeleccionada, setSubzonaSeleccionada] = useState<string>('');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<string>('');
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string>('');

  // Opciones filtradas
  const [zonasUnicas, setZonasUnicas] = useState<string[]>([]);
  const [subzonasFiltradas, setSubzonasFiltradas] = useState<string[]>([]);
  const [tiendasFiltradas, setTiendasFiltradas] = useState<string[]>([]);
  const [empresasFiltradas, setEmpresasFiltradas] = useState<string[]>([]);

  // Efecto para cargar las opciones únicas al inicio
  useEffect(() => {
  if (zonas.length > 0) {
    // Obtener zonas únicas usando Array.from
    const zonasUnicas = Array.from(new Set(zonas.map(z => z.zona)));
    setZonasUnicas(zonasUnicas);
  }
}, [zonas]);

useEffect(() => {
  if (zonaSeleccionada) {
    const subzonas = zonas
      .filter(z => z.zona === zonaSeleccionada)
      .map(z => z.subzona);
    setSubzonasFiltradas(Array.from(new Set(subzonas)));
    setSubzonaSeleccionada('');
    setTiendaSeleccionada('');
    setEmpresaSeleccionada('');
  }
}, [zonaSeleccionada, zonas]);

useEffect(() => {
  if (zonaSeleccionada && subzonaSeleccionada) {
    const tiendas = zonas
      .filter(z => z.zona === zonaSeleccionada && z.subzona === subzonaSeleccionada)
      .map(z => z.tienda);
    setTiendasFiltradas(Array.from(new Set(tiendas)));
    setTiendaSeleccionada('');
    setEmpresaSeleccionada('');
  }
}, [subzonaSeleccionada, zonaSeleccionada, zonas]);

useEffect(() => {
  if (zonaSeleccionada && subzonaSeleccionada && tiendaSeleccionada) {
    const empresas = zonas
      .filter(z => 
        z.zona === zonaSeleccionada && 
        z.subzona === subzonaSeleccionada && 
        z.tienda === tiendaSeleccionada
      )
      .map(z => z.empresa);
    setEmpresasFiltradas(Array.from(new Set(empresas)));
    setEmpresaSeleccionada('');
  }
}, [tiendaSeleccionada, subzonaSeleccionada, zonaSeleccionada, zonas]);

  const handleSubmit = async () => {
    // Validación de campos
    const validationErrors = {
      nombre: !nombre.trim(),
      responsable: !responsable,
      zona: !zonaSeleccionada || !empresaSeleccionada
    };

    setErrors({
      ...validationErrors,
      form: ''
    });

    if (Object.values(validationErrors).some(error => error)) {
      return;
    }

    try {
      // Encontrar el ID de la zona seleccionada
      const zonaCompleta = zonas.find(z => 
        z.zona === zonaSeleccionada &&
        z.subzona === subzonaSeleccionada &&
        z.tienda === tiendaSeleccionada &&
        z.empresa === empresaSeleccionada
      );

      if (!zonaCompleta) {
        throw new Error('No se encontró la ubicación seleccionada');
      }

      await createActivity({ 
        nombre: nombre.trim(), 
        estado, 
        responsable: responsable === '—' ? '' : responsable,
        zona_id: zonaCompleta.id
      });
      onActivityAdded();
      onClose();
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        form: 'Error al crear la actividad'
      }));
      console.error('Error al crear la actividad:', err);
    }
  };

  const handleClose = () => {
    setNombre('');
    setEstado('pendiente');
    setResponsable('');
    setZonaSeleccionada('');
    setSubzonaSeleccionada('');
    setTiendaSeleccionada('');
    setEmpresaSeleccionada('');
    setErrors({
      nombre: false,
      responsable: false,
      zona: false,
      form: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Añadir Nueva Actividad</DialogTitle>
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
            setErrors(prev => ({...prev, nombre: false, form: ''}));
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
              setErrors(prev => ({...prev, responsable: false, form: ''}));
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

        {/* Selector de Zona */}
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
        </FormControl>

        {/* Selector de Subzona (solo visible si hay zona seleccionada) */}
        {zonaSeleccionada && (
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
            <InputLabel id="subzona-label">Subzona</InputLabel>
            <Select
              labelId="subzona-label"
              label="Subzona"
              value={subzonaSeleccionada}
              onChange={(e) => setSubzonaSeleccionada(e.target.value as string)}
            >
              <MenuItem value="" disabled>Seleccione una subzona</MenuItem>
              {subzonasFiltradas.map((subzona) => (
                <MenuItem key={subzona} value={subzona}>
                  {subzona}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Selector de Tienda (solo visible si hay subzona seleccionada) */}
        {subzonaSeleccionada && (
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
            <InputLabel id="tienda-label">Tienda</InputLabel>
            <Select
              labelId="tienda-label"
              label="Tienda"
              value={tiendaSeleccionada}
              onChange={(e) => setTiendaSeleccionada(e.target.value as string)}
            >
              <MenuItem value="" disabled>Seleccione una tienda</MenuItem>
              {tiendasFiltradas.map((tienda) => (
                <MenuItem key={tienda} value={tienda}>
                  {tienda}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Selector de Empresa (solo visible si hay tienda seleccionada) */}
        {tiendaSeleccionada && (
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }} error={errors.zona}>
            <InputLabel id="empresa-label">Empresa *</InputLabel>
            <Select
              labelId="empresa-label"
              label="Empresa *"
              value={empresaSeleccionada}
              onChange={(e) => setEmpresaSeleccionada(e.target.value as string)}
              required
            >
              <MenuItem value="" disabled>Seleccione una empresa</MenuItem>
              {empresasFiltradas.map((empresa) => (
                <MenuItem key={empresa} value={empresa}>
                  {empresa}
                </MenuItem>
              ))}
            </Select>
            {errors.zona && <FormHelperText>Seleccione una empresa</FormHelperText>}
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
            !empresaSeleccionada
          }
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};