const conexion = require("../configuracion/conexion");

const obtenerSesiones = (req, res) => {
  const consulta = `
    SELECT s.id, s.fecha, s.token_qr, s.activa, c.nombre AS nombre_clase
    FROM sesiones s
    INNER JOIN clases c ON s.clase_id = c.id
    ORDER BY s.id DESC
  `;

  conexion.query(consulta, (error, resultados) => {
    if (error) {
      console.error("Error al obtener sesiones:", error);
      return res.status(500).json({ mensaje: "Error al obtener sesiones" });
    }

    res.json(resultados);
  });
};

const mezclarArreglo = (arreglo) => {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

const dividirEnGruposPorCantidad = (estudiantes, cantidadGrupos) => {
  const grupos = Array.from({ length: cantidadGrupos }, () => []);

  estudiantes.forEach((estudiante, index) => {
    grupos[index % cantidadGrupos].push(estudiante);
  });

  return grupos;
};

const dividirEnGruposPorTamano = (estudiantes, tamanoGrupo) => {
  const grupos = [];
  for (let i = 0; i < estudiantes.length; i += tamanoGrupo) {
    grupos.push(estudiantes.slice(i, i + tamanoGrupo));
  }
  return grupos;
};

const generarGrupos = (req, res) => {
  const { sesion_id, modo, valor } = req.body;

  if (!sesion_id || !modo || !valor) {
    return res.status(400).json({
      mensaje: "Sesión, modo y valor son obligatorios",
    });
  }

  const consultaPresentes = `
    SELECT e.id, e.nombre, e.carne
    FROM asistencias a
    INNER JOIN estudiantes e ON a.estudiante_id = e.id
    WHERE a.sesion_id = ?
  `;

  conexion.query(consultaPresentes, [sesion_id], (error, presentes) => {
    if (error) {
      console.error("Error al obtener estudiantes presentes:", error);
      return res.status(500).json({ mensaje: "Error al obtener estudiantes presentes" });
    }

    if (presentes.length === 0) {
      return res.status(400).json({
        mensaje: "No hay estudiantes con asistencia registrada en esta sesión",
      });
    }

    const estudiantesMezclados = mezclarArreglo(presentes);
    let gruposGenerados = [];

    if (modo === "cantidad") {
      const cantidadGrupos = parseInt(valor, 10);

      if (cantidadGrupos <= 0) {
        return res.status(400).json({ mensaje: "La cantidad de grupos debe ser mayor que cero" });
      }

      gruposGenerados = dividirEnGruposPorCantidad(estudiantesMezclados, cantidadGrupos);
    } else if (modo === "tamano") {
      const tamanoGrupo = parseInt(valor, 10);

      if (tamanoGrupo <= 0) {
        return res.status(400).json({ mensaje: "El tamaño de grupo debe ser mayor que cero" });
      }

      gruposGenerados = dividirEnGruposPorTamano(estudiantesMezclados, tamanoGrupo);
    } else {
      return res.status(400).json({ mensaje: "Modo no válido" });
    }

    const obtenerGruposExistentes = "SELECT id FROM grupos WHERE sesion_id = ?";

    conexion.query(obtenerGruposExistentes, [sesion_id], (errorExistentes, gruposExistentes) => {
      if (errorExistentes) {
        console.error("Error al buscar grupos existentes:", errorExistentes);
        return res.status(500).json({ mensaje: "Error al regenerar grupos" });
      }

      const eliminarIntegrantesYGrupos = (callback) => {
        if (gruposExistentes.length === 0) {
          return callback();
        }

        const ids = gruposExistentes.map((g) => g.id);
        const placeholders = ids.map(() => "?").join(",");

        conexion.query(
          `DELETE FROM integrantes_grupo WHERE grupo_id IN (${placeholders})`,
          ids,
          (errorDeleteIntegrantes) => {
            if (errorDeleteIntegrantes) {
              console.error("Error al eliminar integrantes:", errorDeleteIntegrantes);
              return res.status(500).json({ mensaje: "Error al regenerar grupos" });
            }

            conexion.query(
              `DELETE FROM grupos WHERE id IN (${placeholders})`,
              ids,
              (errorDeleteGrupos) => {
                if (errorDeleteGrupos) {
                  console.error("Error al eliminar grupos:", errorDeleteGrupos);
                  return res.status(500).json({ mensaje: "Error al regenerar grupos" });
                }

                callback();
              }
            );
          }
        );
      };

      eliminarIntegrantesYGrupos(() => {
        const respuestaFinal = [];
        let gruposProcesados = 0;

        gruposGenerados.forEach((grupo, index) => {
          const nombreGrupo = `Grupo ${index + 1}`;

          conexion.query(
            "INSERT INTO grupos (sesion_id, nombre_grupo, nota) VALUES (?, ?, 0)",
            [sesion_id, nombreGrupo],
            (errorInsertGrupo, resultadoGrupo) => {
              if (errorInsertGrupo) {
                console.error("Error al insertar grupo:", errorInsertGrupo);
                return res.status(500).json({ mensaje: "Error al generar grupos" });
              }

              const grupoId = resultadoGrupo.insertId;

              if (grupo.length === 0) {
                respuestaFinal.push({
                  id: grupoId,
                  nombre_grupo: nombreGrupo,
                  nota: 0,
                  integrantes: [],
                });

                gruposProcesados++;
                if (gruposProcesados === gruposGenerados.length) {
                  res.json({
                    mensaje: "Grupos generados correctamente",
                    grupos: respuestaFinal.sort((a, b) => a.id - b.id),
                  });
                }
                return;
              }

              let integrantesProcesados = 0;
              const integrantesRespuesta = [];

              grupo.forEach((estudiante) => {
                conexion.query(
                  "INSERT INTO integrantes_grupo (grupo_id, estudiante_id) VALUES (?, ?)",
                  [grupoId, estudiante.id],
                  (errorInsertIntegrante) => {
                    if (errorInsertIntegrante) {
                      console.error("Error al insertar integrante:", errorInsertIntegrante);
                      return res.status(500).json({ mensaje: "Error al generar grupos" });
                    }

                    integrantesRespuesta.push(estudiante);
                    integrantesProcesados++;

                    if (integrantesProcesados === grupo.length) {
                      respuestaFinal.push({
                        id: grupoId,
                        nombre_grupo: nombreGrupo,
                        nota: 0,
                        integrantes: integrantesRespuesta,
                      });

                      gruposProcesados++;
                      if (gruposProcesados === gruposGenerados.length) {
                        res.json({
                          mensaje: "Grupos generados correctamente",
                          grupos: respuestaFinal.sort((a, b) => a.id - b.id),
                        });
                      }
                    }
                  }
                );
              });
            }
          );
        });
      });
    });
  });
};

const obtenerGruposPorSesion = (req, res) => {
  const { sesion_id } = req.params;

  const consulta = `
    SELECT 
      g.id AS grupo_id,
      g.nombre_grupo,
      g.nota,
      e.id AS estudiante_id,
      e.nombre,
      e.carne
    FROM grupos g
    LEFT JOIN integrantes_grupo ig ON g.id = ig.grupo_id
    LEFT JOIN estudiantes e ON ig.estudiante_id = e.id
    WHERE g.sesion_id = ?
    ORDER BY g.id, e.nombre
  `;

  conexion.query(consulta, [sesion_id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener grupos:", error);
      return res.status(500).json({ mensaje: "Error al obtener grupos" });
    }

    const gruposMap = {};

    resultados.forEach((fila) => {
      if (!gruposMap[fila.grupo_id]) {
        gruposMap[fila.grupo_id] = {
          id: fila.grupo_id,
          nombre_grupo: fila.nombre_grupo,
          nota: fila.nota,
          integrantes: [],
        };
      }

      if (fila.estudiante_id) {
        gruposMap[fila.grupo_id].integrantes.push({
          id: fila.estudiante_id,
          nombre: fila.nombre,
          carne: fila.carne,
        });
      }
    });

    res.json(Object.values(gruposMap));
  });
};

const guardarNotaGrupo = (req, res) => {
  const { grupo_id } = req.params;
  const { nota } = req.body;

  const consulta = "UPDATE grupos SET nota = ? WHERE id = ?";

  conexion.query(consulta, [nota || 0, grupo_id], (error) => {
    if (error) {
      console.error("Error al guardar nota del grupo:", error);
      return res.status(500).json({ mensaje: "Error al guardar nota del grupo" });
    }

    res.json({ mensaje: "Nota del grupo guardada correctamente" });
  });
};

module.exports = {
  obtenerSesiones,
  generarGrupos,
  obtenerGruposPorSesion,
  guardarNotaGrupo,
};