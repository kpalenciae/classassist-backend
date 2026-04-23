const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "selfies/");
  },
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + path.extname(file.originalname);
    cb(null, nombreUnico);
  },
});

const filtroArchivo = (req, file, cb) => {
  const tiposPermitidos = [".jpg", ".jpeg", ".png", ".webp"];
  const extension = path.extname(file.originalname).toLowerCase();

  if (tiposPermitidos.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes .jpg, .jpeg, .png, .webp"));
  }
};

const uploadSelfie = multer({
  storage,
  fileFilter: filtroArchivo,
});

module.exports = uploadSelfie;