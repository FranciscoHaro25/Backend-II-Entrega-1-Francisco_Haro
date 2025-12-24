# Backend II - Entrega Final

**Alumno:** Francisco Haro  
**Comisión:** Backend II - CoderHouse  
**Fecha:** Diciembre 2025

---

## Descripción del Proyecto

Sistema e-commerce completo con autenticación JWT, autorización por roles, gestión de productos, carrito de compras y proceso de checkout con generación de tickets. Implementa el patrón de capas DAO/Repository/Service para una arquitectura limpia y mantenible.

---

## Tecnologías Utilizadas

- **Runtime:** Node.js
- **Framework:** Express.js
- **Base de Datos:** MongoDB Atlas con Mongoose
- **Autenticación:** Passport.js (Local, JWT, GitHub OAuth)
- **Encriptación:** bcrypt
- **Tokens:** jsonwebtoken (JWT)
- **Vistas:** Handlebars
- **Sesiones:** express-session con connect-mongo
- **Email:** Nodemailer

---

## Instalación

```bash
# Clonar repositorio
git clone <url-repositorio>

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar en desarrollo
npm run dev

# Iniciar en producción
npm start
```

---

## Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# MongoDB
MONGO_URL=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net
MONGO_DB_NAME=<nombre_base_datos>

# Servidor
PORT=3000
NODE_ENV=development

# Sesiones y Cookies
SESSION_SECRET=<secreto_sesion>
COOKIE_SECRET=<secreto_cookies>

# JWT
JWT_SECRET=<secreto_jwt>
JWT_EXPIRES_IN=24h

# GitHub OAuth
GITHUB_CLIENT_ID=<client_id>
GITHUB_CLIENT_SECRET=<client_secret>
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Email (Nodemailer)
MAIL_USER=<email>
MAIL_PASS=<password_aplicacion>

# URL Base
BASE_URL=http://localhost:3000
```

---

## Estructura del Proyecto

```
src/
├── app.js                    # Punto de entrada de la aplicación
├── config/
│   ├── db.js                 # Configuración de MongoDB
│   └── passport.js           # Estrategias de autenticación
├── dao/
│   ├── cart.dao.js           # Data Access Object - Carritos
│   ├── product.dao.js        # Data Access Object - Productos
│   ├── ticket.dao.js         # Data Access Object - Tickets
│   └── user.dao.js           # Data Access Object - Usuarios
├── dto/
│   ├── product.dto.js        # Data Transfer Object - Productos
│   ├── ticket.dto.js         # Data Transfer Object - Tickets
│   └── user.dto.js           # Data Transfer Object - Usuarios
├── middleware/
│   ├── auth.js               # Middleware de autenticación
│   └── authorization.js      # Middleware de autorización por roles
├── models/
│   ├── Cart.js               # Modelo Mongoose - Carrito
│   ├── Product.js            # Modelo Mongoose - Producto
│   ├── Ticket.js             # Modelo Mongoose - Ticket
│   └── User.js               # Modelo Mongoose - Usuario
├── repositories/
│   ├── cart.repository.js    # Repository Pattern - Carritos
│   ├── product.repository.js # Repository Pattern - Productos
│   ├── ticket.repository.js  # Repository Pattern - Tickets
│   └── user.repository.js    # Repository Pattern - Usuarios
├── routes/
│   ├── api-carts.js          # Rutas API REST - Carritos
│   ├── api-products.js       # Rutas API REST - Productos
│   ├── api-sessions.js       # Rutas API REST - Sesiones/Auth
│   ├── api-users.js          # Rutas API REST - Usuarios
│   ├── auth.js               # Rutas OAuth (GitHub)
│   ├── products.js           # Rutas vistas - Productos
│   ├── users-views.js        # Rutas vistas - Usuarios
│   └── views.js              # Rutas vistas generales
├── services/
│   ├── mail.service.js       # Servicio de envío de emails
│   └── userService.js        # Servicio de usuarios
└── views/
    ├── layouts/
    │   └── main.hbs          # Layout principal
    ├── current-user.hbs      # Vista usuario actual
    ├── error.hbs             # Vista de errores
    ├── forgot-password.hbs   # Vista recuperar contraseña
    ├── jwt-login.hbs         # Vista login JWT
    ├── login.hbs             # Vista login
    ├── products.hbs          # Vista productos
    ├── register.hbs          # Vista registro
    └── reset-password.hbs    # Vista restablecer contraseña
```

---

## Modelo de Usuario

```javascript
{
  first_name: String,       // Nombre
  last_name: String,        // Apellido
  email: String,            // Email (único)
  age: Number,              // Edad
  password: String,         // Contraseña (encriptada con bcrypt)
  cart: ObjectId,           // Referencia al carrito
  role: String,             // 'user', 'premium' o 'admin'
  isActive: Boolean,        // Estado de la cuenta
  lastLogin: Date,          // Último acceso
  githubId: String,         // ID de GitHub (OAuth)
  githubUsername: String    // Username de GitHub
}
```

---

## Sistema de Roles y Permisos

| Funcionalidad      | Admin | Premium | User |
| ------------------ | :---: | :-----: | :--: |
| Ver productos      |  ✅   |   ✅    |  ✅  |
| Crear productos    |  ✅   |  ✅\*   |  ❌  |
| Editar productos   |  ✅   |  ✅\*   |  ❌  |
| Eliminar productos |  ✅   |  ✅\*   |  ❌  |
| Agregar al carrito |  ❌   | ✅\*\*  |  ✅  |
| Finalizar compra   |  ❌   |   ✅    |  ✅  |
| Gestionar usuarios |  ✅   |   ❌    |  ❌  |

\*Premium solo puede gestionar sus propios productos  
\*\*Premium no puede agregar sus propios productos al carrito

---

## Endpoints API REST

### Sesiones (`/api/sessions`)

| Método | Ruta               | Descripción                   | Acceso      |
| ------ | ------------------ | ----------------------------- | ----------- |
| POST   | `/login`           | Iniciar sesión (retorna JWT)  | Público     |
| POST   | `/register`        | Registrar usuario             | Público     |
| GET    | `/current`         | Obtener usuario actual        | Autenticado |
| POST   | `/logout`          | Cerrar sesión                 | Autenticado |
| POST   | `/forgot-password` | Solicitar reset de contraseña | Público     |
| POST   | `/reset-password`  | Restablecer contraseña        | Público     |

### Productos (`/api/products`)

| Método | Ruta    | Descripción                 | Acceso          |
| ------ | ------- | --------------------------- | --------------- |
| GET    | `/`     | Listar productos (paginado) | Público         |
| GET    | `/:pid` | Obtener producto por ID     | Público         |
| POST   | `/`     | Crear producto              | Admin/Premium   |
| PUT    | `/:pid` | Actualizar producto         | Admin/Premium\* |
| DELETE | `/:pid` | Eliminar producto           | Admin/Premium\* |

### Carritos (`/api/carts`)

| Método | Ruta                  | Descripción         | Acceso       |
| ------ | --------------------- | ------------------- | ------------ |
| GET    | `/:cid`               | Obtener carrito     | User/Premium |
| POST   | `/:cid/products/:pid` | Agregar producto    | User/Premium |
| PUT    | `/:cid/products/:pid` | Actualizar cantidad | User/Premium |
| DELETE | `/:cid/products/:pid` | Eliminar producto   | User/Premium |
| DELETE | `/:cid`               | Vaciar carrito      | User/Premium |
| POST   | `/:cid/purchase`      | Finalizar compra    | User/Premium |

### Usuarios (`/api/users`)

| Método | Ruta    | Descripción        | Acceso |
| ------ | ------- | ------------------ | ------ |
| GET    | `/`     | Listar usuarios    | Admin  |
| GET    | `/:uid` | Obtener usuario    | Admin  |
| PUT    | `/:uid` | Actualizar usuario | Admin  |
| DELETE | `/:uid` | Eliminar usuario   | Admin  |

---

## Proceso de Compra

1. Usuario agrega productos al carrito
2. Al finalizar compra (`POST /api/carts/:cid/purchase`):
   - Se verifica stock de cada producto
   - Se descuenta stock de productos disponibles
   - Se genera ticket con código único
   - Se envía email de confirmación
   - Productos sin stock quedan en el carrito

### Modelo de Ticket

```javascript
{
  code: String,           // Código único (UUID)
  purchase_datetime: Date,// Fecha de compra
  amount: Number,         // Monto total
  purchaser: String,      // Email del comprador
  products: [{            // Detalle de productos
    product: ObjectId,
    title: String,
    quantity: Number,
    price: Number
  }]
}
```

---

## Autenticación

### JWT (JSON Web Token)

- Token generado tras login exitoso
- Expiración configurable (default: 24h)
- Se envía en cookie httpOnly o header Authorization
- Payload incluye: id, email, nombre, rol

### GitHub OAuth

- Autenticación con cuenta de GitHub
- Registro automático de nuevos usuarios
- Vinculación con cuenta existente por email

---

## Vistas Disponibles

| Ruta                     | Descripción            |
| ------------------------ | ---------------------- |
| `/`                      | Página de inicio       |
| `/login`                 | Formulario de login    |
| `/register`              | Formulario de registro |
| `/products`              | Catálogo de productos  |
| `/forgot-password`       | Recuperar contraseña   |
| `/reset-password/:token` | Restablecer contraseña |

---

## Características Implementadas

- [x] Autenticación con Passport.js (Local + JWT + GitHub)
- [x] Encriptación de contraseñas con bcrypt.hashSync
- [x] Sistema de roles (user, premium, admin)
- [x] Autorización por middleware
- [x] Patrón DAO/Repository
- [x] DTOs para transferencia de datos
- [x] CRUD completo de productos
- [x] Carrito de compras persistente
- [x] Proceso de checkout con tickets
- [x] Control de stock
- [x] Envío de emails (confirmación de compra, reset password)
- [x] Ruta `/current` con validación JWT
- [x] Premium no puede comprar sus propios productos
- [x] Paginación de productos

---

## Scripts Disponibles

```bash
npm start     # Inicia el servidor en producción
npm run dev   # Inicia con nodemon (desarrollo)
```

---

## Testing Manual

### Credenciales de Prueba

Para probar el sistema, registrar usuarios desde `/register` o usar la API:

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"test@test.com","password":"123456","age":25}'

# Login
curl -X POST http://localhost:3000/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

---

## Notas Técnicas

- La conexión a MongoDB utiliza el patrón Singleton
- Los passwords se encriptan con `bcrypt.hashSync()` (10 salt rounds)
- Los tokens JWT se firman con el algoritmo HS256
- Las sesiones se persisten en MongoDB con connect-mongo
- El sistema soporta múltiples estrategias de autenticación simultáneamente

---

## Autor

**Francisco Haro**  
Estudiante de Desarrollo Full Stack - CoderHouse

---
