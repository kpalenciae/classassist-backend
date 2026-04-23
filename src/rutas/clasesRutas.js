const express = require("express");
const router = express.Router();

const {
  obtenerClases,
  crearClase,
  actualizarClase,
  eliminarClase,
} = require("../controladores/clasesControlador");

router.get("/", obtenerClases);
router.post("/", crearClase);
router.put("/:id", actualizarClase);
router.delete("/:id", eliminarClase);

module.exports = router;