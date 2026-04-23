const conexion = require("../configuracion/conexion");

const obtenerClases = (req, res) => {
  const consulta = "SELECT * FROM clases";

  conexion.query(consulta, (error, resultados) => {
    if (error) {
      console.error("Error al obtener clases:", error);
      return res.status(500).json({ mensaje: "Error al obtener clases" });
    }

    res.json(resultados);
  });
};

const crearClase = (req, res) => {
  const { nombre, seccion, horario, docente_id } = req.body;

  const consulta =
    "INSERT INTO clases (nombre, seccion, horario, docente_id) VALUES (?, ?, ?, ?)";

  conexion.query(
    consulta,
    [nombre, seccion, horario, docente_id],
    (error, resultado) => {
      if (error) {
        console.error("Error al crear clase:", error);
        return res.status(500).json({ mensaje: "Error al crear clase" });
      }

      res.json({
        mensaje: "Clase creada correctamente",
        id: resultado.insertId,
      });
    }
  );
};

const actualizarClase = (req, res) => {
  const { id } = req.params;
  const { nombre, seccion, horario } = req.body;

  const consulta =
    "UPDATE clases SET nombre = ?, seccion = ?, horario = ? WHERE id = ?";

  conexion.query(consulta, [nombre, seccion, horario, id], (error) => {
    if (error) {
      console.error("Error al actualizar clase:", error);
      return res.status(500).json({ mensaje: "Error al actualizar clase" });
    }

    res.json({ mensaje: "Clase actualizada correctamente" });
  });
};

const eliminarClase = (req, res) => {
  const { id } = req.params;

  const consulta = "DELETE FROM clases WHERE id = ?";

  conexion.query(consulta, [id], (error) => {
    if (error) {
      console.error("Error al eliminar clase:", error);
      return res.status(500).json({ mensaje: "Error al eliminar clase" });
    }

    res.json({ mensaje: "Clase eliminada correctamente" });
  });
};

module.exports = {
  obtenerClases,
  crearClase,
  actualizarClase,
  eliminarClase,
};