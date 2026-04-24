require("dotenv").config();
const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

conexion.connect(err => {
  if (err) {
    console.error("❌ Error conexión:", err);
    return;
  }

  console.log("✅ Conectado a Aiven");

  const sql = `
  CREATE TABLE IF NOT EXISTS docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) UNIQUE,
    contrasena VARCHAR(255),
    nombre VARCHAR(100)
  );

  CREATE TABLE IF NOT EXISTS clases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    seccion VARCHAR(50),
    horario VARCHAR(100),
    docente_id INT
  );

  CREATE TABLE IF NOT EXISTS estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    correo VARCHAR(100)
  );

  INSERT INTO docentes (correo, contrasena, nombre)
  VALUES ('admin@correo.com','123456','Admin')
  ON DUPLICATE KEY UPDATE correo=correo;
  `;

  conexion.query(sql, (err, result) => {
    if (err) console.error("❌ Error SQL:", err);
    else console.log("✅ Tablas creadas en Aiven");
    conexion.end();
  });
});