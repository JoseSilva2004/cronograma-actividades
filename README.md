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

## 🔧 Funcionalidades Técnicas Avanzadas

### 4.🔐Autenticación y Seguridad
- 🔐 **Login seguro** con validación de estado de usuario
- 🚫 **Protección de rutas** por roles
- ⏰ **Tokens JWT** con expiración configurable
- 🔒 **Middleware de autenticación** en todas las APIs

### 5.📄Reportes y Exportación
- 📄 **Generación de reportes** por actividad
- 🖨️ **Funcionalidad de impresión** directa
- 📥 **Descarga de reportes** en formato texto
- 📊 **Dashboards exportables**

## 🚀 Ejecución del Proyecto

### 📋 Prerrequisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior)
- **npm** o **yarn** como gestor de paquetes
- **MySQL** (versión 5.7 o superior)
- **Git** para clonar el repositorio

### 🔧 Configuración Inicial

#### 1. Clonar el Repositorio
```bash
git clone https://github.com/JoseSilva2004/cronograma_actividades.git
cd cronograma_actividades

```

#### 2. 🔧 Instalar Dependencias

```bash
npm install

```
#### 3. ⚙️ Configurar variables de entorno

```bash
DB_HOST=0.0.0.0
DB_PORT=TuPuerto
DB_USER=TuUsuario
DB_PASSWORD=TuContraseña
DB_NAME=NombreBaseDatos
JWT_SECRET=TuSecretoJWT
SUPER_ADMIN_NAME=TuNombreUserSupAdmin
SUPER_ADMIN_EMAIL=TuEmailUserSupAdmin
SUPER_ADMIN_PASSWORD=TuContraseñaUserSupAdmin
```
#### 4. Correr el Backend
```bash
cd server
npm run dev

```

#### 5. Correr el FrontEnd
```bash
npm run start

