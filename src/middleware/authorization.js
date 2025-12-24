const passport = require("passport");

const authorize = (...roles) => {
  return (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (err || !user) {
        return res.status(401).json({
          status: "error",
          message: "No autorizado",
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

const isAdmin = authorize("admin");
const isUser = authorize("user");
const isAdminOrUser = authorize("admin", "user");

module.exports = {
  authorize,
  isAdmin,
  isUser,
  isAdminOrUser,
};
