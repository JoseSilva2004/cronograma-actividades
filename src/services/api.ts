const API_URL = 'http://localhost:5000/api';

// Interfaces de tipos
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

export interface AuthenticatedUser {
  id: number;
  email: string;
  nombre: string;
  rol: 'admin' | 'user';
}

export interface GuestUser {
  rol: 'guest';
}

export type User = AuthenticatedUser | GuestUser;

export interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
}

// Función para hacer fetch con autenticación
async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Token inválido o expirado
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  if (response.status === 403) {
    throw new Error('No tienes permisos para esta acción');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Error en la solicitud');
  }

  return response;
}

// Funciones de autenticación
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error en el login');
  }

  return await response.json();
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User => {
  const userJson = localStorage.getItem('user');
  return userJson ? (JSON.parse(userJson) as AuthenticatedUser) : { rol: 'guest' };
};

export const fetchUserProfile = async (): Promise<User> => {
  const response = await authFetch(`${API_URL}/me`);
  return await response.json();
};

// Funciones para actividades
export const fetchActivities = async (): Promise<Activity[]> => {
  const response = await authFetch(`${API_URL}/actividades`);
  return await response.json();
};

export const createActivity = async (activity: {
  nombre: string;
  estado: string;
  responsable: string;
  zona_id?: number | null;
}): Promise<Activity> => {
  const response = await authFetch(`${API_URL}/actividades`, {
    method: 'POST',
    body: JSON.stringify(activity)
  });
  return await response.json();
};

export const updateActivity = async (
  id: number,
  activity: {
    nombre?: string;
    estado?: string;
    responsable?: string;
    zona_id?: number | null;
  }
): Promise<Activity> => {
  const response = await authFetch(`${API_URL}/actividades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(activity)
  });
  return await response.json();
};

export const deleteActivity = async (id: number): Promise<void> => {
  await authFetch(`${API_URL}/actividades/${id}`, { 
    method: 'DELETE'
  });
};

// Funciones para zonas
export const fetchZonas = async (): Promise<Zona[]> => {
  const response = await authFetch(`${API_URL}/zonas`);
  return await response.json();
};

export const createZona = async (zona: {
  zona: string;
  subzona: string;
  tienda: string;
  empresa: string;
}): Promise<Zona> => {
  const response = await authFetch(`${API_URL}/zonas`, {
    method: 'POST',
    body: JSON.stringify(zona)
  });
  return await response.json();
};

export const updateZona = async (
  id: number,
  zona: {
    zona?: string;
    subzona?: string;
    tienda?: string;
    empresa?: string;
  }
): Promise<Zona> => {
  const response = await authFetch(`${API_URL}/zonas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(zona)
  });
  return await response.json();
};

export const deleteZona = async (id: number): Promise<void> => {
  await authFetch(`${API_URL}/zonas/${id}`, {
    method: 'DELETE'
  });
};