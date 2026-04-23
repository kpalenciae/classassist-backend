require("dotenv").config();
const app = require("./app");

const PUERTO = process.env.PUERTO || 4000;

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en el puerto ${PUERTO}`);
});