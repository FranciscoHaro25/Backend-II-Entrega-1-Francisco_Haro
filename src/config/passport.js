const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");
const bcrypt = require("bcrypt");

/**
 * Configuración de Passport.js con estrategias Local y GitHub
 * Reemplaza la lógica manual de autenticación por un sistema profesional
 */

// Serialización de usuario para sesiones
passport.serializeUser((user, done) => {
  console.log("🔐 Serializando usuario:", user._id);
  done(null, user._id);
});

// Deserialización de usuario desde sesiones
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log(
      "🔓 Deserializando usuario:",
      user ? user.email : "No encontrado"
    );
    done(null, user);
  } catch (error) {
    console.error("❌ Error deserializando usuario:", error);
    done(error, null);
  }
});

/**
 * ESTRATEGIA LOCAL - Para login/registro con email y password
 */
passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        console.log("🔍 Intentando login local para:", email);

        // Buscar usuario por email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          console.log("❌ Usuario no encontrado:", email);
          return done(null, false, {
            message: "Email o contraseña incorrectos",
          });
        }

        // Verificar contraseña con bcrypt
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          console.log("❌ Contraseña incorrecta para:", email);
          return done(null, false, {
            message: "Email o contraseña incorrectos",
          });
        }

        console.log("✅ Login exitoso para:", user.email, `(${user.role})`);
        return done(null, user);
      } catch (error) {
        console.error("❌ Error en estrategia local login:", error);
        return done(error);
      }
    }
  )
);

/**
 * ESTRATEGIA LOCAL PARA REGISTRO
 */
passport.use(
  "local-register",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        console.log("📝 Intentando registro local para:", email);

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
          console.log("❌ Usuario ya existe:", email);
          return done(null, false, {
            message: "Este email ya está registrado",
          });
        }

        // Extraer datos del formulario
        const { firstName, lastName, age } = req.body;

        // Validar datos requeridos
        if (!firstName || !lastName || !age) {
          return done(null, false, {
            message: "Todos los campos son obligatorios",
          });
        }

        // Hashear contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear nuevo usuario
        const newUser = new User({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          age: parseInt(age),
          role: "user", // Por defecto todos son usuarios normales
        });

        // Guardar en base de datos
        const savedUser = await newUser.save();
        console.log("✅ Usuario registrado exitosamente:", savedUser.email);

        return done(null, savedUser);
      } catch (error) {
        console.error("❌ Error en estrategia local registro:", error);
        return done(error);
      }
    }
  )
);

/**
 * ESTRATEGIA GITHUB OAUTH
 */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🐙 Autenticando con GitHub:", profile.username);

        // Buscar usuario existente por GitHub ID
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          console.log("✅ Usuario GitHub existente:", user.email);
          return done(null, user);
        }

        // Buscar por email si existe
        if (profile.emails && profile.emails.length > 0) {
          const email = profile.emails[0].value;
          user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
            // Vincular cuenta existente con GitHub
            user.githubId = profile.id;
            user.githubUsername = profile.username;
            await user.save();
            console.log(
              "🔗 Cuenta existente vinculada con GitHub:",
              user.email
            );
            return done(null, user);
          }
        }

        // Crear nuevo usuario desde GitHub
        const newUser = new User({
          githubId: profile.id,
          githubUsername: profile.username,
          firstName: profile.displayName
            ? profile.displayName.split(" ")[0]
            : profile.username,
          lastName: profile.displayName
            ? profile.displayName.split(" ").slice(1).join(" ")
            : "",
          email:
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value.toLowerCase()
              : `${profile.username}@github.local`,
          age: 25, // Edad por defecto para usuarios de GitHub
          role: "user",
          // No se requiere password para usuarios OAuth
          password: null,
        });

        const savedUser = await newUser.save();
        console.log("✅ Nuevo usuario creado desde GitHub:", savedUser.email);

        return done(null, savedUser);
      } catch (error) {
        console.error("❌ Error en estrategia GitHub:", error);
        return done(error);
      }
    }
  )
);

module.exports = passport;
