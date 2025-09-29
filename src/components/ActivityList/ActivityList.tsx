import React, { useEffect, useState } from "react";
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
  Stack,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import { AddActivityDialog } from "../AddActivityDialog";
import { EditActivityDialog } from "../EditActivityDialog";
import { ConfirmDialog } from "../ConfirmDialog";
import { ActivityReport } from "../ActivityReport/ActivityReport";
import {
  fetchActivities,
  deleteActivity,
  fetchZonas,
  Zona,
} from "../../services/api";
import { Activity, statusLabels } from "./../../types/activity";
import { getCurrentUser } from "../../services/api";
import { formatNullableValue } from "../../utils/helpers";

export const ActivityList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const activitiesPerPage = isMobile ? 3 : 5;

  const user = getCurrentUser();
  const isAdmin = user.rol === "admin" || user.rol === "super_admin";

  // Cargar datos
  const loadData = async () => {
    try {
      setRefreshing(true);
      const [activitiesData, zonasData] = await Promise.all([
        fetchActivities(),
        fetchZonas(),
      ]);
      setZonas(zonasData);

      const formattedActivities = activitiesData.map((activity) => ({
        ...activity,
        estado: activity.estado as Activity["estado"],
        zona: zonasData.find((z) => z.id === activity.zona_id) || null,
      })) as Activity[];

      setActivities(formattedActivities);
      setFilteredActivities(formattedActivities);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-cambiar a vista cards en móviles
  useEffect(() => {
    if (isMobile && viewMode === 'table') {
      setViewMode('cards');
    }
  }, [isMobile, viewMode]);

  // Filtrado de actividades
  useEffect(() => {
    const filtered = activities.filter(
      (activity) =>
        activity.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.zona?.zona?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.zona?.subzona?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.zona?.tienda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.zona?.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        statusLabels[activity.estado].toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredActivities(filtered);
    setCurrentPage(1);
  }, [searchTerm, activities]);

  // Paginación
  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = filteredActivities.slice(indexOfFirstActivity, indexOfLastActivity);
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);

  // Handlers
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
        console.error("Error deleting activity:", error);
      }
    }
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

  const handleGenerateReport = (activity: Activity) => {
    setSelectedActivity(activity);
    setReportDialogOpen(true);
  };

  // Utilidades
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "completado": return "success";
      case "en_progreso": return "warning";
      case "en_ejecucion": return "info";
      case "programado": return "secondary";
      default: return "default";
    }
  };

  // Componente para tarjetas en móviles
  const ActivityCard = ({ activity, index }: { activity: Activity; index: number }) => (
    <Card 
      sx={{ 
        mb: 2, 
        p: 2,
        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
        borderLeft: `4px solid ${theme.palette.primary.main}`
      }}
    >
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        {/* Header de la tarjeta */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={statusLabels[activity.estado]}
            color={getStatusColor(activity.estado) as any}
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            ID: {activity.id}
          </Typography>
        </Box>

        {/* Contenido principal */}
        <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1, fontSize: '1rem' }}>
          {activity.nombre}
        </Typography>

        {/* Información de ubicación */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            📍 {formatNullableValue(activity.zona?.zona)}
            {activity.zona?.subzona && ` • ${formatNullableValue(activity.zona.subzona)}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            🏪 {formatNullableValue(activity.zona?.tienda)}
          </Typography>
        </Box>

        {/* Información adicional */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2">
            👤 {formatNullableValue(activity.responsable)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(activity.created_at)}
          </Typography>
        </Box>

        {/* Última actualización */}
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Modificado: {formatDate(activity.updated_at)}
          </Typography>
          {activity.updated_at !== activity.created_at && (
            <Tooltip title="Modificado recientemente">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "primary.main",
                  animation: "pulse 1.5s infinite",
                }}
              />
            </Tooltip>
          )}
        </Box>

        {/* Acciones - SOLO PARA ADMINISTRADORES */}
        {isAdmin && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Tooltip title="Editar">
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
            <Tooltip title="Reporte">
              <IconButton
                onClick={() => handleGenerateReport(activity)}
                size="small"
                color="info"
              >
                <DescriptionIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton
                onClick={() => handleDeleteClick(activity.id)}
                size="small"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Header Mejorado */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: { xs: "flex-start", sm: "center" }, 
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 2
        }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: "bold", color: "primary.main" }}>
            📋 Lista de Actividades
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: 'wrap' }}>
            {/* Selector de vista solo en desktop */}
            {!isMobile && (
              <Tooltip title={viewMode === 'table' ? 'Vista tabla' : 'Vista tarjetas'}>
                <IconButton 
                  onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                  color="primary"
                  size="small"
                >
                  <ViewWeekIcon />
                </IconButton>
              </Tooltip>
            )}

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
              sx={{ width: { xs: "100%", sm: 250 } }}
            />

            <Tooltip title="Actualizar lista">
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {/* Botón Nueva Actividad - SOLO PARA ADMINISTRADORES */}
            {isAdmin && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setAddDialogOpen(true)}
                size={isSmallMobile ? "small" : "medium"}
                sx={{ 
                  whiteSpace: 'nowrap',
                  minWidth: { xs: 'auto', sm: '140px' }
                }}
              >
                {isSmallMobile ? '+ Nueva Actividad' : '+ Nueva Actividad'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Información de resultados */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {currentActivities.length} de {filteredActivities.length} actividades
            {searchTerm && ` para "${searchTerm}"`}
          </Typography>
        </Box>
      </Box>

      {/* Vista según el modo seleccionado */}
      {viewMode === 'table' && !isMobile ? (
        /* VISTA TABLA (Desktop) */
        <TableContainer component={Paper} elevation={2} sx={{ overflow: 'auto' }}>
          <Table sx={{ minWidth: 900 }} size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                {[
                  { label: '#', width: 60 },
                  { label: 'Actividad', width: 200 },
                  { label: 'Estado', width: 120 },
                  { label: 'Responsable', width: 150 },
                  { label: 'Zona', width: 120 },
                  { label: 'Sub-zona', width: 150 },
                  { label: 'Tienda', width: 120 },
                  { label: 'Empresa', width: 150 },
                  { label: 'Creado', width: 180 },
                  { label: 'Última Actualización', width: 180 },
                  ...(isAdmin ? [{ label: 'Acciones', width: 150 }] : []) // SOLO MOSTRAR ACCIONES PARA ADMIN
                ].map((header) => (
                  <TableCell
                    key={header.label}
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "14px",
                      py: 2,
                      borderBottom: "none",
                      minWidth: header.width,
                      width: header.width,
                      backgroundColor: '#1976d2'
                    }}
                  >
                    {header.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentActivities.map((activity, index) => (
                <TableRow
                  key={activity.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                    '&:hover': { backgroundColor: '#e3f2fd' }
                  }}
                >
                  <TableCell>{activity.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {activity.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={statusLabels[activity.estado]} color={getStatusColor(activity.estado) as any} size="small" />
                  </TableCell>
                  <TableCell>{formatNullableValue(activity.responsable)}</TableCell>
                  <TableCell>{formatNullableValue(activity.zona?.zona)}</TableCell>
                  <TableCell>{formatNullableValue(activity.zona?.subzona)}</TableCell>
                  <TableCell>{formatNullableValue(activity.zona?.tienda)}</TableCell>
                  <TableCell>{formatNullableValue(activity.zona?.empresa)}</TableCell>
                  <TableCell>{formatDate(activity.created_at)}</TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {formatDate(activity.updated_at)}
                      </Typography>
                      {activity.updated_at !== activity.created_at && (
                        <Tooltip title="Modificado">
                          <Box
                            sx={{
                              ml: 1,
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: "primary.main",
                              animation: "pulse 1.5s infinite",
                            }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  
                  {/* ACCIONES - SOLO PARA ADMINISTRADORES */}
                  {isAdmin && (
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="Editar">
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
                        <Tooltip title="Reporte">
                          <IconButton
                            onClick={() => handleGenerateReport(activity)}
                            size="small"
                            color="info"
                          >
                            <DescriptionIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            onClick={() => handleDeleteClick(activity.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* VISTA TARJETAS (Mobile) */
        <Box>
          {currentActivities.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} index={index} />
          ))}
        </Box>
      )}

      {/* Paginación Mejorada */}
      {filteredActivities.length > activitiesPerPage && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size={isSmallMobile ? "small" : "medium"}
              showFirstButton={!isSmallMobile}
              showLastButton={!isSmallMobile}
            />
          </Stack>
        </Box>
      )}

      {/* Información de paginación */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Página {currentPage} de {totalPages}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {indexOfFirstActivity + 1}-{Math.min(indexOfLastActivity, filteredActivities.length)} de {filteredActivities.length} actividades
        </Typography>
      </Box>

      {/* Diálogos - SOLO PARA ADMINISTRADORES */}
      {isAdmin && (
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
            onCancel={() => setConfirmDialogOpen(false)}
          />

          <ActivityReport
            open={reportDialogOpen}
            onClose={() => setReportDialogOpen(false)}
            activity={selectedActivity}
            zona={selectedActivity ? zonas.find(z => z.id === selectedActivity.zona_id) || null : null}
          />
        </>
      )}
    </>
  );
};