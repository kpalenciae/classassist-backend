const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use("/selfies", express.static("selfies"));

const exportacionRutas = require("./rutas/exportacionRutas");
const autenticacionRutas = require("./rutas/autenticacionRutas");
const clasesRutas = require("./rutas/clasesRutas");
const estudiantesRutas = require("./rutas/estudiantesRutas");
const asistenciasRutas = require("./rutas/asistenciasRutas");
const ruletaRutas = require("./rutas/ruletaRutas");
const gruposRutas = require("./rutas/gruposRutas");
const rankingRutas = require("./rutas/rankingRutas");

app.use("/api/autenticacion", autenticacionRutas);
app.use("/api/clases", clasesRutas);
app.use("/api/estudiantes", estudiantesRutas);
app.use("/api/asistencias", asistenciasRutas);
app.use("/api/ruleta", ruletaRutas);
app.use("/api/grupos", gruposRutas);
app.use("/api/ranking", rankingRutas);
app.use("/api/exportacion", exportacionRutas);

app.get("/", (req, res) => {
  res.json({ mensaje: "API de ClassAssist Pro funcionando" });
});

module.exports = app;