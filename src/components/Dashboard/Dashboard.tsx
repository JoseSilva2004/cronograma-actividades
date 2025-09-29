// src/components/Dashboard/Dashboard.tsx - PORCENTAJE NEGRO OSCURO
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
  useMediaQuery,
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
  programado: '#c229ddff',
  en_ejecucion: '#00bcd4',
  completado: '#4caf50'
};

// Colores para el fondo de las tarjetas
const STATUS_BACKGROUND_COLORS = {
  pendiente: '#fff3e0',
  en_progreso: '#e3f2fd',
  programado: '#f3e5f5',
  en_ejecucion: '#e0f7fa',
  completado: '#e8f5e8'
};

// Íconos para cada estado
const STATUS_ICONS = {
  pendiente: '📋',
  en_progreso: '⏳',
  programado: '📅',
  en_ejecucion: '🖥',
  completado: '✅'
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const applyFilters = useCallback(() => {
    let filtered = [...activities];
    
    if (filters.zona !== 'todas') {
      filtered = filtered.filter(activity => {
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
    estado,
    percentage: filteredActivities.length > 0 ? 
      ((count / filteredActivities.length) * 100).toFixed(1) : "0"
  }));

  // Función para renderizar etiquetas personalizadas con porcentaje - MEJORADA
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, name
  }: any) => {
    if (percent < 0.03) return null; // Ocultar porcentajes muy pequeños
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6; // Más cerca del centro
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#000000" // NEGRO OSCURO
        textAnchor="middle" // Centrado en lugar de start/end
        dominantBaseline="central"
        fontSize={isMobile ? 11 : 13} // Un poco más grande
        fontWeight="bold"
        style={{
          textShadow: '0 1px 2px rgba(255,255,255,0.8)', // Sombra blanca para contraste
          filter: 'drop-shadow(0 0 2px white)' // Efecto de glow blanco
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Función para acortar nombres largos de zonas
  const shortenZoneName = (name: string, maxLength: number = 15): string => {
    if (name === 'Puerto la Cruz') return name;
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

  const zonaData = Object.entries(
    filteredActivities.reduce((acc, activity) => {
      let zonaName = 'Sin zona';
      if (activity.zona_id) {
        const zonaEncontrada = zonas.find(z => z.id === activity.zona_id);
        zonaName = zonaEncontrada?.zona || 'Sin zona';
      }
      const shortName = shortenZoneName(zonaName, isMobile ? 8 : 12);
      acc[shortName] = (acc[shortName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([zona, count]) => ({ 
    name: zona, 
    actividades: count,
    fullName: zona
  }));

  const responsablesUnicos = Array.from(
    new Set(filteredActivities.map(a => a.responsable).filter(Boolean))
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, pb: 2 }}>
      {/* Filtros Responsive */}
      <Paper sx={{ 
        p: { xs: 2, sm: 3 }, 
        mb: 3,
        borderRadius: { xs: 2, sm: 3 }
      }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            fontSize: { xs: '1.3rem', sm: '1.5rem' },
            color: 'primary.main',
            mb: 3
          }}
        >
          📊 Panel de Control
        </Typography>
        
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '1rem', sm: '1.1rem' },
            mb: 2
          }}
        >
          Filtros
        </Typography>
        
        {/* Filtros con Flexbox */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          width: '100%'
        }}>
          <FormControl 
            fullWidth 
            size={isSmallMobile ? "small" : "medium"}
            sx={{ flex: 1 }}
          >
            <InputLabel sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Zona</InputLabel>
            <Select
              value={filters.zona}
              label="Zona"
              onChange={(e) => setFilters(prev => ({ ...prev, zona: e.target.value }))}
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              <MenuItem value="todas" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Todas las zonas
              </MenuItem>
              {Array.from(new Set(zonas.map(z => z.zona).filter(Boolean))).map(zona => (
                <MenuItem 
                  key={zona} 
                  value={zona}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  {zona}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl 
            fullWidth 
            size={isSmallMobile ? "small" : "medium"}
            sx={{ flex: 1 }}
          >
            <InputLabel sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Responsable</InputLabel>
            <Select
              value={filters.responsable}
              label="Responsable"
              onChange={(e) => setFilters(prev => ({ ...prev, responsable: e.target.value }))}
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              <MenuItem value="todos" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Todos los responsables
              </MenuItem>
              {responsablesUnicos.map(responsable => (
                <MenuItem 
                  key={responsable} 
                  value={responsable}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  {formatNullableValue(responsable)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl 
            fullWidth 
            size={isSmallMobile ? "small" : "medium"}
            sx={{ flex: 1 }}
          >
            <InputLabel sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Estado</InputLabel>
            <Select
              value={filters.estado}
              label="Estado"
              onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              <MenuItem value="todos" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Todos los estados
              </MenuItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <MenuItem 
                  key={key} 
                  value={key}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Resumen de estadísticas */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 'bold',
            color: 'text.primary'
          }}
        >
          Resumen General
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2 }}
        >
          {filteredActivities.length} actividades encontradas con los filtros aplicados
        </Typography>
      </Box>

      {/* Tarjetas de resumen */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        flexWrap: 'wrap',
        gap: 2,
        mb: 4,
        justifyContent: { xs: 'center', sm: 'space-between' },
        alignItems: 'stretch'
      }}>
        {/* Tarjeta Total */}
        <Card 
          sx={{ 
            textAlign: "center", 
            flex: { xs: '0 1 100%', sm: '1 1 180px', md: '1' },
            minWidth: { xs: '280px', sm: '180px', md: '200px' },
            maxWidth: { xs: '320px', sm: '220px', md: '240px' },
            backgroundColor: theme.palette.grey[100],
            transition: 'all 0.3s ease',
            mx: { xs: 'auto', sm: 0 },
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[4]
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2 } }}>
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                fontSize: { xs: '2.5rem', sm: '2.2rem', md: '2.5rem' },
                fontWeight: 'bold',
                color: 'primary.main',
                mb: 1
              }}
            >
              {filteredActivities.length}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: { xs: '1rem', sm: '0.9rem' },
                fontWeight: 'medium',
                color: 'black',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              📊 Total Actividades
            </Typography>
          </CardContent>
        </Card>
        
        {/* Tarjetas por estado */}
        {Object.entries(statusLabels).map(([key, label]) => {
          const count = filteredActivities.filter(a => a.estado === key).length;
          const percentage = filteredActivities.length > 0 ? 
            ((count / filteredActivities.length) * 100).toFixed(1) : "0";
          const icon = STATUS_ICONS[key as Status];

          return (
            <Card 
              key={key}
              sx={{ 
                textAlign: "center", 
                flex: { xs: '0 1 100%', sm: '1 1 180px', md: '1' },
                minWidth: { xs: '280px', sm: '180px', md: '200px' },
                maxWidth: { xs: '320px', sm: '220px', md: '240px' },
                backgroundColor: STATUS_BACKGROUND_COLORS[key as Status],
                transition: 'all 0.3s ease',
                mx: { xs: 'auto', sm: 0 },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardContent sx={{ 
                p: { xs: 2, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between'
              }}>
                {/* Etiqueta del estado CON ÍCONO Y FONDO OSCURO */}
                <Box sx={{ 
                  mb: 1.5,
                  minHeight: { xs: '50px', sm: '60px' },
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <Box 
                    sx={{ 
                      backgroundColor: STATUS_COLORS[key as Status],
                      padding: '6px 12px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      maxWidth: '90%'
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontSize: { xs: '1.2rem', sm: '1.1rem' },
                        lineHeight: 1
                      }}
                    >
                      {icon}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontSize: { 
                          xs: '0.8rem', 
                          sm: '0.75rem',
                          md: '0.8rem'
                        },
                        color: 'black',
                        textAlign: 'center',
                        lineHeight: 1.2,
                      }}
                    >
                      {label.replace(/[📋⏳📅🖥✅]/g, '').trim()}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Contenido numérico */}
                <Box>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    sx={{ 
                      fontSize: { xs: '2.2rem', sm: '2rem', md: '2.2rem' },
                      color: STATUS_COLORS[key as Status],
                      mb: 0.5,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    {count}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: { xs: '0.9rem', sm: '0.85rem' },
                      color: 'black',
                      backgroundColor: STATUS_COLORS[key as Status],
                      padding: '2px 8px',
                      borderRadius: '12px',
                      display: 'inline-block'
                    }}
                  >
                    {percentage}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Gráficos con Flexbox - PORCENTAJE NEGRO OSCURO */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 3,
        mb: 4
      }}>
        {/* Gráfico circular - CON PORCENTAJE NEGRO OSCURO */}
        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            height: { xs: 350, sm: 400 },
            borderRadius: { xs: 2, sm: 3 },
            flex: 1,
            minWidth: { xs: '100%', lg: '50%' },
            minHeight: '350px'
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2
            }}
          >
            📈 Distribución por Estado
          </Typography>
          <Box sx={{ height: { xs: 250, sm: 320 }, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 80 : 100}
                  innerRadius={isMobile ? 40 : 50}
                  fill="#8884d8"
                  dataKey="value"
                  label={renderCustomizedLabel} // PORCENTAJES NEGROS OSCUROS
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.estado as Status]}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} actividades (${props.payload.percentage}%)`, 
                    'Cantidad'
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend 
                  verticalAlign="bottom"
                  height={60}
                  iconSize={14}
                  wrapperStyle={{
                    fontSize: isMobile ? "11px" : "12px",
                    paddingTop: "10px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Gráfico de barras */}
        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            height: { xs: 350, sm: 400 },
            borderRadius: { xs: 2, sm: 3 },
            flex: 1,
            minWidth: { xs: '100%', lg: '50%' },
            minHeight: '350px'
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2
            }}
          >
            📊 Actividades por Zona
          </Typography>
          <Box sx={{ height: { xs: 250, sm: 320 }, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={zonaData}
                margin={{ 
                  top: 5, 
                  right: isMobile ? 10 : 20, 
                  left: isMobile ? 10 : 20, 
                  bottom: isMobile ? 50 : 60 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={isMobile ? -45 : -45}
                  textAnchor="end"
                  height={isMobile ? 70 : 80}
                  interval={0}
                  tick={{ fontSize: isMobile ? 10 : 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, "dataMax"]}
                  tickCount={6}
                  interval={0}
                  tick={{ fontSize: isMobile ? 10 : 11 }}
                />
                <Tooltip
                  formatter={(value) => [`${value} actividades`, "Cantidad"]}
                  labelFormatter={(label) => `Zona: ${label}`}
                />
                <Legend 
                  verticalAlign="bottom"
                  height={40}
                  iconSize={12}
                  wrapperStyle={{
                    fontSize: isMobile ? "11px" : "12px",
                  }}
                />
                <Bar
                  dataKey="actividades"
                  fill={theme.palette.primary.main}
                  name="Actividades"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>

      {/* Actividades recientes */}
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderRadius: { xs: 2, sm: 3 }
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 2
          }}
        >
          🔔 Actividades Recientes
        </Typography>
        
        {filteredActivities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No hay actividades que coincidan con los filtros aplicados
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredActivities.slice(0, isMobile ? 3 : 5).map((activity) => {
              const zonaCompleta = activity.zona_id
                ? zonas.find((z) => z.id === activity.zona_id)
                : null;

              return (
                <Box
                  key={activity.id}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 2 },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="body1" 
                      fontWeight="medium"
                      sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        mb: 0.5,
                        wordBreak: 'break-word'
                      }}
                    >
                      {activity.nombre}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="textSecondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
                    >
                      {zonaCompleta?.zona && `📍 ${zonaCompleta.zona}`}
                      {activity.responsable &&
                        ` • 👤 ${formatNullableValue(activity.responsable)}`}
                    </Typography>
                  </Box>
                  <Chip
                    label={statusLabels[activity.estado as Status]}
                    size="small"
                    sx={{
                      backgroundColor: STATUS_COLORS[activity.estado as Status],
                      color: "white",
                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                      minWidth: { xs: '80px', sm: '100px' }
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
        
        {filteredActivities.length > (isMobile ? 3 : 5) && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Mostrando {isMobile ? 3 : 5} de {filteredActivities.length} actividades
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};