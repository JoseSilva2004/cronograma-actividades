// src/components/ActivityReport/ActivityReport.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import { Activity } from '../../types/activity';
import { Zona } from '../../services/api';
import { statusLabels } from '../../types/activity';
import { formatNullableValue } from '../../utils/helpers';

interface ActivityReportProps {
  open: boolean;
  onClose: () => void;
  activity: Activity | null;
  zona: Zona | null;
}

export const ActivityReport: React.FC<ActivityReportProps> = ({
  open,
  onClose,
  activity,
  zona
}) => {
  if (!activity) return null;

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'success';
      case 'en_progreso': return 'warning';
      case 'en_ejecucion': return 'info';
      case 'programado': return 'secondary';
      default: return 'default';
    }
  };

  const generatePDF = () => {
    const printContent = document.getElementById('activity-report-content');
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    const printContents = printContent.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const downloadTextReport = () => {
    const reportContent = `
REPORTE DE ACTIVIDAD
====================

ID: ${activity.id}
Actividad: ${activity.nombre}
Estado: ${statusLabels[activity.estado] || activity.estado}
Responsable: ${formatNullableValue(activity.responsable)}
Fecha Creación: ${new Date(activity.created_at).toLocaleDateString('es-ES')}
Última Actualización: ${new Date(activity.updated_at).toLocaleDateString('es-ES')}

INFORMACIÓN DE ZONA
-------------------
Zona: ${formatNullableValue(zona?.zona)}
Subzona: ${formatNullableValue(zona?.subzona)}
Tienda: ${formatNullableValue(zona?.tienda)}
Empresa: ${formatNullableValue(zona?.empresa)}

Sistema de Gestión de Actividades - ${new Date().getFullYear()}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `actividad_${activity.id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      
      <DialogContent>
        <Box id="activity-report-content" sx={{ p: 1 }}>
          {/* Encabezado del reporte */}
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
              📋 Reporte de Actividad
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Sistema de Gestión de Actividades
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Generado el: {new Date().toLocaleDateString('es-ES')}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Información principal */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom color="primary">
              Información Principal
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">ID:</Typography>
                <Typography variant="body1">{activity.id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Estado:</Typography>
                <Chip 
                  label={statusLabels[activity.estado] || activity.estado} 
                  color={getStatusColor(activity.estado) as any}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Responsable:</Typography>
                <Typography variant="body1">{formatNullableValue(activity.responsable)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Creado:</Typography>
                <Typography variant="body1">
                  {new Date(activity.created_at).toLocaleDateString('es-ES')}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Descripción */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom color="primary">
              Descripción de la Actividad
            </Typography>
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Typography variant="body1">{activity.nombre}</Typography>
            </Box>
          </Box>

          {/* Información de zona */}
          {zona && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom color="primary">
                📍 Información de Ubicación
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Zona:</Typography>
                  <Typography variant="body1">{formatNullableValue(zona.zona)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Subzona:</Typography>
                  <Typography variant="body1">{formatNullableValue(zona.subzona)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Tienda:</Typography>
                  <Typography variant="body1">{formatNullableValue(zona.tienda)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Razón Social:</Typography>
                  <Typography variant="body1">{formatNullableValue(zona.empresa)}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Historial */}
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              📊 Historial
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Fecha Creación:</Typography>
                <Typography variant="body1">
                  {new Date(activity.created_at).toLocaleString('es-ES')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Última Actualización:</Typography>
                <Typography variant="body1">
                  {new Date(activity.updated_at).toLocaleString('es-ES')}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Pie de página */}
          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="textSecondary">
              Sistema de Gestión de Actividades • {new Date().getFullYear()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Reporte generado automáticamente
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={downloadTextReport} 
          startIcon={<DownloadIcon />}
          variant="outlined"
        >
          Descargar TXT
        </Button>
        <Button 
          onClick={generatePDF} 
          startIcon={<PictureAsPdfIcon />}
          variant="contained"
          color="primary"
        >
          Imprimir PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};