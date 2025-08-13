const API_URL = 'http://localhost:5000/api';

export interface Activity {
  id: number;
  nombre: string;
  estado: string;
  responsable: string;
  created_at: string;
  zona_id: number | null;
  zona?: {
    id: number;
    zona: string;
    subzona: string;
    tienda: string;
    empresa: string;
  };
}

export interface Zona {
  id: number;
  zona: string;
  subzona: string;
  tienda: string;
  empresa: string;
}

// Obtener todas las actividades con información de zona
export const fetchActivities = async (): Promise<Activity[]> => {
  const response = await fetch(`${API_URL}/actividades?_expand=zona`);
  if (!response.ok) {
    throw new Error('Error al obtener actividades');
  }
  return await response.json();
};

// Obtener todas las zonas disponibles
export const fetchZonas = async (): Promise<Zona[]> => {
  const response = await fetch(`${API_URL}/zonas`);
  if (!response.ok) {
    throw new Error('Error al obtener zonas');
  }
  return await response.json();
};

// Crear una nueva actividad
export const createActivity = async (activity: {
  nombre: string;
  estado: string;
  responsable: string;
  zona_id?: number | null;
}): Promise<Activity> => {
  const response = await fetch(`${API_URL}/actividades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...activity,
      zona_id: activity.zona_id || null
    })
  });

  if (!response.ok) {
    throw new Error('Error al crear actividad');
  }

  return await response.json();
};

// Actualizar una actividad existente
export const updateActivity = async (
  id: number,
  activity: {
    nombre?: string;
    estado?: string;
    responsable?: string;
    zona_id?: number | null;
  }
): Promise<Activity> => {
  const response = await fetch(`${API_URL}/actividades/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...activity,
      zona_id: activity.zona_id || null
    })
  });

  if (!response.ok) {
    throw new Error('Error al actualizar actividad');
  }

  return await response.json();
};

// Eliminar una actividad

export const deleteActivity = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/actividades/${id}`, { 
    method: 'DELETE'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al eliminar actividad');
  }
  
};