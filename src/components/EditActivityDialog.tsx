import React, { useState, useEffect } from "react";
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
  FormHelperText,
} from "@mui/material";
import { Activity, Status, statusLabels, responsables } from "../types/activity";
import { Zona, updateActivity } from "../services/api";
import { isNullOrEmpty } from "../utils/helpers";

interface FormErrors {
  nombre: boolean;
  responsable: boolean;
  zona: boolean;
  form: string;
}

interface EditActivityDialogProps {
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
  zonas,
}) => {
  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState<Status>("pendiente");
  const [responsable, setResponsable] = useState("");
  const [errors, setErrors] = useState<FormErrors>({
    nombre: false,
    responsable: false,
    zona: false,
    form: "",
  });

  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>("");
  const [subzonaSeleccionada, setSubzonaSeleccionada] = useState<string>("");
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<string>("");
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string>("");

  const [zonasUnicas, setZonasUnicas] = useState<string[]>([]);
  const [subzonasFiltradas, setSubzonasFiltradas] = useState<string[]>([]);
  const [tiendasFiltradas, setTiendasFiltradas] = useState<string[]>([]);
  const [empresasFiltradas, setEmpresasFiltradas] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;

    setNombre(activity.nombre);
    setEstado(activity.estado);
    setResponsable(activity.responsable || "");
    setErrors({
      nombre: false,
      responsable: false,
      zona: false,
      form: "",
    });

    if (activity.zona_id && zonas.length > 0) {
      const zonaCompleta = zonas.find(z => z.id === activity.zona_id);
      if (zonaCompleta) {
        setZonaSeleccionada(zonaCompleta.zona || "");
        setSubzonaSeleccionada(isNullOrEmpty(zonaCompleta.subzona) ? "" : zonaCompleta.subzona || "");
        setTiendaSeleccionada(isNullOrEmpty(zonaCompleta.tienda) ? "" : zonaCompleta.tienda || "");
        setEmpresaSeleccionada(isNullOrEmpty(zonaCompleta.empresa) ? "" : zonaCompleta.empresa || "");
      }
    }
  }, [open, activity, zonas]);

  useEffect(() => {
    if (zonas.length > 0) {
      const zonasUnicas = Array.from(new Set(
        zonas
          .map(z => z.zona || "")
          .filter(zona => !isNullOrEmpty(zona))
      ));
      setZonasUnicas(zonasUnicas);
    }
  }, [zonas]);

  useEffect(() => {
    if (zonaSeleccionada) {
      const subzonas = zonas
        .filter(z => z.zona === zonaSeleccionada && !isNullOrEmpty(z.subzona))
        .map(z => z.subzona || "")
        .filter(subzona => !isNullOrEmpty(subzona));
      setSubzonasFiltradas(Array.from(new Set(subzonas)));
    }
  }, [zonaSeleccionada, zonas]);

  useEffect(() => {
    if (zonaSeleccionada && subzonaSeleccionada) {
      const tiendas = zonas
        .filter(z => z.zona === zonaSeleccionada && z.subzona === subzonaSeleccionada && !isNullOrEmpty(z.tienda))
        .map(z => z.tienda || "")
        .filter(tienda => !isNullOrEmpty(tienda));
      setTiendasFiltradas(Array.from(new Set(tiendas)));
    }
  }, [subzonaSeleccionada, zonaSeleccionada, zonas]);

  useEffect(() => {
    if (zonaSeleccionada && subzonaSeleccionada && tiendaSeleccionada) {
      const empresas = zonas
        .filter(z => 
          z.zona === zonaSeleccionada && 
          z.subzona === subzonaSeleccionada && 
          z.tienda === tiendaSeleccionada &&
          !isNullOrEmpty(z.empresa)
        )
        .map(z => z.empresa || "")
        .filter(empresa => !isNullOrEmpty(empresa));
      setEmpresasFiltradas(Array.from(new Set(empresas)));
    }
  }, [tiendaSeleccionada, subzonaSeleccionada, zonaSeleccionada, zonas]);

  const handleSubmit = async () => {
    const validationErrors = {
      nombre: !nombre.trim(),
      responsable: !responsable,
      zona: !zonaSeleccionada,
      form: ""
    };

    setErrors(validationErrors);
    if (validationErrors.nombre || validationErrors.responsable || validationErrors.zona) {
      return;
    }

    try {
      // Buscar la zona que coincida exactamente con los criterios
      const zonasCoincidentes = zonas.filter(z => 
        z.zona === zonaSeleccionada &&
        (isNullOrEmpty(subzonaSeleccionada) ? isNullOrEmpty(z.subzona) : z.subzona === subzonaSeleccionada) &&
        (isNullOrEmpty(tiendaSeleccionada) ? isNullOrEmpty(z.tienda) : z.tienda === tiendaSeleccionada) &&
        (isNullOrEmpty(empresaSeleccionada) ? isNullOrEmpty(z.empresa) : z.empresa === empresaSeleccionada)
      );

      if (zonasCoincidentes.length === 0) {
        throw new Error("No se encontró una zona válida con los criterios seleccionados");
      }

      // Si hay múltiples coincidencias, preferir la primera
      const zonaCompleta = zonasCoincidentes[0];

      await updateActivity(activity.id, {
        nombre: nombre.trim(),
        estado,
        responsable: responsable === "—" ? "" : responsable,
        zona_id: zonaCompleta.id
      });

      await onActivityUpdated();
      onClose();
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        form: err instanceof Error ? err.message : "Error al actualizar actividad"
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
          label="Descripción de la actividad *"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setErrors((prev) => ({ ...prev, nombre: false, form: "" }));
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

        <FormControl
          fullWidth
          margin="dense"
          sx={{ mt: 2 }}
          error={errors.responsable}
        >
          <InputLabel id="responsable-label">Responsable *</InputLabel>
          <Select
            labelId="responsable-label"
            label="Responsable *"
            value={responsable}
            onChange={(e) => {
              setResponsable(e.target.value as string);
              setErrors((prev) => ({ ...prev, responsable: false, form: "" }));
            }}
            required
          >
            {responsables.map((persona) => (
              <MenuItem
                key={persona.value}
                value={persona.value}
                disabled={persona.disabled}
                sx={{
                  fontStyle: persona.disabled ? "italic" : "normal",
                  color: persona.disabled ? "text.secondary" : "text.primary",
                }}
              >
                {persona.label}
              </MenuItem>
            ))}
          </Select>
          {errors.responsable && (
            <FormHelperText>Seleccione un responsable</FormHelperText>
          )}
        </FormControl>

        <FormControl
          fullWidth
          margin="dense"
          sx={{ mt: 2 }}
          error={errors.zona}
        >
          <InputLabel id="zona-label">Zona *</InputLabel>
          <Select
            labelId="zona-label"
            label="Zona *"
            value={zonaSeleccionada}
            onChange={(e) => {
              setZonaSeleccionada(e.target.value as string);
              setSubzonaSeleccionada("");
              setTiendaSeleccionada("");
              setEmpresaSeleccionada("");
              setErrors((prev) => ({ ...prev, zona: false, form: "" }));
            }}
            required
          >
            <MenuItem value="" disabled>
              Seleccione una zona
            </MenuItem>
            {zonasUnicas.map((zona) => (
              <MenuItem key={zona} value={zona}>
                {zona}
              </MenuItem>
            ))}
          </Select>
          {errors.zona && <FormHelperText>Seleccione una zona</FormHelperText>}
        </FormControl>

        {zonaSeleccionada && subzonasFiltradas.length > 0 && (
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
            <InputLabel id="subzona-label">Subzona (opcional)</InputLabel>
            <Select
              labelId="subzona-label"
              label="Subzona (opcional)"
              value={subzonaSeleccionada}
              onChange={(e) => {
                setSubzonaSeleccionada(e.target.value as string);
                setTiendaSeleccionada("");
                setEmpresaSeleccionada("");
              }}
            >
              <MenuItem value="">Ninguna</MenuItem>
              {subzonasFiltradas.map((subzona) => (
                <MenuItem key={subzona} value={subzona}>
                  {subzona}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {subzonaSeleccionada && tiendasFiltradas.length > 0 && (
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
            <InputLabel id="tienda-label">Tienda (opcional)</InputLabel>
            <Select
              labelId="tienda-label"
              label="Tienda (opcional)"
              value={tiendaSeleccionada}
              onChange={(e) => {
                setTiendaSeleccionada(e.target.value as string);
                setEmpresaSeleccionada("");
              }}
            >
              <MenuItem value="">Ninguna</MenuItem>
              {tiendasFiltradas.map((tienda) => (
                <MenuItem key={tienda} value={tienda}>
                  {tienda}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {tiendaSeleccionada && empresasFiltradas.length > 0 && (
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
            <InputLabel id="empresa-label">Empresa (opcional)</InputLabel>
            <Select
              labelId="empresa-label"
              label="Empresa (opcional)"
              value={empresaSeleccionada}
              onChange={(e) => setEmpresaSeleccionada(e.target.value as string)}
            >
              <MenuItem value="">Ninguna</MenuItem>
              {empresasFiltradas.map((empresa) => (
                <MenuItem key={empresa} value={empresa}>
                  {empresa}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={!nombre.trim() || !responsable || !zonaSeleccionada}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};