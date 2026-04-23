const conexion = require("../configuracion/conexion");

const obtenerRankingPorClase = (req, res) => {
  const { clase_id } = req.params;

  const consulta = `
    SELECT 
      e.id,
      e.nombre,
      e.carne,
      COUNT(p.id) AS total_participaciones,
      COALESCE(AVG(p.nota), 0) AS promedio_nota,
      COALESCE(SUM(p.nota), 0) AS total_puntos
    FROM estudiantes e
    LEFT JOIN participaciones p ON e.id = p.estudiante_id
    WHERE e.clase_id = ?
    GROUP BY e.id, e.nombre, e.carne
    ORDER BY total_puntos DESC, promedio_nota DESC, total_participaciones DESC, e.nombre ASC
  `;

  conexion.query(consulta, [clase_id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener ranking:", error);
      return res.status(500).json({ mensaje: "Error al obtener ranking" });
    }

    res.json(resultados);
  });
};

module.exports = {
  obtenerRankingPorClase,
};