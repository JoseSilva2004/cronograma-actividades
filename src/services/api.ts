const API_URL = 'http://192.168.2.71:5000/api';

// Interfaces de tipos
export interface Activity {
  id: number;
  nombre: string;
  estado: string;
  responsable: string;
  created_at: string;
  updated_at: string;
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

// Tipos para usuarios
export interface AuthenticatedUser {
  id: number;
  email: string;
  nombre: string;
  rol: 'super_admin' | 'admin' | 'user';
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuestUser {
  rol: 'guest';
}

export type User = AuthenticatedUser | GuestUser;

// Tipo específico para usuarios gestionables (excluye guest)
export interface ManageableUser {
  id: number;
  email: string;
  nombre: string;
  rol: 'super_admin' | 'admin' | 'user';
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  nombre: string;
  password: string;
  rol: 'admin' | 'user';
}

export interface UpdateUserInput {
  email?: string;
  nombre?: string;
  password?: string;
  rol?: 'admin' | 'user';
  activo?: boolean;
}

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
    
    // Manejar específicamente el error de usuario inactivo
    if (response.status === 403 && errorData.error?.includes('inactivo')) {
      throw new Error('Usuario inactivo. Contacte al administrador.');
    }
    
    throw new Error(errorData.error || 'Error en el login');
  }

  return await response.json();
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Obtener el usuario actual desde localStorage
export const getCurrentUser = (): User => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      const userData = JSON.parse(userJson);
      // Asegurar que tenga la estructura correcta
      return {
        id: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        rol: userData.rol,
        activo: userData.activo !== undefined ? userData.activo : true,
        created_at: userData.created_at || new Date().toISOString(),
        updated_at: userData.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  return { rol: 'guest' };
};

// Obtener el perfil del usuario autenticado
export const fetchUserProfile = async (): Promise<User> => {
  const response = await authFetch(`${API_URL}/me`);
  return await response.json();
};

// Funciones para actividades
export const fetchActivities = async (): Promise<Activity[]> => {
  const response = await authFetch(`${API_URL}/actividades`);
  return await response.json();
};

// Crear una nueva actividad
export const createActivity = async (activity: {
  nombre: string;
  estado: string;
  responsable: string;
  zona_id?: number | null;
  subzona?: string |null ;
  tienda?: string | null;
  empresa?: string | null;
}): Promise<Activity> => {
  const response = await authFetch(`${API_URL}/actividades`, {
    method: 'POST',
    body: JSON.stringify(activity)
  });
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
  const response = await authFetch(`${API_URL}/actividades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(activity)
  });
  return await response.json();
};

// Eliminar una actividad
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

// Crear una nueva zona
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

// Actualizar una zona existente
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

// Eliminar una zona
export const deleteZona = async (id: number): Promise<void> => {
  await authFetch(`${API_URL}/zonas/${id}`, {
    method: 'DELETE'
  });
};

// Funciones para gestión de usuarios (solo super admin)
export const fetchUsers = async (): Promise<ManageableUser[]> => {
  const response = await authFetch(`${API_URL}/usuarios`);
  const data = await response.json();
  // Filtrar solo usuarios gestionables (excluir guests si existen)
  return data.filter((user: any) => user.rol !== 'guest');
};

export const createUser = async (userData: CreateUserInput): Promise<ManageableUser> => {
  const response = await authFetch(`${API_URL}/usuarios`, {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  return await response.json();
};

export const updateUser = async (id: number, userData: UpdateUserInput): Promise<ManageableUser> => {
  const response = await authFetch(`${API_URL}/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
  return await response.json();
};

export const deleteUser = async (id: number): Promise<void> => {
  await authFetch(`${API_URL}/usuarios/${id}`, {
    method: 'DELETE'
  });
};

// Función auxiliar para verificar si un usuario es gestionable
export const isManageableUser = (user: User): user is ManageableUser => {
  return user.rol !== 'guest';
};

// Función para verificar si el usuario actual es super admin
export const isSuperAdmin = (user: User): boolean => {
  return isManageableUser(user) && user.rol === 'super_admin';
};

export const deleteUserPermanent = async (id: number): Promise<void> => {
  await authFetch(`${API_URL}/usuarios/${id}/permanente`, { method: 'DELETE' });
};
