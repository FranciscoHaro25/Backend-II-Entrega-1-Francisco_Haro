const passport = require("passport");

/**
 * Middleware de autorización híbrido
 * Soporta tanto JWT como sesiones de Passport
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Primero verificar si hay usuario en sesión (login tradicional)
    if (req.user) {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: "error",
          message: "No tienes permisos para realizar esta acción",
        });
      }
      return next();
    }

    // Si no hay sesión, intentar con JWT
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (err || !user) {
        return res.status(401).json({
          status: "error",
          message: "No autorizado. Debes iniciar sesión.",
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          status: "error",
          message: "No tienes permisos para realizar esta acción",
        });
      }

      req.user = user;
      next();
    })(req, res, next);
  };
};

// Roles disponibles: admin, user, premium
const isAdmin = authorize("admin");
const isUser = authorize("user");
const isPremium = authorize("premium");
const isAdminOrPremium = authorize("admin", "premium");
const isUserOrPremium = authorize("user", "premium");
const isAdminOrUser = authorize("admin", "user");
const canBuy = authorize("user", "premium"); // Usuarios que pueden comprar
const canManageProducts = authorize("admin", "premium"); // Admin y premium pueden gestionar productos

module.exports = {
  authorize,
  isAdmin,
  isUser,
  isPremium,
  isAdminOrPremium,
  isUserOrPremium,
  isAdminOrUser,
  canBuy,
  canManageProducts,
};
