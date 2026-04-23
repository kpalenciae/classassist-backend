const express = require("express");
const router = express.Router();

const {
  obtenerEstudiantes,
  crearEstudiante,
  actualizarEstudiante,
  eliminarEstudiante,
  importarEstudiantesExcel,
} = require("../controladores/estudiantesControlador");

const upload = require("../middleware/subidaExcel");

router.get("/", obtenerEstudiantes);
router.post("/", crearEstudiante);
router.put("/:id", actualizarEstudiante);
router.delete("/:id", eliminarEstudiante);
router.post("/importar-excel", upload.single("archivo"), importarEstudiantesExcel);

module.exports = router;