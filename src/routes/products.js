const express = require("express");
const router = express.Router();
const {
  requireAuth,
  addUserToViews,
  logActivity,
} = require("../middleware/auth");

// Aplicar middleware de autenticación a todas las rutas de productos
router.use(requireAuth);
router.use(addUserToViews);

// GET /products - Página principal de productos (requiere autenticación)
router.get("/", logActivity("Acceso a productos"), (req, res) => {
  try {
    // Información adicional del usuario para el contexto (compatible con Passport)
    const user = req.user;

    res.render("products", {
      title: "Productos",
      user: user,
      isAdmin: user.role === "admin",
      welcomeMessage: `¡Bienvenido/a, ${user.firstName}!`,
    });
  } catch (error) {
    res.status(500).render("error", {
      title: "Error del servidor",
      message: "No se pudieron cargar los productos. Intenta nuevamente.",
      statusCode: 500,
    });
  }
});

// Rutas adicionales para productos (ejemplo de funcionalidad extendida)

// GET /products/admin - Panel de administración (solo para administradores)
router.get("/admin", (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).render("error", {
      title: "Acceso denegado",
      message: "No tienes permisos para acceder al panel de administración.",
      statusCode: 403,
    });
  }

  // Aquí podrías renderizar una vista de administración específica
  res.redirect("/products?admin=true");
});

// GET /products/user - Información específica del usuario
router.get("/user", (req, res) => {
  const user = req.user;

  res.json({
    message: "Información del usuario autenticado",
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      role: user.role,
      githubUsername: user.githubUsername || null,
    },
    session: {
      isAuthenticated: true,
      isAdmin: user.role === "admin",
    },
  });
});

module.exports = router;
