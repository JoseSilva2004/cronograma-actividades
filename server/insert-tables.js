require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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
      ["BB MGTA 2022, C.A.", "FOREVER 21", "Sambil", "Margarita"],
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
    const [users] = await pool.query(checkUserQuery, process.env.ADMIN_EMAIL);
    
    if (users.length === 0) {
      // Solo insertar si no existe
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const insertQuery = `INSERT INTO usuarios (email, nombre, password, rol) VALUES (?, ?, ?, ?)`;
      
      await pool.query(insertQuery, [
        process.env.ADMIN_EMAIL,
        process.env.ADMIN_NAME,
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

module.exports = {
  insertInitialZonasData,
  insertInitialAdminUser
};
