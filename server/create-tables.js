require("dotenv").config();
const mysql = require('mysql2/promise');
const init = require("./insert-tables");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Inicialización de la base de datos
async function initializeDatabase() {
  // Crear tabla zonas
  const createZonasTableQuery = `
  CREATE TABLE IF NOT EXISTS zonas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zona VARCHAR(100) NOT NULL COMMENT 'Nombre de la zona principal',
    subzona VARCHAR(100) COMMENT 'Subdivisión de la zona',
    tienda VARCHAR(100) COMMENT 'Nombre de la tienda',
    empresa VARCHAR(100) COMMENT 'Empresa asociada',
    UNIQUE KEY uk_zona_completa (zona, subzona, tienda, empresa)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`;

  // Crear tabla actividades
  const createActividadesTableQuery = `
    CREATE TABLE IF NOT EXISTS actividades (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      estado ENUM('pendiente', 'en_progreso', 'programado', 'en_ejecucion', 'completado') NOT NULL,
      responsable VARCHAR(255),
      zona_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (zona_id) REFERENCES zonas(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `;

  // Crear tabla usuarios
 const createUsersTableQuery = `
  CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('super_admin', 'admin', 'user', 'guest') NOT NULL DEFAULT 'user',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`;

  try {
    await pool.query(createZonasTableQuery);
    await pool.query(createActividadesTableQuery);
    await pool.query(createUsersTableQuery);

    console.log("Tablas creadas correctamente");

    // Insertar datos iniciales
    await init.insertInitialZonasData();
    await init.insertInitialSuperAdmin();
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    throw error;
  }
}

module.exports = { initializeDatabase };