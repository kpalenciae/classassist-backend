const conexion = require("../configuracion/conexion");
const XLSX = require("xlsx");
const fs = require("fs");

const obtenerEstudiantes = (req, res) => {
  const { clase_id } = req.query;

  let consulta = "SELECT * FROM estudiantes";
  let valores = [];

  if (clase_id) {
    consulta = "SELECT * FROM estudiantes WHERE clase_id = ?";
    valores = [clase_id];
  }

  conexion.query(consulta, valores, (error, resultados) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al obtener estudiantes" });
    }

    res.json(resultados);
  });
};

const crearEstudiante = (req, res) => {
  const { numero_lista, carne, nombre, correo, clase_id } = req.body;

  if (!carne || !nombre || !clase_id) {
    return res.status(400).json({
      mensaje: "Carné, nombre y clase son obligatorios",
    });
  }

  const consulta =
    "INSERT INTO estudiantes (numero_lista, carne, nombre, correo, clase_id) VALUES (?, ?, ?, ?, ?)";

  conexion.query(
    consulta,
    [numero_lista, carne, nombre, correo, clase_id],
    (error, resultado) => {
      if (error) {
        return res.status(500).json({ mensaje: "Error al crear estudiante" });
      }

      res.json({
        mensaje: "Estudiante creado correctamente",
        id: resultado.insertId,
      });
    }
  );
};

const actualizarEstudiante = (req, res) => {
  const { id } = req.params;
  const { numero_lista, carne, nombre, correo } = req.body;

  const consulta =
    "UPDATE estudiantes SET numero_lista = ?, carne = ?, nombre = ?, correo = ? WHERE id = ?";

  conexion.query(
    consulta,
    [numero_lista, carne, nombre, correo, id],
    (error, resultado) => {
      if (error) {
        return res.status(500).json({ mensaje: "Error al actualizar estudiante" });
      }

      res.json({ mensaje: "Estudiante actualizado correctamente" });
    }
  );
};

const eliminarEstudiante = (req, res) => {
  const { id } = req.params;

  const consulta = "DELETE FROM estudiantes WHERE id = ?";

  conexion.query(consulta, [id], (error, resultado) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al eliminar estudiante" });
    }

    res.json({ mensaje: "Estudiante eliminado correctamente" });
  });
};

const importarEstudiantesExcel = (req, res) => {
  const { clase_id } = req.body;

  if (!req.file) {
    return res.status(400).json({ mensaje: "Debes subir un archivo Excel" });
  }

  if (!clase_id) {
    return res.status(400).json({ mensaje: "Debes seleccionar una clase" });
  }

  try {
    const workbook = XLSX.readFile(req.file.path);
    const nombreHoja = workbook.SheetNames[0];
    const hoja = workbook.Sheets[nombreHoja];
    const datos = XLSX.utils.sheet_to_json(hoja);

    if (!datos || datos.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ mensaje: "El archivo está vacío" });
    }

    const estudiantesAInsertar = [];

    for (const fila of datos) {
      const numero_lista = fila["No."] || fila["No"] || "";
      const carne = fila["Carné"] || fila["Carne"] || "";
      const nombre = fila["Estudiante"] || "";
      const correo = fila["Correo Electrónico"] || fila["Correo Electronico"] || fila["Correo"] || "";

      if (!carne || !nombre) {
        continue;
      }

      estudiantesAInsertar.push([
        numero_lista,
        carne,
        nombre,
        correo,
        clase_id,
      ]);
    }

    if (estudiantesAInsertar.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        mensaje: "No se encontraron estudiantes válidos en el archivo",
      });
    }

    const consulta =
      "INSERT INTO estudiantes (numero_lista, carne, nombre, correo, clase_id) VALUES ?";

    conexion.query(consulta, [estudiantesAInsertar], (error, resultado) => {
      fs.unlinkSync(req.file.path);

      if (error) {
        return res.status(500).json({ mensaje: "Error al importar estudiantes" });
      }

      res.json({
        mensaje: "Estudiantes importados correctamente",
        cantidad: resultado.affectedRows,
      });
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error(error);
    res.status(500).json({ mensaje: "Error al procesar el archivo Excel" });
  }
};

module.exports = {
  obtenerEstudiantes,
  crearEstudiante,
  actualizarEstudiante,
  eliminarEstudiante,
  importarEstudiantesExcel,
};