import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Button,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
  TextField,
  InputAdornment,
  Pagination,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { AddActivityDialog } from '../AddActivityDialog';
import { EditActivityDialog } from '../EditActivityDialog';
import { ConfirmDialog } from '../ConfirmDialog';
import { fetchActivities, deleteActivity, fetchZonas, Zona } from '../../services/api';
import { Activity, statusLabels } from './../../types/activity';
import { getCurrentUser } from '../../services/api';
import { formatNullableValue } from '../../utils/helpers';

export const ActivityList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 5;

  const user = getCurrentUser();
  const isGuest = user.rol === 'guest';

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [activitiesData, zonasData] = await Promise.all([
        fetchActivities(),
        fetchZonas()
      ]);
      setZonas(zonasData);
      
      const formattedActivities = activitiesData.map((activity) => ({
        ...activity,
        estado: activity.estado as Activity['estado'],
        zona: zonasData.find(z => z.id === activity.zona_id) || null,
      })) as Activity[];
      
      setActivities(formattedActivities);
      setFilteredActivities(formattedActivities);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrar actividades basado en el término de búsqueda
  useEffect(() => {
    const filtered = activities.filter(activity =>
      activity.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.zona?.zona?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.zona?.subzona?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.zona?.tienda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.zona?.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statusLabels[activity.estado].toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredActivities(filtered);
    setCurrentPage(1); // Resetear a la primera página al buscar
  }, [searchTerm, activities]);

  // Calcular actividades para la página actual
  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = filteredActivities.slice(indexOfFirstActivity, indexOfLastActivity);
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);

  const handleDeleteClick = (id: number) => {
    setActivityToDelete(id);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (activityToDelete) {
      try {
        await deleteActivity(activityToDelete);
        await loadData();
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
    setConfirmDialogOpen(false);
    setActivityToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setActivityToDelete(null);
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'success';
      case 'en_progreso': return 'warning';
      case 'en_ejecucion': return 'info';
      case 'programado': return 'secondary';
      default: return 'default';
    }
  };
// Función para el color de fondo de las filas
const getRowBackgroundColor = (index: number) => {
  const globalIndex = indexOfFirstActivity + index;
  return globalIndex % 2 === 0 
    ? '#ffffff' // Blanco para filas pares
    : '#e8ebeeff'; // Gris muy claro para filas impares
};

// Función para el color al hacer hover
const getRowHoverColor = (index: number) => {
  const globalIndex = indexOfFirstActivity + index;
  return globalIndex % 2 === 0 
    ? '#e3f2fd' // Azul claro al hover para filas pares
    : '#bbdefb'; // Azul un poco más oscuro al hover para filas impares
};
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          📋 Tabla de Actividades
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* Campo de búsqueda */}
          <TextField
            placeholder="Buscar actividades..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />

          <Tooltip title="Actualizar lista">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          {!isGuest && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setAddDialogOpen(true)}
              startIcon={<span>+</span>}
            >
              Nueva Actividad
            </Button>
          )}
        </Box>
      </Box>

      {/* Contador de resultados */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Mostrando {currentActivities.length} de {filteredActivities.length}{" "}
          actividades
          {searchTerm && ` para "${searchTerm}"`}
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#1976d2",
                backgroundImage:
                  "linear-gradient(45deg, #1565c0 0%, #1976d2 100%)",
              }}
            >
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  py: 2,
                  borderBottom: "none",
                  backgroundColor: "#1976d2",
                }}
              >
                #
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  minWidth: 200,
                  py: 2,
                  borderBottom: "none",
                  backgroundColor: "#1976d2",
                }}
              >
                Actividad
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  minWidth: 120,
                  py: 2,
                  borderBottom: "none",
                  backgroundColor: "#1976d2",
                }}
              >
                Estado
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  minWidth: 150,
                  py: 2,
                  borderBottom: "none",
                  backgroundColor: "#1976d2",
                }}
              >
                Responsable
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  minWidth: 120,
                  py: 2,
                  borderBottom: "none",
                  backgroundColor: "#1976d2",
                }}
              >
                Zona
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  minWidth: 150,
                  py: "2px",
                  borderBottom: "none",
                  backgroundColor: "#1976d2",
                }}
              >
                Sub-zona
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  minWidth: 120,
                  py: 2,
                  borderBottom: "none",
                  backgroundColor: "#1976d2",
                }}
              >
                Tienda
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  minWidth: 150,
                  py: 2,
                  borderBottom: "none",
                  backgroundColor: "#1976d2",
                }}
              >
                Razón Social
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  minWidth: 180,
                  py: 2,
                  borderBottom: "none",
                  backgroundColor: "#1976d2",
                }}
              >
                Asignado
              </TableCell>
              {!isGuest && (
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "14px",
                    width: 120,
                    py: 2,
                    borderBottom: "none",
                    backgroundColor: "#1976d2",
                  }}
                >
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentActivities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isGuest ? 9 : 10}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm
                      ? "No se encontraron actividades para tu búsqueda"
                      : "No hay actividades registradas"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              currentActivities.map((activity, index) => (
                <TableRow
                  key={activity.id}
                  sx={{
                    backgroundColor: getRowBackgroundColor(index),
                    "&:hover": {
                      backgroundColor: getRowHoverColor(index),
                      transition: "background-color 0.2s ease",
                    },
                    "& .MuiTableCell-root": {
                      borderBottom: "1px solid",
                      borderBottomColor: "divider",
                      py: 1.5,
                    },
                  }}
                >
                  <TableCell>{activity.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {activity.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabels[activity.estado]}
                      color={getStatusColor(activity.estado) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {formatNullableValue(activity.responsable)}
                  </TableCell>
                  <TableCell>
                    {formatNullableValue(activity.zona?.zona)}
                  </TableCell>
                  <TableCell>
                    {formatNullableValue(activity.zona?.subzona)}
                  </TableCell>
                  <TableCell>
                    {formatNullableValue(activity.zona?.tienda)}
                  </TableCell>
                  <TableCell>
                    {formatNullableValue(activity.zona?.empresa)}
                  </TableCell>
                  <TableCell>
                    {activity.created_at
                      ? formatDate(activity.created_at)
                      : "—"}
                  </TableCell>
                  {!isGuest && (
                    <TableCell>
                      <Tooltip title="Editar actividad">
                        <IconButton
                          onClick={() => {
                            setCurrentActivity(activity);
                            setEditDialogOpen(true);
                          }}
                          size="small"
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {user.rol === "admin" && (
                        <Tooltip title="Eliminar actividad">
                          <IconButton
                            onClick={() => handleDeleteClick(activity.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      {filteredActivities.length > activitiesPerPage && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Stack>
        </Box>
      )}

      {/* Información de paginación */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Página {currentPage} de {totalPages}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {indexOfFirstActivity + 1}-
          {Math.min(indexOfLastActivity, filteredActivities.length)} de{" "}
          {filteredActivities.length} actividades
        </Typography>
      </Box>

      {!isGuest && (
        <>
          <AddActivityDialog
            open={addDialogOpen}
            onClose={() => setAddDialogOpen(false)}
            onActivityAdded={loadData}
            zonas={zonas}
          />

          {currentActivity && (
            <EditActivityDialog
              open={editDialogOpen}
              onClose={() => setEditDialogOpen(false)}
              onActivityUpdated={loadData}
              activity={currentActivity}
              zonas={zonas}
            />
          )}

          <ConfirmDialog
            open={confirmDialogOpen}
            title="Confirmar eliminación"
            message="¿Estás seguro que deseas eliminar esta actividad?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </>
      )}
    </>
  );
};