const express = require("express");
const router = express.Router();
const {
  redirectIfAuthenticated,
  addUserToViews,
} = require("../middleware/auth");

// Aplicar middleware para agregar información del usuario a todas las vistas
router.use(addUserToViews);

// GET / - Página principal (redirige según estado de autenticación con Passport)
router.get("/", (req, res) => {
  if (req.user) {
    res.redirect("/products");
  } else {
    res.redirect("/login");
  }
});

// GET /login - Mostrar página de login
router.get("/login", redirectIfAuthenticated, (req, res) => {
  const message = req.query.message;
  const error = req.query.error;

  res.render("login", {
    title: "Iniciar Sesión",
    message,
    error,
  });
});

// GET /register - Mostrar página de registro
router.get("/register", redirectIfAuthenticated, (req, res) => {
  const error = req.query.error;

  res.render("register", {
    title: "Crear Cuenta",
    error,
  });
});

// GET /forgot-password - Mostrar página de recuperación
router.get("/forgot-password", redirectIfAuthenticated, (req, res) => {
  res.render("forgot-password", {
    title: "Recuperar Contraseña",
  });
});

// GET /reset-password/:token - Mostrar página para restablecer contraseña
router.get("/reset-password/:token", redirectIfAuthenticated, (req, res) => {
  res.render("reset-password", {
    title: "Restablecer Contraseña",
    token: req.params.token,
  });
});

module.exports = router;
