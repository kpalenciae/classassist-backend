const conexion = require("../configuracion/conexion");

const iniciarSesion = (req, res) => {
  const { correo, password } = req.body;

  const consulta = "SELECT * FROM usuarios WHERE correo = ?";

  conexion.query(consulta, [correo], (error, resultados) => {
    if (error) {
      console.error("Error en consulta:", error);
      return res.status(500).json({ mensaje: "Error en el servidor" });
    }

    if (resultados.length === 0) {
      return res.status(401).json({ mensaje: "Usuario no encontrado" });
    }

    const usuario = resultados[0];

    if (usuario.contrasena !== password) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    return res.json({
      mensaje: "Login exitoso",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
      },
    });
  });
};

module.exports = { iniciarSesion };