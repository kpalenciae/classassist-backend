const express = require("express");
const router = express.Router();

const { iniciarSesion } = require("../controladores/autenticacionControlador");

router.post("/iniciar-sesion", iniciarSesion);

module.exports = router;