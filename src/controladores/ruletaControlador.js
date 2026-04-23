const conexion = require("../configuracion/conexion");

const obtenerEstudiantesPresentes = (req, res) => {
  const { sesion_id } = req.params;

  const consulta = `
    SELECT e.id, e.nombre, e.carne
    FROM asistencias a
    INNER JOIN estudiantes e ON a.estudiante_id = e.id
    WHERE a.sesion_id = ?
  `;

  conexion.query(consulta, [sesion_id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener estudiantes presentes:", error);
      return res.status(500).json({ mensaje: "Error al obtener estudiantes presentes" });
    }

    res.json(resultados);
  });
};

const seleccionarAleatorio = (req, res) => {
  const { sesion_id } = req.params;

  const consulta = `
    SELECT e.id, e.nombre, e.carne
    FROM asistencias a
    INNER JOIN estudiantes e ON a.estudiante_id = e.id
    WHERE a.sesion_id = ?
  `;

  conexion.query(consulta, [sesion_id], (error, resultados) => {
    if (error) {
      console.error("Error al seleccionar estudiante:", error);
      return res.status(500).json({ mensaje: "Error al seleccionar estudiante" });
    }

    if (resultados.length === 0) {
      return res.status(404).json({ mensaje: "No hay estudiantes presentes en esta sesión" });
    }

    const indice = Math.floor(Math.random() * resultados.length);
    res.json(resultados[indice]);
  });
};

const guardarParticipacion = (req, res) => {
  const { sesion_id, estudiante_id, nota, comentario } = req.body;

  if (!sesion_id || !estudiante_id) {
    return res.status(400).json({
      mensaje: "Sesión y estudiante son obligatorios",
    });
  }

  const consulta = `
    INSERT INTO participaciones (sesion_id, estudiante_id, nota, comentario)
    VALUES (?, ?, ?, ?)
  `;

  conexion.query(
    consulta,
    [sesion_id, estudiante_id, nota || 0, comentario || ""],
    (error, resultado) => {
      if (error) {
        console.error("Error al guardar participación:", error);
        return res.status(500).json({ mensaje: "Error al guardar participación" });
      }

      res.json({ mensaje: "Participación guardada correctamente" });
    }
  );
};

const obtenerParticipacionesPorSesion = (req, res) => {
  const { sesion_id } = req.params;

  const consulta = `
    SELECT p.id, p.nota, p.comentario, p.creada_en, e.nombre, e.carne
    FROM participaciones p
    INNER JOIN estudiantes e ON p.estudiante_id = e.id
    WHERE p.sesion_id = ?
    ORDER BY p.creada_en DESC
  `;

  conexion.query(consulta, [sesion_id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener participaciones:", error);
      return res.status(500).json({ mensaje: "Error al obtener participaciones" });
    }

    res.json(resultados);
  });
};

module.exports = {
  obtenerEstudiantesPresentes,
  seleccionarAleatorio,
  guardarParticipacion,
  obtenerParticipacionesPorSesion,
};