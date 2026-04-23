const express = require("express");
const router = express.Router();
const uploadSelfie = require("../middleware/subidaSelfie");

const {
  crearSesionQR,
  obtenerSesionPorToken,
  obtenerEstudiantesPorClase,
  registrarAsistencia,
  obtenerAsistenciasPorSesion,
  obtenerUltimaSesionPorClase,
} = require("../controladores/asistenciasControlador");

router.post("/sesion", crearSesionQR);
router.get("/sesion/:token", obtenerSesionPorToken);
router.get("/estudiantes-clase/:clase_id", obtenerEstudiantesPorClase);
router.post("/registrar", uploadSelfie.single("selfie"), registrarAsistencia);
router.get("/lista/:sesion_id", obtenerAsistenciasPorSesion);
router.get("/ultima-sesion/:clase_id", obtenerUltimaSesionPorClase);

module.exports = router;