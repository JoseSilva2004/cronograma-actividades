// src/components/Dashboard/Dashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { fetchActivities, fetchZonas, Activity, Zona } from '../../services/api';
import { statusLabels, Status } from '../../types/activity';
import { formatNullableValue } from '../../utils/helpers';

// Colores para los gráficos
const STATUS_COLORS = {
  pendiente: '#ff9800',
  en_progreso: '#2196f3',
  programado: '#9c27b0',
  en_ejecucion: '#00bcd4',
  completado: '#4caf50'
};

//Colores para el fondo de las tarjetas
const STATUS_BACKGROUND_COLORS = {
  pendiente: '#e9c58eff',
  en_progreso: '#99c9f1ff',
  programado: '#e7a1f3ff',
  en_ejecucion: '#8decf8ff',
  completado: '#9df1a0ff'
};

export const Dashboard = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    zona: 'todas',
    responsable: 'todos',
    estado: 'todos'
  });

  const theme = useTheme();

  // Mover applyFilters a useCallback para evitar dependencias infinitas
  const applyFilters = useCallback(() => {
    let filtered = [...activities];
    
    if (filters.zona !== 'todas') {
      filtered = filtered.filter(activity => {
        // Verificar si la actividad tiene zona_id y buscar la zona correspondiente
        if (activity.zona_id) {
          const zonaEncontrada = zonas.find(z => z.id === activity.zona_id);
          return zonaEncontrada?.zona === filters.zona;
        }
        return false;
      });
    }
    
    if (filters.responsable !== 'todos') {
      filtered = filtered.filter(activity => 
        activity.responsable === filters.responsable
      );
    }
    
    if (filters.estado !== 'todos') {
      filtered = filtered.filter(activity => 
        activity.estado === filters.estado
      );
    }
    
    setFilteredActivities(filtered);
  }, [activities, filters.zona, filters.responsable, filters.estado, zonas]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadData = async () => {
    try {
      const [activitiesData, zonasData] = await Promise.all([
        fetchActivities(),
        fetchZonas(),
      ]);
      
      setActivities(activitiesData);
      setZonas(zonasData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para gráficos
  const statusData = Object.entries(
    filteredActivities.reduce((acc, activity) => {
      acc[activity.estado] = (acc[activity.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([estado, count]) => ({
    name: statusLabels[estado as Status],
    value: count,
    estado
  }));

  const zonaData = Object.entries(
    filteredActivities.reduce((acc, activity) => {
      // Buscar el nombre de la zona basado en zona_id
      let zonaName = 'Sin zona';
      if (activity.zona_id) {
        const zonaEncontrada = zonas.find(z => z.id === activity.zona_id);
        zonaName = zonaEncontrada?.zona || 'Sin zona';
      }
      acc[zonaName] = (acc[zonaName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([zona, count]) => ({ name: zona, actividades: count }));

  const responsablesUnicos = Array.from(
    new Set(filteredActivities.map(a => a.responsable).filter(Boolean))
  );

  // Obtener zonas únicas para el filtro
  const zonasUnicas = Array.from(new Set(zonas.map(z => z.zona).filter(Boolean)));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        📊 Dashboard de Actividades
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Zona</InputLabel>
            <Select
              value={filters.zona}
              label="Zona"
              onChange={(e) => setFilters(prev => ({...prev, zona: e.target.value}))}
            >
              <MenuItem value="todas">Todas las zonas</MenuItem>
              {zonasUnicas.map(zona => (
                <MenuItem key={zona} value={zona}>{zona}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Responsable</InputLabel>
            <Select
              value={filters.responsable}
              label="Responsable"
              onChange={(e) => setFilters(prev => ({...prev, responsable: e.target.value}))}
            >
              <MenuItem value="todos">Todos los responsables</MenuItem>
              {responsablesUnicos.map(responsable => (
                <MenuItem key={responsable} value={responsable}>
                  {formatNullableValue(responsable)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filters.estado}
              label="Estado"
              onChange={(e) => setFilters(prev => ({...prev, estado: e.target.value}))}
            >
              <MenuItem value="todos">Todos los estados</MenuItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tarjetas de resumen */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        flexWrap: 'wrap',
        gap: 3, 
        mb: 3,
        justifyContent: 'center'
      }}>
        {/* Tarjeta Total */}
        <Card sx={{ minWidth: 150, flex: '1 1 150px', maxWidth: 200, backgroundColor: '#fff59fff' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography color="textSecondary" gutterBottom>
              Total
            </Typography>
            <Typography variant="h4" component="div">
              {filteredActivities.length}
            </Typography>
            <Typography variant="body2">
              actividades
            </Typography>
          </CardContent>
        </Card>
        
        {/* Tarjetas por estado */}
        {Object.entries(statusLabels).map(([key, label]) => {
          const count = filteredActivities.filter(a => a.estado === key).length;
          const percentage = filteredActivities.length > 0 
            ? ((count / filteredActivities.length) * 100).toFixed(1) 
            : '0';
            
          return (
            <Card key={key} sx={{ minWidth: 150, flex: '1 1 150px', maxWidth: 200, backgroundColor: STATUS_BACKGROUND_COLORS[key as Status] }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Chip 
                  label={label} 
                  size="small" 
                  sx={{ 
                    backgroundColor: STATUS_COLORS[key as Status],
                    color: 'white',
                    mb: 1
                  }}
                />
                <Typography variant="h4" component="div">
                  {count}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {percentage}%
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Gráficos */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        mb: 3
      }}>
        {/* Gráfico circular */}
        <Paper sx={{ p: 2, height: 300, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Distribución por Estado
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.estado as Status]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Gráfico de barras */}
        <Paper sx={{ p: 2, height: 300, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Actividades por Zona
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={zonaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="actividades" fill={theme.palette.primary.main} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Actividades recientes */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Actividades Recientes
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filteredActivities.slice(0, 5).map((activity) => {
            // Buscar información completa de la zona
            const zonaCompleta = activity.zona_id ? zonas.find(z => z.id === activity.zona_id) : null;
            
            return (
              <Box 
                key={activity.id}
                sx={{ 
                  p: 1, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {activity.nombre}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {zonaCompleta?.zona && `Zona: ${zonaCompleta.zona}`}
                    {activity.responsable && ` • Responsable: ${formatNullableValue(activity.responsable)}`}
                  </Typography>
                </Box>
                <Chip 
                  label={statusLabels[activity.estado as Status]} 
                  size="small"
                  sx={{ 
                    backgroundColor: STATUS_COLORS[activity.estado as Status],
                    color: 'white'
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
};