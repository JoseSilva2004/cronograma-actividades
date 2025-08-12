require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

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

// Crear tabla si no existe
async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS actividades (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      estado ENUM('pendiente', 'en_progreso', 'programado', 'en_ejecucion', 'completado') NOT NULL,
      responsable VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(createTableQuery);
}

// Endpoints
app.get('/api/actividades', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM actividades ORDER BY created_at DESC');
  res.json(rows);
});

app.post('/api/actividades', async (req, res) => {
  const { nombre, estado, responsable } = req.body;
  const [result] = await pool.query(
    'INSERT INTO actividades (nombre, estado, responsable) VALUES (?, ?, ?)',
    [nombre, estado, responsable]
  );
  res.status(201).json({ id: result.insertId });
});

app.put('/api/actividades/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, estado, responsable } = req.body;
  await pool.query(
    'UPDATE actividades SET nombre = ?, estado = ?, responsable = ? WHERE id = ?',
    [nombre, estado, responsable, id]
  );
  res.status(200).json({ message: 'Actividad actualizada' });
});

app.delete('/api/actividades/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM actividades WHERE id = ?', [id]);
  res.status(200).json({ message: 'Actividad eliminada' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
initializeDatabase().then(() => {
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
});