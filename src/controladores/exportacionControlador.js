const conexion = require("../configuracion/conexion");
const XLSX = require("xlsx");

const exportarEstudiantes = (req, res) => {
  const { clase_id } = req.params;

  const consulta = `
    SELECT 
      e.numero_lista AS "No.",
      e.carne AS "Carné",
      e.nombre AS "Estudiante",
      e.correo AS "Correo Electrónico"
    FROM estudiantes e
    WHERE e.clase_id = ?
    ORDER BY e.nombre ASC
  `;

  conexion.query(consulta, [clase_id], (error, resultados) => {
    if (error) {
      console.error("Error al exportar estudiantes:", error);
      return res.status(500).json({ mensaje: "Error al exportar estudiantes" });
    }

    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.json_to_sheet(resultados);
    XLSX.utils.book_append_sheet(libro, hoja, "Estudiantes");

    const buffer = XLSX.write(libro, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=estudiantes_clase_${clase_id}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  });
};

const exportarAsistenciasUltimaSesion = (req, res) => {
  const { clase_id } = req.params;

  const consultaSesion = `
    SELECT id, fecha
    FROM sesiones
    WHERE clase_id = ?
    ORDER BY id DESC
    LIMIT 1
  `;

  conexion.query(consultaSesion, [clase_id], (errorSesion, sesiones) => {
    if (errorSesion) {
      console.error("Error al buscar sesión:", errorSesion);
      return res.status(500).json({ mensaje: "Error al buscar la sesión" });
    }

    if (sesiones.length === 0) {
      return res.status(404).json({ mensaje: "No hay sesiones para esta clase" });
    }

    const sesion = sesiones[0];

    const consultaAsistencia = `
      SELECT
        e.numero_lista AS "No.",
        e.carne AS "Carné",
        e.nombre AS "Estudiante",
        e.correo AS "Correo Electrónico",
        a.fecha_registro AS "Fecha Registro"
      FROM asistencias a
      INNER JOIN estudiantes e ON a.estudiante_id = e.id
      WHERE a.sesion_id = ?
      ORDER BY a.fecha_registro ASC
    `;

    conexion.query(
      consultaAsistencia,
      [sesion.id],
      (errorAsistencia, resultados) => {
        if (errorAsistencia) {
          console.error("Error al exportar asistencias:", errorAsistencia);
          return res.status(500).json({ mensaje: "Error al exportar asistencias" });
        }

        const libro = XLSX.utils.book_new();
        const hoja = XLSX.utils.json_to_sheet(resultados);
        XLSX.utils.book_append_sheet(libro, hoja, "Asistencias");

        const buffer = XLSX.write(libro, { type: "buffer", bookType: "xlsx" });

        res.setHeader(
          "Content-Disposition",
          `attachment; filename=asistencias_clase_${clase_id}_sesion_${sesion.id}.xlsx`
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.send(buffer);
      }
    );
  });
};

const exportarRanking = (req, res) => {
  const { clase_id } = req.params;

  const consulta = `
    SELECT 
      e.nombre AS "Estudiante",
      e.carne AS "Carné",
      COUNT(p.id) AS "Total Participaciones",
      COALESCE(AVG(p.nota), 0) AS "Promedio Nota",
      COALESCE(SUM(p.nota), 0) AS "Total Puntos"
    FROM estudiantes e
    LEFT JOIN participaciones p ON e.id = p.estudiante_id
    WHERE e.clase_id = ?
    GROUP BY e.id, e.nombre, e.carne
    ORDER BY \`Total Puntos\` DESC, \`Promedio Nota\` DESC, \`Total Participaciones\` DESC, e.nombre ASC
  `;

  conexion.query(consulta, [clase_id], (error, resultados) => {
    if (error) {
      console.error("Error al exportar ranking:", error);
      return res.status(500).json({ mensaje: "Error al exportar ranking" });
    }

    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.json_to_sheet(resultados);
    XLSX.utils.book_append_sheet(libro, hoja, "Ranking");

    const buffer = XLSX.write(libro, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ranking_clase_${clase_id}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  });
};

module.exports = {
  exportarEstudiantes,
  exportarAsistenciasUltimaSesion,
  exportarRanking,
};