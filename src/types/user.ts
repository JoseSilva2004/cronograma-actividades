// Tipos específicos para gestión de usuarios
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

export interface UserFormData {
  email: string;
  nombre: string;
  password: string;
  rol: 'admin' | 'user';
}

// Tipos para el sistema de autenticación
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

// Helper types para verificación de roles
export type UserRole = 'super_admin' | 'admin' | 'user' | 'guest';

// Función type guard para verificar si es usuario autenticado
export function isAuthenticatedUser(user: User): user is AuthenticatedUser {
  return user.rol !== 'guest';
}

// Función type guard para verificar si es usuario gestionable
export function isManageableUser(user: User): user is ManageableUser {
  return user.rol !== 'guest';
}

// Función para obtener propiedades seguras de usuario
export function getUserProperty<T>(user: User, property: keyof AuthenticatedUser, defaultValue: T): T {
  if (isAuthenticatedUser(user)) {
    return (user as any)[property] || defaultValue;
  }
  return defaultValue;
}

// Función para obtener el nombre seguro del usuario
export function getUserName(user: User): string {
  if (isAuthenticatedUser(user)) {
    return user.nombre;
  }
  return 'Invitado';
}

// Función para obtener el email seguro del usuario
export function getUserEmail(user: User): string {
  if (isAuthenticatedUser(user)) {
    return user.email;
  }
  return '';
}

// Función para verificar permisos
export function hasRole(user: User, role: UserRole): boolean {
  return user.rol === role;
}

export function hasAnyRole(user: User, roles: UserRole[]): boolean {
  return roles.includes(user.rol);
}

export function hasAdminAccess(user: User): boolean {
  return hasAnyRole(user, ['super_admin', 'admin']);
}

export function canManageUsers(user: User): boolean {
  return hasRole(user, 'super_admin');
}