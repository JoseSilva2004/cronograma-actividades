# 📋 Sistema de Gestión de Actividades - GRUPO CANAIMA

## 🚀 Descripción del Proyecto

Sistema web completo para la gestión y seguimiento de actividades, desarrollado con **React.js + TypeScript** en el frontend y **Node.js + Express + MySQL** en el backend. Diseñado específicamente para las necesidades operativas de GRUPO CANAIMA.

---

## 🏗️ Arquitectura Técnica

### Frontend
- **React 18** con TypeScript
- **Material-UI (MUI)** para componentes de UI
- **React Router** para navegación
- **Context API** para estado global
- **Axios** para consumo de APIs

### Backend
- **Node.js** con Express.js
- **MySQL** con mysql2/promise
- **JWT** para autenticación
- **bcryptjs** para encriptación
- **CORS** habilitado

### Características de Seguridad
- Autenticación JWT con expiración
- Contraseñas encriptadas con bcrypt
- Middleware de autorización por roles
- Validación de datos en frontend y backend

---

## 👥 Sistema de Roles y Permisos

### 🔐 Roles Disponibles

| Rol | Permisos | Descripción |
|-----|----------|-------------|
| **Super Admin** | Acceso completo al sistema | Administrador principal con todos los privilegios |
| **Admin** | Gestión de actividades y dashboard | Puede crear, editar y eliminar actividades |
| **User** | Solo lectura de actividades y dashboard | Usuario regular con acceso limitado |
| **Guest** | Acceso básico de solo lectura | Usuario invitado sin autenticación |

---

## 📊 Módulos Principales

### 1. 🏠 Dashboard
- **Gráficos interactivos** de distribución de actividades por estado
- **Estadísticas en tiempo real** con tarjetas informativas
- **Filtros avanzados** por zona, responsable y estado
- **Vista responsive** adaptada a dispositivos móviles
- **Actividades recientes** con timeline

### 2. 📝 Gestión de Actividades
#### Funcionalidades Principales:
- ✅ **Lista completa** de actividades con paginación
- ✅ **Búsqueda en tiempo real** por múltiples campos
- ✅ **Filtros avanzados** por estado y responsable
- ✅ **Vista dual** (tabla/tarjetas) según dispositivo
- ✅ **Crear, editar y eliminar** actividades (solo admin)
- ✅ **Asignación de zonas** con selección jerárquica
- ✅ **Seguimiento de estados** con colores visuales

#### Estados de Actividades:
- 📋 **Pendiente** - Actividad por iniciar
- ⏳ **En progreso** - Actividad en desarrollo  
- 📅 **Programado** - Actividad planificada
- 🖥️ **En ejecución** - Actividad en proceso activo
- ✅ **Completado** - Actividad finalizada

### 3. 👥 Gestión de Usuarios (Solo Super Admin)
#### Características:
- 🔐 **Registro seguro** de nuevos usuarios
- 📋 **Tabla completa** con información detallada
- 🎯 **Control de estados** (activo/inactivo)
- 🗑️ **Eliminación segura** (lógica y física)
- 📧 **Gestión de emails** únicos por usuario

#### Funciones Específicas:
- Activación/desactivación de usuarios
- Edición de perfiles y roles
- Eliminación temporal y permanente
- Visualización segura de contraseñas
- Copiado al portapapeles

  ### 4.🔐Autenticación y Seguridad
- 🔐 **Login seguro** con validación de estado de usuario
- 🚫 **Protección de rutas** por roles
- ⏰ **Tokens JWT** con expiración configurable
- 🔒 **Middleware de autenticación** en todas las APIs
