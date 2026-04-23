const express = require("express");
const router = express.Router();

const {
  obtenerEstudiantesPresentes,
  seleccionarAleatorio,
  guardarParticipacion,
  obtenerParticipacionesPorSesion,
} = require("../controladores/ruletaControlador");

router.get("/presentes/:sesion_id", obtenerEstudiantesPresentes);
router.get("/aleatorio/:sesion_id", seleccionarAleatorio);
router.post("/guardar", guardarParticipacion);
router.get("/participaciones/:sesion_id", obtenerParticipacionesPorSesion);

module.exports = router;