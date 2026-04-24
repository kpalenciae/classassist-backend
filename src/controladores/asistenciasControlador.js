const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL;
const conexion = require("../configuracion/conexion");
const QRCode = require("qrcode");

const crearSesionQR = async (req, res) => {
  const { clase_id } = req.body;

  if (!clase_id) {
    return res.status(400).json({ mensaje: "La clase es obligatoria" });
  }

  const token = `QR_${clase_id}_${Date.now()}`;
  const fecha = new Date().toISOString().split("T")[0];

  const consulta =
    "INSERT INTO sesiones (clase_id, token_qr, fecha, activa) VALUES (?, ?, ?, 1)";

  conexion.query(consulta, [clase_id, token, fecha], async (error, resultado) => {
    if (error) {
      console.error("Error al crear sesión QR:", error);
      return res.status(500).json({ mensaje: "Error al crear sesión QR" });
    }

    const sesion_id = resultado.insertId;
    const enlace = `${FRONTEND_URL}/asistencia/${token}`;

    try {
      const qrBase64 = await QRCode.toDataURL(enlace);

      res.json({
        mensaje: "Sesión creada correctamente",
        sesion_id,
        token,
        enlace,
        qr: qrBase64,
      });
    } catch (err) {
      console.error("Error al generar QR:", err);
      res.status(500).json({ mensaje: "Error al generar QR" });
    }
  });
};

const obtenerSesionPorToken = (req, res) => {
  const { token } = req.params;

  const consulta = `
    SELECT 
      s.id,
      s.token_qr,
      s.fecha,
      s.activa,
      s.clase_id,
      c.nombre AS nombre_clase
    FROM sesiones s
    INNER JOIN clases c ON s.clase_id = c.id
    WHERE s.token_qr = ?
    LIMIT 1
  `;

  conexion.query(consulta, [token], (error, resultados) => {
    if (error) {
      console.error("Error al obtener sesión por token:", error);
      return res.status(500).json({ mensaje: "Error al obtener sesión" });
    }

    if (resultados.length === 0) {
      return res.status(404).json({ mensaje: "Sesión no encontrada" });
    }

    res.json(resultados[0]);
  });
};
const obtenerEstudiantesPorClase = (req, res) => {
  const { clase_id } = req.params;

  const consulta = "SELECT * FROM estudiantes WHERE clase_id = ?";

  conexion.query(consulta, [clase_id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener estudiantes:", error);
      return res.status(500).json({ mensaje: "Error al obtener estudiantes" });
    }

    res.json(resultados);
  });
};

const registrarAsistencia = (req, res) => {
  const { token_qr, estudiante_id } = req.body;

  if (!token_qr || !estudiante_id) {
    return res.status(400).json({
      mensaje: "Token y estudiante son obligatorios",
    });
  }

  const consultaSesion = `
    SELECT id, clase_id, activa
    FROM sesiones
    WHERE token_qr = ?
    LIMIT 1
  `;

  conexion.query(consultaSesion, [token_qr], (errorSesion, resultadosSesion) => {
    if (errorSesion) {
      console.error("Error al buscar sesión:", errorSesion);
      return res.status(500).json({ mensaje: "Error al buscar sesión" });
    }

    if (resultadosSesion.length === 0) {
      return res.status(404).json({ mensaje: "Sesión no encontrada" });
    }

    const sesion = resultadosSesion[0];

    if (Number(sesion.activa) !== 1) {
      return res.status(400).json({ mensaje: "Sesión inactiva" });
    }

    const consultaDuplicado = `
      SELECT id
      FROM asistencias
      WHERE sesion_id = ? AND estudiante_id = ?
      LIMIT 1
    `;

    conexion.query(
      consultaDuplicado,
      [sesion.id, estudiante_id],
      (errorDuplicado, resultadosDuplicado) => {
        if (errorDuplicado) {
          console.error("Error al validar duplicado:", errorDuplicado);
          return res.status(500).json({ mensaje: "Error al validar asistencia" });
        }

        if (resultadosDuplicado.length > 0) {
          return res.status(400).json({
            mensaje: "Este estudiante ya registró asistencia",
          });
        }

        const selfie = req.file ? req.file.filename : null;

        const insertarAsistencia = `
          INSERT INTO asistencias (sesion_id, estudiante_id, selfie)
          VALUES (?, ?, ?)
        `;

        conexion.query(
          insertarAsistencia,
          [sesion.id, estudiante_id, selfie],
          (errorInsert, resultadoInsert) => {
            if (errorInsert) {
              console.error("Error al registrar asistencia:", errorInsert);
              return res.status(500).json({
                mensaje: "Error al registrar asistencia",
                error: errorInsert.sqlMessage || errorInsert.message,
              });
            }

            return res.json({
              mensaje: "Asistencia registrada correctamente",
              id: resultadoInsert.insertId,
              selfie: selfie ? `/selfies/${selfie}` : null,
            });
          }
        );
      }
    );
  });
};

const obtenerAsistenciasPorSesion = (req, res) => {
  const { sesion_id } = req.params;

  const consulta = `
    SELECT 
      a.id,
      a.fecha_registro,
      a.selfie,
      e.nombre,
      e.carne
    FROM asistencias a
    INNER JOIN estudiantes e ON a.estudiante_id = e.id
    WHERE a.sesion_id = ?
    ORDER BY a.fecha_registro ASC
  `;

  conexion.query(consulta, [sesion_id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener asistencias:", error);
      return res.status(500).json({ mensaje: "Error al obtener asistencias" });
    }

    const asistenciasConUrl = resultados.map((item) => ({
      ...item,
      selfie_url: item.selfie
  ? `${BACKEND_URL}/selfies/${item.selfie}`
  : null,
    }));

    res.json(asistenciasConUrl);
  });
};

const obtenerUltimaSesionPorClase = (req, res) => {
  const { clase_id } = req.params;

  const consulta = `
    SELECT s.*, c.nombre AS nombre_clase
    FROM sesiones s
    INNER JOIN clases c ON s.clase_id = c.id
    WHERE s.clase_id = ?
    ORDER BY s.id DESC
    LIMIT 1
  `;

  conexion.query(consulta, [clase_id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener última sesión:", error);
      return res.status(500).json({ mensaje: "Error al obtener última sesión" });
    }

    if (resultados.length === 0) {
      return res.json(null);
    }

    res.json(resultados[0]);
  });
};

module.exports = {
  crearSesionQR,
  obtenerSesionPorToken,
  obtenerEstudiantesPorClase,
  registrarAsistencia,
  obtenerAsistenciasPorSesion,
  obtenerUltimaSesionPorClase,
};