const express = require("express");
const conexion = require("../configuracion/conexion");

const router = express.Router();

router.get("/", (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS docentes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      correo VARCHAR(100) NOT NULL UNIQUE,
      contrasena VARCHAR(255) NOT NULL,
      nombre VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100),
      correo VARCHAR(100) UNIQUE,
      password VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS clases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      seccion VARCHAR(50),
      horario VARCHAR(100),
      docente_id INT
    );

    CREATE TABLE IF NOT EXISTS estudiantes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      numero_lista VARCHAR(20),
      carne VARCHAR(50) NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      correo VARCHAR(100),
      clase_id INT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sesiones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      clase_id INT NOT NULL,
      token_qr VARCHAR(255) NOT NULL,
      fecha DATE NOT NULL,
      activa BOOLEAN DEFAULT TRUE,
      creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS asistencias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sesion_id INT NOT NULL,
      estudiante_id INT NOT NULL,
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      selfie VARCHAR(255) NULL,
      UNIQUE KEY unica_asistencia (sesion_id, estudiante_id)
    );

    CREATE TABLE IF NOT EXISTS participaciones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sesion_id INT NOT NULL,
      estudiante_id INT NOT NULL,
      nota DECIMAL(5,2) DEFAULT 0,
      comentario TEXT,
      creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS grupos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sesion_id INT NOT NULL,
      nombre_grupo VARCHAR(50) NOT NULL,
      nota DECIMAL(5,2) DEFAULT 0,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS integrantes_grupo (
      id INT AUTO_INCREMENT PRIMARY KEY,
      grupo_id INT NOT NULL,
      estudiante_id INT NOT NULL
    );

    INSERT INTO docentes (correo, contrasena, nombre)
    VALUES ('admin@correo.com', '123456', 'Admin')
    ON DUPLICATE KEY UPDATE correo = correo;

    INSERT INTO usuarios (nombre, correo, password)
    VALUES ('Admin', 'admin@correo.com', '123456')
    ON DUPLICATE KEY UPDATE correo = correo;
  `;

  conexion.query(sql, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error creando base de datos", detalle: error.message });
    }

    res.json({ mensaje: "Base de datos creada correctamente en Aiven" });
  });
});

module.exports = router;