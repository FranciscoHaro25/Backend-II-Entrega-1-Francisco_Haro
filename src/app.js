const express = require("express");
const { engine } = require("express-handlebars");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const { connectDB } = require("./config/db");
const apiUsersRoutes = require("./routes/api-users");
const usersViewsRoutes = require("./routes/users-views");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const viewRoutes = require("./routes/views");

const app = express();
const PORT = process.env.PORT || 3000;

async function initializeDatabase() {
  try {
    await connectDB();
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }
}

app.engine(
  "hbs",
  engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: {
      eq: function (a, b) {
        return a === b;
      },
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      dbName: process.env.MONGO_DB_NAME,
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
      touchAfter: 24 * 3600,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

const passport = require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.isAuthenticated = !!req.user;
  res.locals.isAdmin = req.user?.role === "admin";
  next();
});

app.use("/api/users", apiUsersRoutes);
app.use("/users", usersViewsRoutes);

const apiSessionsRoutes = require("./routes/api-sessions");
app.use("/api/sessions", apiSessionsRoutes);

app.use("/", viewRoutes);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);

app.use("*", (req, res) => {
  res.status(404).render("error", {
    title: "Página no encontrada",
    message: "La página que buscas no existe.",
    statusCode: 404,
  });
});

app.use((err, req, res, next) => {
  res.status(500).render("error", {
    title: "Error del servidor",
    message: "Ha ocurrido un error interno del servidor.",
    statusCode: 500,
  });
});

async function startServer() {
  try {
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });

    process.on("SIGTERM", async () => {
      server.close(() => {
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Error al iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
