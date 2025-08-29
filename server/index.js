require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || '12345';
const JWT_EXPIRES_IN = '8h';

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
      rol ENUM('admin', 'user', 'guest') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `;

  try {
    await pool.query(createZonasTableQuery);
    await pool.query(createActividadesTableQuery);
    await pool.query(createUsersTableQuery);
    
    console.log('Tablas creadas correctamente');
    
    // Insertar datos iniciales
    await insertInitialZonasData();
    await insertInitialAdminUser();
    await insertInitialInvitadoUser();
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

// Datos iniciales de zonas
async function insertInitialZonasData() {
  const checkDataQuery = `SELECT COUNT(*) as count FROM zonas`;
  const [rows] = await pool.query(checkDataQuery);
  
  if (rows[0].count === 0) {
    const insertQuery = `INSERT INTO zonas (empresa, tienda, subzona, zona) VALUES ?`;
    
    const values = [
      ["GG CCS 2024, C.A.", "SHOE BOX", "Sambil Chacao", "Caracas"],
      ["EE CCS 2024, C.A.", "SHOE BOX", "Sambil Chacao", "Caracas"],
      ["HH CCS 2024, C.A.", "FOREVER 21", "Sambil Chacao", "Caracas"],
      ["JJ CCS 2024, C.A.", "ILAHUI", "Sambil Chacao", "Caracas"],
      ["II CCS 2024, C.A.", "SB LIFEWEAR", "Sambil Chacao", "Caracas"],
      ["KK CCS 2024, C.A.", "LEE COOPER", "Sambil Chacao", "Caracas"],
      ["CC CCS 2022, C.A.", "MR PRICE", "Sambil Chacao", "Caracas"],
      ["DD CCS 2023, C.A.", "GOLDEN ROSE", "Sambil Chacao", "Caracas"],
      ["MM CCS 2024, C.A.", "SB PUMA", "Sambil Chacao", "Caracas"],
      ["BB LIDER 2022, C.A.", "SHOE BOX", "Lider", "Caracas"],
      ["CC LIDER 2022, C.A.", "MR PRICE", "Lider", "Caracas"],
      ["AA LIDER 2022, C.A.", "ILAHUI", "Lider", "Caracas"],
      ["FF LIDER 2024, C.A.", "MOTARRO", "Lider", "Caracas"],
      ["GG LIDER 2024, C.A.", "FOREVER 21 SHOES", "Lider", "Caracas"],
      ["DD CERRO VERDE 2022, C.A.", "MR PRICE", "Cerro Verde", "Caracas"],
      ["AA CERRO VERDE 2022, C.A.", "FOREVER 21", "Cerro Verde", "Caracas"],
      ["BB CERRO VERDE 2022, C.A.", "ILAHUI", "Cerro Verde", "Caracas"],
      ["CC CERRO VERDE 2022, C.A.", "SHOE BOX", "Cerro Verde", "Caracas"],
      ["DD CANDELARIA 2022, C.A.", "ILAHUI", "Sambil Candelaria", "Caracas"],
      ["BB CANDELARIA 2022, C.A.", "SHOE BOX", "Sambil Candelaria", "Caracas"],
      ["CC CANDELARIA 2022, C.A.", "MR PRICE", "Sambil Candelaria", "Caracas"],
      ["AA CANDELARIA 2023, C.A.", "FOREVER 21 SHOES", "Sambil Candelaria", "Caracas"],
      ["AA CARRIZAL 2024, C.A.", "MR PRICE", "La Cascada", "Caracas"],
      ["CC CARRIZAL 2024, C.A.", "ILAHUI", "La Cascada", "Caracas"],
      ["BB CARRIZAL 2024, C.A.", "SHOE BOX", "La Cascada", "Caracas"],
      ["DD CARRIZAL 2024, C.A.", "FOREVER 21 SHOES", "La Cascada", "Caracas"],
      ["EE CARRIZAL 2024, C.A.", "MOTARRO", "La Cascada", "Caracas"],
      ["AA MILLENNIUM 2024, C.A.", "MR PRICE", "Millennium", "Caracas"],
      ["BB MILLENNIUM 2024, C.A.", "SHOE BOX", "Millennium", "Caracas"],
      ["CC MILLENNIUM 2024, C.A.", "ILAHUI", "Millennium", "Caracas"],
      ["DD MILLENNIUM 2024, C.A.", "MOTARRO", "Millennium", "Caracas"],
      ["AA RECREO 2023, C.A.", "ILAHUI", "El Recreo", "Caracas"],
      ["DD RECREO 2023, C.A.", "SHOE BOX", "El Recreo", "Caracas"],
      ["AA CCCT 2023, C.A.", "SHOE BOX", "CCCT", "Caracas"],
      ["BB CCCT 2023, C.A.", "ILAHUI", "CCCT", "Caracas"],
      ["AA CENTER 2024, C.A.", "SHOE BOX", "Candelaria Center", "Caracas"],
      ["AA PARAISO 2024, C.A.", "MOTARRO", "Multiplaza Paraiso", "Caracas"],
      ["BB PARAISO 2024, C.A.", "SHOE BOX", "Multiplaza Paraiso", "Caracas"],
      ["DD MGTA 2022, C.A.", "SHOE BOX", "Centro", "Margarita"],
      ["EE MGTA 2022, C.A.", "OUTLET", "Centro", "Margarita"],
      ["FF MGTA 2022, C.A.", "SHOE BOX", "Centro", "Margarita"],
      ["GG MGTA 2022, C.A.", "MR PRICE", "Centro", "Margarita"],
      ["HH MGTA 2022, C.A.", "MR PRICE", "Centro", "Margarita"],
      ["JJ MGTA 2022, C.A.", "OUTLET", "Centro", "Margarita"],
      ["BB MGTA 2022, C.A.", "FOREVER 21 SHOES", "Sambil", "Margarita"],
      ["CC MGTA 2022, C.A.", "ILAHUI", "Sambil", "Margarita"],
      ["RR MGTA 2022, C.A.", "MR PRICE", "Sambil", "Margarita"],
      ["SS MGTA 2022, C.A.", "MOTARRO", "Sambil", "Margarita"],
      ["QQ MGTA 2023, C.A.", "SHOE BOX", "Sambil", "Margarita"],
      ["MM MGTA 2022, C.A.", "ILAHUI", "La Vela", "Margarita"],
      ["NN MGTA 2022, C.A.", "FOREVER 21", "La Vela", "Margarita"],
      ["OO MGTA 2022, C.A.", "SHOE BOX", "La Vela", "Margarita"],
      ["AA LA VELA MGTA 2024, C.A.", "GOLDEN ROSE", "La Vela", "Margarita"],
      ["LL MGTA 2023, C.A", "MR PRICE", "La Vela", "Margarita"],
      ["KK MGTA 2022, C.A.", "SHOE BOX", "Costazul", "Margarita"],
      ["AA COSTAZUL 2024, C.A.", "MR PRICE", "Costazul", "Margarita"],
      ["AA LOS CEDROS 2024, C.A.", "IPT", "Los Cedros", "Margarita"],
      ["CC LOS CEDROS 2024, C.A.", "DIA LOCO", "Los Cedros", "Margarita"],
      ["CC VLC 2022, C.A.", "FOREVER 21", "Sambil", "Valencia"],
      ["DD VLC 2022, C.A.", "MR PRICE", "Sambil", "Valencia"],
      ["AA VLC 2022, C.A.", "SHOE BOX", "Sambil", "Valencia"],
      ["FF VLC 2023, C.A.", "ILAHUI", "Sambil", "Valencia"],
      ["GG VLC 2023, C.A.", "MOTARRO", "Sambil", "Valencia"],
      ["CC METROPOLIS VLC 2024, C.A.", "ILAHUI", "Metropolis", "Valencia"],
      ["BB METROPOLIS VLC 2024, C.A.", "SHOE BOX", "Metropolis", "Valencia"],
      ["DD METROPOLIS VLC 2024, C.A.", "SB WOMEN", "Metropolis", "Valencia"],
      ["AA METROPOLIS VLC 2024, C.A.", "MR PRICE", "Metropolis", "Valencia"],
      ["AA LA GRANJA 2024, C.A.", "SHOE BOX", "La Granja", "Valencia"],
      ["EE VLC 2022, C.A.", "ILAHUI", "La Granja", "Valencia"],
      ["CC MCY 2022, C.A.", "DIA LOCO", "Los Aviadores", "Maracay"],
      ["AA MCY 2022, C.A.", "MR PRICE", "Los Aviadores", "Maracay"],
      ["DD MCY 2022, C.A.", "SHOE BOX", "Los Aviadores", "Maracay"],
      ["EE MCY 2022, C.A.", "ILAHUI", "Los Aviadores", "Maracay"],
      ["II MCY 2023, C.A.", "MR PRICE", "Unicentro", "Maracay"],
      ["GG MCY 2023, C.A.", "SHOE BOX", "Unicentro", "Maracay"],
      ["FF MCY 2023, C.A.", "ILAHUI", "Unicentro", "Maracay"],
      ["JJ MCY 2024, C.A.", "MOTARRO", "Unicentro", "Maracay"],
      ["BB MCY CENTRO 2024, C.A.", "SHOE BOX", "Centro", "Maracay"],
      ["AA MCY CENTRO 2024, C.A.", "MR PRICE", "Centro", "Maracay"],
      ["EE PF 2024, C.A.", "ILAHUI", "Sambil", "Punto Fijo"],
      ["HH PF 2024, C.A.", "MR PRICE", "Sambil", "Punto Fijo"],
      ["BB PF 2022, C.A.", "SHOE BOX", "Sambil", "Punto Fijo"],
      ["CC PF 2023, C.A.", "FOREVER 21 SHOES", "Sambil", "Punto Fijo"],
      ["FF PF 2024, C.A.", "MR PRICE", "Virtudes", "Punto Fijo"],
      ["AA PF 2022, C.A.", "ILAHUI", "Virtudes", "Punto Fijo"],
      ["DD PF 2023, C.A.", "SHOE BOX", "Virtudes", "Punto Fijo"],
      ["II PF 2024, C.A.", "FOREVER 21 SHOES", "Virtudes", "Punto Fijo"],
      ["EE BQTO 2024, C.A.", "MR PRICE", "Sambil", "Barquisimeto"],
      ["DD BQTO 2024, C.A", "ILAHUI", "Sambil", "Barquisimeto"],
      ["BB TRINITARIAS 2023, C.A.", "SHOE BOX", "Trinitarias", "Barquisimeto"],
      ["AA TRINITARIAS 2023, C.A.", "MR PRICE", "Trinitarias", "Barquisimeto"],
      ["CC TRINITARIAS 2024, C.A.", "ILAHUI", "Trinitarias", "Barquisimeto"],
      ["AB PZO 2020, C.A.", "ILAHUI", "Orinokia", "Puerto Ordaz"],
      ["AA PZO 2020, C.A.", "SB LIFEWEAR", "Orinokia", "Puerto Ordaz"],
      ["CC PZO 2022, C.A.", "MR PRICE", "Orinokia", "Puerto Ordaz"],
      ["BB PZO 2022, C.A.", "MOTARRO", "Orinokia", "Puerto Ordaz"],
      ["DD PZO 2022, C.A.", "SHOE BOX", "Orinokia", "Puerto Ordaz"],
      ["AB CUMANA 2021, C.A.", "SHOE BOX", "Hiper Galerias Traki", "Cumana"],
      ["CC CUM 2022, C.A.", "ILAHUI", "Hiper Galerias Traki", "Cumana"],
      ["AA MCBO 2023, C.A.", "SHOE BOX", "Sambil", "Maracaibo"],
      ["BB MCBO 2023, C.A.", "ILAHUI", "Sambil", "Maracaibo"],
      ["CC MCBO 2024, C.A.", "MR PRICE", "Sambil", "Maracaibo"],
      ["DD MCBO 2024, C.A.", "FOREVER 21", "Sambil", "Maracaibo"],
      ["CC MUN 2024, C.A.", "ILAHUI", "La Cascada", "Maturin"],
      ["BB MUN 2022, C.A.", "SHOE BOX", "La Cascada", "Maturin"],
      ["AA MUN 2022, C.A.", "MR PRICE", "La Cascada", "Maturin"],
      ["BB VLP 2024, C.A.", "SHOE BOX", "Traki", "Guarico"],
      ["AA VLP 2022, C.A.", "MR PRICE", "Traki", "Guarico"],
      ["CC GUACARA 2025, C.A.", "MR PRICE", "Hiper Galerias Traki", "Guacara"],
      ["BB GUACARA 2025, C.A.", "SHOE BOX", "Hiper Galerias Traki", "Guacara"],
      ["BB SCI 2023, C.A.", "SHOE BOX", "Sambil", "San Cristobal"],
      ["AA SCI 2023, C.A.", "MR PRICE", "Sambil", "San Cristobal"],
      ["CC SCI 2022, C.A.", "ILAHUI", "Sambil", "San Cristobal"],
      ["DD SCI 2024, C.A.", "FOREVER 21 SHOES", "Sambil", "San Cristobal"],
      ["BB LEC 2022, C.A.", "MR PRICE", "Nueva Esparta", "Lecheria"],
      ["AA LEC 2022, C.A.", "ILAHUI", "Nueva Esparta", "Lecheria"],
      ["CC LEC 2022, C.A.", "SHOE BOX", "Nueva Esparta", "Lecheria"],
      ["DD LEC 2022, C.A.", "MOTARRO", "Nueva Esparta", "Lecheria"],
      ["AA APU 2022, C.A.", "MR PRICE", "Traki", "Apure"],
      ["BB APU 2022, C.A.", "SHOE BOX", "Traki", "Apure"],
      ["AA PLC 2023, C.A.", "MR PRICE", "Sucre", "Puerto la Cruz"],
      ["AA PLAZA MAYOR 2024, C.A.", "ILAHUI", "Lecheria", "Puerto la Cruz"],
      ["EE TRINITARIAS 2024, S.A", "MOTARRO", "Trinitarias", "Barquisimeto"],
      ["GG BQTO 2024, C.A.", "SHOE BOX", "Sambil", "Barquisimeto"],
      ["BB MCY 2022, C.A", "FOREVER 21", "Los Aviadores", "Maracay"],
      ["BB LOS CEDROS 2024, C.A", "OHWOW", "Los Cedros", "Margarita"],
      ["AA CCS OUTLET 2025, C.A.", "FOREVER 21", "Sambil Chacao", "Caracas"],
      ["BB CCS OUTLET 2025, C.A.", "SHOE BOX", "Sambil Chacao", "Caracas"],
      ["CC CUM 2022, C.A.", "MOTARRO", "Hiper Galerias Traki", "Cumana"],
      [null, null, null, "Caracas"],
      [null, null, null, "Maracaibo"],
      [null, null, null, "Margarita"],
      [null, null, null, "Valencia"],
      [null, null, null, "Barquisimeto"],
      [null, null, null, "Puerto Ordaz"],
      [null, null, null, "San Cristobal"],
      [null, null, null, "Lecheria"],
      [null, null, null, "Cumana"],
      [null, null, null, "Maturin"],
      [null, null, null, "Guarico"],
      [null, null, null, "Guacara"],
      [null, null, null, "Apure"],
      [null, null, null, "Puerto la Cruz"],
      [null, null, null, "Punto Fijo"],
      [null, null, null, "Maracay"],
    ];
    
    try {
      await pool.query(insertQuery, [values]);
      console.log(`${values.length} registros de zonas insertados`);
    } catch (error) {
      console.error('Error al insertar zonas:', error);
      throw error;
    }
  }
}

// Usuario admin inicial
async function insertInitialAdminUser() {
  try {
    // Verificar si el usuario admin ya existe usando el email correcto
    const checkUserQuery = `SELECT id FROM usuarios WHERE email = ? LIMIT 1`;
    const [users] = await pool.query(checkUserQuery, ['admin@soporte.com']);
    
    if (users.length === 0) {
      // Solo insertar si no existe
      const hashedPassword = await bcrypt.hash('Ax2012123', 10);
      const insertQuery = `INSERT INTO usuarios (email, nombre, password, rol) VALUES (?, ?, ?, ?)`;
      
      await pool.query(insertQuery, [
        'admin@soporte.com',
        'Administrador',
        hashedPassword,
        'admin'
      ]);
      console.log('Usuario admin creado exitosamente');
    } else {
      console.log('Usuario admin ya existe en la base de datos');
    }
  } catch (error) {
    console.error('Error al verificar/insertar usuario admin:', error);
    throw error;
  }
}

// Usuario invitado inicial
async function insertInitialInvitadoUser() {
  try {
    // Verificar si el usuario invitado ya existe
    const checkUserQuery = `SELECT id FROM usuarios WHERE email = ? LIMIT 1`;
    const [users] = await pool.query(checkUserQuery, ['invitado@soporte.com']);
    
    if (users.length === 0) {
      // Solo insertar si no existe
      const hashedPassword = await bcrypt.hash('invitado123', 10);
      const insertQuery = `INSERT INTO usuarios (email, nombre, password, rol) VALUES (?, ?, ?, ?)`;
      
      await pool.query(insertQuery, [
        'invitado@soporte.com',
        'Invitado',
        hashedPassword,
        'guest'
      ]);
      console.log('Usuario invitado creado exitosamente');
    } else {
      console.log('Usuario invitado ya existe en la base de datos');
    }
  } catch (error) {
    console.error('Error al verificar/insertar usuario invitado:', error);
    throw error;
  }
}

// Middleware de autenticación
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    req.user = { rol: 'guest' };
    return next();
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.query('SELECT id, email, nombre, rol FROM usuarios WHERE id = ?', [user.id]);
    
    if (users.length === 0) {
      return res.status(403).json({ error: 'Usuario no encontrado' });
    }
    
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

//Enpoints
// Endpoint de login

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Endpoint para obtener perfil
app.get('/api/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

// Protección de endpoints
app.use('/api/actividades', authenticateToken);
app.use('/api/zonas', authenticateToken);

// Endpoints de actividades (protegidos)
app.get('/api/actividades', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, 
             COALESCE(z.zona, '-') as zona, 
             COALESCE(z.subzona, '-') as subzona,
             COALESCE(z.tienda, '-') as tienda,
             COALESCE(z.empresa, '-') as empresa
      FROM actividades a
      LEFT JOIN zonas z ON a.zona_id = z.id
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
});

// En el endpoint POST /api/actividades
app.post('/api/actividades', async (req, res) => {
  if (req.user.rol === 'guest') {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }
  
  const { nombre, estado, responsable, zona_id } = req.body;
  
  try {
    // Solo validar zona_id si se proporciona
    if (zona_id) {
      const [zona] = await pool.query('SELECT id FROM zonas WHERE id = ?', [zona_id]);
      if (zona.length === 0) {
        return res.status(400).json({ error: 'Zona no existe' });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO actividades (nombre, estado, responsable, zona_id) VALUES (?, ?, ?, ?)',
      [nombre, estado, responsable || null, zona_id || null]
    );
    
    const [newActivity] = await pool.query(`
      SELECT a.*, 
             COALESCE(z.zona, '-') as zona,
             COALESCE(z.subzona, '-') as subzona,
             COALESCE(z.tienda, '-') as tienda,
             COALESCE(z.empresa, '-') as empresa
      FROM actividades a
      LEFT JOIN zonas z ON a.zona_id = z.id
      WHERE a.id = ?
    `, [result.insertId]);
    
    res.status(201).json(newActivity[0]);
  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({ error: 'Error al crear actividad' });
  }
});

// Endpoint para actualizar una actividad
app.put('/api/actividades/:id', async (req, res) => {
  if (req.user.rol === 'guest') {
    return res.status(403).json({ error: 'Acceso no autorizado para actualizar' });
  }

  const { id } = req.params;
  const { nombre, estado, responsable, zona_id } = req.body;

  try {
    // Verificar si la actividad existe
    const [actividad] = await pool.query('SELECT id FROM actividades WHERE id = ?', [id]);
    if (actividad.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    // Verificar si la zona_id es válida (si se proporciona)
    if (zona_id) {
      const [zona] = await pool.query('SELECT id FROM zonas WHERE id = ?', [zona_id]);
      if (zona.length === 0) {
        return res.status(400).json({ error: 'La zona proporcionada no existe' });
      }
    }

    await pool.query(
      'UPDATE actividades SET nombre = ?, estado = ?, responsable = ?, zona_id = ? WHERE id = ?',
      [nombre, estado, responsable, zona_id || null, id]
    );

    const [updatedActivity] = await pool.query('SELECT a.*, z.zona, z.subzona, z.tienda, z.empresa FROM actividades a LEFT JOIN zonas z ON a.zona_id = z.id WHERE a.id = ?', [id]);

     res.status(200).json(updatedActivity[0]);
  } catch (error) {
    console.error(`Error al actualizar actividad con id ${id}:`, error);
    res.status(500).json({ error: 'Error en el servidor al actualizar la actividad' });
  }
});

// Endpoint para eliminar una actividad
app.delete('/api/actividades/:id', async (req, res) => {
  // Verificar permisos - solo admin puede eliminar
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden eliminar actividades' });
  }

  const { id } = req.params;
  
  try {
    // Verificar si la actividad existe
    const [actividad] = await pool.query('SELECT id FROM actividades WHERE id = ?', [id]);
    if (actividad.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    // Eliminar la actividad
    await pool.query('DELETE FROM actividades WHERE id = ?', [id]);
    
    // Respuesta exitosa sin contenido (204 No Content)
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    
    // Manejar errores específicos de FK u otros
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        error: 'No se puede eliminar la actividad porque está siendo referenciada por otros registros'
      });
    }
    
    res.status(500).json({ error: 'Error al eliminar actividad' });
  }
});

// Endpoints de zonas (protegidos)
app.get('/api/zonas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM zonas ORDER BY zona, subzona');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener zonas:', error);
    res.status(500).json({ error: 'Error al obtener zonas' });
  }
});

// Endpoint para registrar usuario invitado
app.post('/api/register-guest', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Verificar si el email ya existe
    const [existingUser] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario con rol 'guest'
    const [result] = await pool.query(
      'INSERT INTO usuarios (email, nombre, password, rol) VALUES (?, ?, ?, "guest")',
      [email, nombre, hashedPassword]
    );

    res.status(201).json({ 
      message: 'Usuario invitado registrado exitosamente',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error al registrar usuario invitado:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
initializeDatabase().then(() => {
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
});