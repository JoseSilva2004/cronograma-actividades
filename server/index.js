require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {initializeDatabase} = require("./create-tables");

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
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '8h';

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
const PORT = process.env.DB_PORT;
initializeDatabase().then(() => {
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
});