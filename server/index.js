require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {initializeDatabase} = require("./create-tables");

const app = express();
app.use(cors({
  origin: true, // Permite todos los orígenes
  credentials: true
}));
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

// Middleware de autenticación - APLICADO A TODAS LAS RUTAS API
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    req.user = { rol: 'guest' };
    return next();
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.query('SELECT id, email, nombre, rol, activo FROM usuarios WHERE id = ?', [user.id]);
    
    if (users.length === 0) {
      return res.status(403).json({ error: 'Usuario no encontrado' });
    }
    
    // VERIFICAR SI EL USUARIO ESTÁ ACTIVO (excepto para guest)
    const currentUser = users[0];
    if (currentUser.rol !== 'guest' && !currentUser.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }
    
    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
// Middleware para verificar super administrador - CORREGIDO
function requireSuperAdmin(req, res, next) {
  // Verificar que req.user existe
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }
  
  if (req.user.rol !== 'super_admin') {
    return res.status(403).json({ error: 'Se requieren permisos de super administrador' });
  }
  next();
}

// Aplicar el middleware de autenticación a TODAS las rutas API
app.use('/api', authenticateToken);

// Endpoints públicos (sin autenticación requerida)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const user = users[0];
    
    // VERIFICAR SI EL USUARIO ESTÁ ACTIVO
    if (!user.activo) {
      return res.status(403).json({ error: 'Usuario inactivo. Contacte al administrador.' });
    }
    
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

// Endpoint para obtener perfil
app.get('/api/me', (req, res) => {
  res.json(req.user);
});

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
      ORDER BY a.updated_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
});

app.post('/api/actividades', async (req, res) => {
  // Solo permitir a admin y super_admin crear actividades
  if (req.user.rol !== 'admin' && req.user.rol !== 'super_admin') {
    return res.status(403).json({ error: 'Solo administradores pueden crear actividades' });
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

app.put('/api/actividades/:id', async (req, res) => {
  // Solo permitir a admin y super_admin editar actividades
  if (req.user.rol !== 'admin' && req.user.rol !== 'super_admin') {
    return res.status(403).json({ error: 'Solo administradores pueden editar actividades' });
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

app.delete('/api/actividades/:id', async (req, res) => {
  // Verificar permisos - solo admin puede eliminar
  if (req.user.rol !== 'admin' && req.user.rol !== 'super_admin') {
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

// Endpoints de gestión de usuarios (solo super admin)
app.get('/api/usuarios', requireSuperAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, email, nombre, rol, activo, created_at, updated_at 
      FROM usuarios 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.post('/api/usuarios', requireSuperAdmin, async (req, res) => {
  const { email, nombre, password, rol } = req.body;

  try {
    // Validaciones
    if (!email || !nombre || !password || !rol) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (!['admin', 'user', 'guest'].includes(rol)) {
      return res.status(400).json({ error: 'Rol no válido' });
    }

    // Verificar si el email ya existe
    const [existingUser] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result] = await pool.query(
      'INSERT INTO usuarios (email, nombre, password, rol) VALUES (?, ?, ?, ?)',
      [email, nombre, hashedPassword, rol]
    );

    // Obtener el usuario creado (sin password)
    const [newUser] = await pool.query(
      'SELECT id, email, nombre, rol, activo, created_at FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.put('/api/usuarios/:id', requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const { email, nombre, rol, activo } = req.body;

  try {
    // Verificar si el usuario existe
    const [user] = await pool.query('SELECT id, rol FROM usuarios WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No permitir modificar super_admin (excepto por otro super_admin)
    if (user[0].rol === 'super_admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'No se pueden modificar otros usuarios super administrador' });
    }

    // Validar rol
    if (rol && !['admin', 'user', 'guest'].includes(rol)) {
      return res.status(400).json({ error: 'Rol no válido' });
    }

    // Construir query dinámica
    const updates = [];
    const values = [];

    if (email) {
      // Verificar si el nuevo email ya existe en otro usuario
      const [existingEmail] = await pool.query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, id]
      );
      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'El email ya está en uso por otro usuario' });
      }
      updates.push('email = ?');
      values.push(email);
    }

    if (nombre) {
      updates.push('nombre = ?');
      values.push(nombre);
    }

    if (rol) {
      updates.push('rol = ?');
      values.push(rol);
    }

    if (activo !== undefined) {
      updates.push('activo = ?');
      values.push(activo);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);

    await pool.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Obtener el usuario actualizado
    const [updatedUser] = await pool.query(
      'SELECT id, email, nombre, rol, activo, created_at, updated_at FROM usuarios WHERE id = ?',
      [id]
    );

    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

//endpoint para desactivar usuario (lógico y físico)
app.delete('/api/usuarios/:id', requireSuperAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [user] = await pool.query('SELECT id, rol FROM usuarios WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }
    if (user[0].rol === 'super_admin') {
      return res.status(403).json({ error: 'No se pueden eliminar usuarios super administrador' });
    }

    // Solo desactivar
    await pool.query('UPDATE usuarios SET activo = FALSE WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

//endpoint para eliminar usuario permanentemente (físico)
app.delete('/api/usuarios/:id/permanente', requireSuperAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [user] = await pool.query('SELECT id, rol FROM usuarios WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }
    if (user[0].rol === 'super_admin') {
      return res.status(403).json({ error: 'No se pueden eliminar usuarios super administrador' });
    }

    // Eliminar físicamente
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});
// Ruta de verificación de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Health check disponible en: http://localhost:${PORT}/api/health`);
  });
}).catch((error) => {
  console.error('Error al inicializar la base de datos:', error);
  process.exit(1);
});