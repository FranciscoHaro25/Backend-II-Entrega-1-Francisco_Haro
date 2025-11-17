# Backend II - Primera Entrega

## Sistema de Autenticación y Autorización

**Comisión:** 85605 - Backend II: DISEÑO Y ARQUITECTURA BACKEND  
**Alumno:** Francisco Haro  
**Fecha:** Noviembre 2024

---

## Descripción del Proyecto

Este proyecto implementa un sistema completo de autenticación y autorización para usuarios, desarrollado como parte de la primera entrega del curso Backend II de CoderHouse.

El sistema permite registro e inicio de sesión de usuarios utilizando diferentes estrategias de autenticación, incluyendo autenticación local tradicional, tokens JWT y OAuth con GitHub.

## Tecnologías Utilizadas

- **Node.js** con Express.js como framework principal
- **MongoDB Atlas** para persistencia de datos
- **Passport.js** para manejo de estrategias de autenticación
- **JWT (JSON Web Tokens)** para autenticación stateless
- **bcrypt** para encriptación de contraseñas
- **Handlebars** como motor de plantillas
- **GitHub OAuth** para autenticación social

## Estructura del Modelo de Usuario

El modelo `User` implementa todos los campos requeridos por la consigna:

```javascript
{
  first_name: String,    // Nombre del usuario
  last_name: String,     // Apellido del usuario
  email: String,         // Email único (índice único)
  age: Number,           // Edad del usuario
  password: String,      // Contraseña encriptada con bcrypt
  cart: ObjectId,        // Referencia al carrito del usuario
  role: String          // Rol del usuario (default: 'user')
}
```

## Funcionalidades Implementadas

### Encriptación de Contraseñas

- Utilización de `bcrypt.hashSync()` según especificaciones de la consigna
- Configuración de salt rounds en 10 para mayor seguridad
- Comparación segura de contraseñas durante el login

### Estrategias de Autenticación con Passport.js

1. **Estrategia Local (Login):** Validación de credenciales email/contraseña
2. **Estrategia Local (Register):** Registro de nuevos usuarios
3. **Estrategia JWT:** Validación de tokens para rutas protegidas
4. **Estrategia GitHub OAuth:** Autenticación mediante GitHub (funcionalidad adicional)

### Sistema JWT

- Generación automática de tokens JWT tras login exitoso
- Configuración de expiración de tokens (24 horas)
- Middleware de validación para rutas protegidas
- Almacenamiento seguro en cookies HTTP-only

## Estructura de Rutas API

### Rutas de Sesiones (`/api/sessions`)

- `POST /login` - Autenticación de usuario y generación de JWT
- `POST /register` - Registro de nuevo usuario
- `GET /current` - Obtención de datos del usuario autenticado (requiere JWT)
- `POST /logout` - Cierre de sesión y limpieza de cookies

### Rutas de Usuarios (`/api/users`)

- `GET /` - Listado de todos los usuarios
- `POST /` - Creación de nuevo usuario
- `GET /:id` - Obtención de usuario específico por ID
- `PUT /:id` - Actualización de datos de usuario
- `DELETE /:id` - Eliminación de usuario

## Arquitectura del Sistema

### Configuración de Base de Datos

- **MongoDB Atlas** como servicio de base de datos en la nube
- Base de datos: `backendII`
- Modelos implementados: User, Cart, Product
- Índices únicos en campos críticos como email

### Middleware de Autenticación

- Middleware personalizado para validación de JWT
- Protección de rutas sensibles
- Manejo de errores de autenticación

### Manejo de Sesiones

- Configuración de express-session
- Integración con Passport.js para serialización de usuarios
- Soporte para múltiples estrategias de autenticación

## Instalación y Configuración

### Prerrequisitos

- Node.js versión 16 o superior
- MongoDB Atlas (cuenta configurada)
- Variables de entorno configuradas

### Instalación

```bash
npm install
```

### Variables de Entorno

Crear archivo `.env` con las siguientes variables:

```
MONGO_URL=mongodb+srv://usuario:password@cluster.mongodb.net/backendII
JWT_SECRET=tu_jwt_secret_aqui
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
SESSION_SECRET=tu_session_secret
```

### Ejecución

```bash
npm start
```

El servidor se ejecutará en `http://localhost:8080`

## Estructura de Archivos

```
src/
├── app.js                 # Configuración principal de la aplicación
├── config/
│   ├── database.js        # Configuración de MongoDB
│   ├── db.js             # Conexión a base de datos
│   └── passport.js       # Configuración de estrategias Passport
├── middleware/
│   └── auth.js           # Middleware de autenticación
├── models/
│   ├── User.js           # Modelo de Usuario
│   ├── Cart.js           # Modelo de Carrito
│   └── Product.js        # Modelo de Producto
├── routes/
│   ├── api-users.js      # Rutas API para usuarios
│   ├── api-sessions.js   # Rutas API para sesiones
│   ├── auth.js           # Rutas de autenticación
│   └── views.js          # Rutas de vistas
├── services/
│   └── userService.js    # Servicios de usuario
└── views/
    ├── layouts/
    │   └── main.hbs      # Layout principal
    ├── login.hbs         # Vista de login
    ├── register.hbs      # Vista de registro
    └── current-user.hbs  # Vista de usuario actual
```

## Funcionalidades Clave Implementadas

### 1. Ruta `/current` según Consigna

- Implementación completa de la ruta `GET /api/sessions/current`
- Validación mediante estrategia JWT de Passport
- Retorna información completa del usuario autenticado
- Manejo adecuado de errores para tokens inválidos

### 2. CRUD Completo de Usuarios

- Operaciones completas de Create, Read, Update, Delete
- Validaciones de datos en todas las operaciones
- Encriptación automática de contraseñas en creación/actualización

### 3. Sistema de Autenticación Robusto

- Múltiples estrategias de autenticación
- Tokens JWT con expiración configurable
- Logout completo con limpieza de cookies
- Protección de rutas mediante middleware

## Consideraciones de Seguridad

- Encriptación de contraseñas con bcrypt
- Tokens JWT con tiempo de expiración
- Validación de datos de entrada
- Protección contra inyección de código
- Configuración segura de cookies

## Pruebas y Validación

El sistema ha sido probado en todos sus endpoints y funcionalidades:

- Registro de usuarios nuevos
- Login con credenciales válidas
- Validación de tokens JWT
- Protección de rutas
- Operaciones CRUD completas
- Autenticación con GitHub OAuth

---

**Nota:** Este proyecto cumple con todos los requerimientos especificados en la consigna de la Primera Entrega de Backend II, implementando un sistema completo de autenticación y autorización con las tecnologías requeridas.
