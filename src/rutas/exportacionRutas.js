const express = require("express");
const router = express.Router();

const {
  exportarEstudiantes,
  exportarAsistenciasUltimaSesion,
  exportarRanking,
} = require("../controladores/exportacionControlador");

router.get("/estudiantes/:clase_id", exportarEstudiantes);
router.get("/asistencias/:clase_id", exportarAsistenciasUltimaSesion);
router.get("/ranking/:clase_id", exportarRanking);

module.exports = router;