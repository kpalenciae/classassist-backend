const express = require("express");
const router = express.Router();

const { obtenerRankingPorClase } = require("../controladores/rankingControlador");

router.get("/:clase_id", obtenerRankingPorClase);

module.exports = router;