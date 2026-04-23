const express = require("express");
const router = express.Router();

const {
  obtenerSesiones,
  generarGrupos,
  obtenerGruposPorSesion,
  guardarNotaGrupo,
} = require("../controladores/gruposControlador");

router.get("/sesiones", obtenerSesiones);
router.post("/generar", generarGrupos);
router.get("/:sesion_id", obtenerGruposPorSesion);
router.put("/nota/:grupo_id", guardarNotaGrupo);

module.exports = router;