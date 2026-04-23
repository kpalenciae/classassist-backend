const mysql = require("mysql2");


const usarSSL = process.env.DB_SSL === "true";

const opcionesConexion = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

if (usarSSL) {
  opcionesConexion.ssl = {
    rejectUnauthorized: false,
  };
}

const conexion = mysql.createConnection(opcionesConexion);

conexion.connect((error) => {
  if (error) {
    console.error("❌ Error de conexión:", error);
  } else {
    console.log("✅ Conectado a MySQL");
  }
});

module.exports = conexion;