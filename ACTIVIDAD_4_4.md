# Actividad Práctica 4.4 - Práctica de Integración JWT

## ✅ Implementación Completa

### 🏗 Estructura del Servidor

- ✅ **Servidor Express** configurado y funcionando
- ✅ **Dos rutas base implementadas:**
  - `/api/users` - Servicios REST con JWT
  - `/users` - Vistas con Handlebars

### 🗄 Base de Datos

- ✅ **Base de datos:** `integrative_practice` en MongoDB Atlas
- ✅ **Colección:** `users`
- ✅ **Conexión exitosa** verificada

### 📄 Schema de Usuarios (Mongoose)

```javascript
{
  firstName: String,     // first_name (nombre)
  lastName: String,      // last_name (apellido)
  email: String,         // único
  role: String,          // default: 'user'
  password: String,      // hasheado con bcrypt
  age: Number,           // requerido por schema existente
  // ... otros campos técnicos
}
```

### 🔧 Rutas y Funcionalidades

#### API REST (/api/users) - CRUD Completo:

- ✅ `GET /api/users` - Obtener todos los usuarios
- ✅ `POST /api/users` - Crear nuevo usuario (password hasheado)
- ✅ `GET /api/users/:id` - Obtener usuario por ID
- ✅ `PUT /api/users/:id` - Actualizar usuario
- ✅ `DELETE /api/users/:id` - Eliminar usuario

#### Autenticación JWT:

- ✅ `POST /api/users/login` - Login con JWT
- ✅ `POST /api/users/logout` - Logout (limpiar cookie)

### 🔐 Ruta de Login

- ✅ **Ruta:** `POST /api/users/login`
- ✅ **Validación:** Email y contraseña con bcrypt
- ✅ **JWT generado** con datos del usuario
- ✅ **Cookie firmada:** `currentUser` con el JWT

### 🎨 Vistas con Handlebars

#### `/users/login` - Formulario de Login:

- ✅ **Vista responsive** con Bootstrap
- ✅ **Formulario** para email y contraseña
- ✅ **Validaciones** frontend y backend
- ✅ **Credenciales de prueba** mostradas

#### `/users/current` - Datos del Usuario:

- ✅ **Datos básicos no sensibles:**
  - Nombre (firstName)
  - Apellido (lastName)
  - Email
  - Rol
  - ID de usuario
- ✅ **Información técnica** de la sesión JWT

### 🛡 Validaciones de Acceso

#### Login Exitoso:

- ✅ **Redirige a:** `/users/current`
- ✅ **JWT almacenado** en cookie firmada
- ✅ **Sesión activa** mantenida

#### Login Fallido:

- ✅ **Redirige a:** `/users/login?error=Login failed!`
- ✅ **Mensaje de error** mostrado en vista

#### Protección de Rutas:

- ✅ **Usuario no logueado** NO puede acceder a `/users/current`
- ✅ **Usuario logueado** NO puede acceder a `/users/login`
- ✅ **Redirecciones automáticas** implementadas

## 🚀 Cómo Probar la Aplicación

### 1. Iniciar Servidor

```bash
npm start
```

El servidor se ejecuta en: http://localhost:3000

### 2. Acceder a Login JWT

**URL:** http://localhost:3000/users/login

### 3. Credenciales de Prueba

- **Admin:** `adminCoder@coder.com` / `admin123`

### 4. Flujo de Prueba

1. Ir a `/users/login`
2. Ingresar credenciales
3. Si login exitoso → Redirección a `/users/current`
4. Si login falla → Redirección a `/users/login` con error
5. En `/users/current` ver datos del usuario autenticado
6. Click "Cerrar Sesión" para logout

### 5. API REST Endpoints

```bash
# Obtener todos los usuarios
GET http://localhost:3000/api/users

# Crear usuario
POST http://localhost:3000/api/users
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@ejemplo.com",
  "password": "123456",
  "role": "user"
}

# Login API
POST http://localhost:3000/api/users/login
{
  "email": "adminCoder@coder.com",
  "password": "admin123"
}
```

## 🔧 Tecnologías Implementadas

### Nuevas para esta actividad:

- ✅ **jsonwebtoken** - Generación y verificación JWT
- ✅ **cookie-parser** - Manejo de cookies firmadas

### Existentes reutilizadas:

- ✅ **bcrypt** - Hasheo de contraseñas
- ✅ **express** - Servidor web
- ✅ **mongoose** - ODM MongoDB
- ✅ **handlebars** - Motor de plantillas
- ✅ **bootstrap** - UI responsiva

## 📊 Base de Datos

### Configuración:

- **Servidor:** MongoDB Atlas
- **Base de datos:** `integrative_practice`
- **Colección:** `users`
- **URL:** `mongodb+srv://...@clusterbackend.../integrative_practice`

### Datos de Prueba:

- Usuario admin creado automáticamente al iniciar
- Schema compatible con actividades anteriores
- Migraciones automáticas desde `backendII`

## 🎯 Cumplimiento de Requisitos

### ✅ Todos los aspectos implementados:

1. **Servidor Express** ✓
2. **Rutas /api/users y /users** ✓
3. **Base de datos integrative_practice** ✓
4. **Schema con campos requeridos** ✓
5. **CRUD completo** ✓
6. **Contraseñas hasheadas** ✓
7. **Login con JWT** ✓
8. **Cookie firmada currentUser** ✓
9. **Vistas /login y /current** ✓
10. **Validaciones de acceso** ✓
11. **Redirecciones correctas** ✓
12. **Manejo de errores** ✓

## 🔄 Compatibilidad

La aplicación mantiene **compatibilidad total** con actividades anteriores:

- Rutas Passport.js disponibles en `/auth/*`
- Sistema anterior accesible en `/login` y `/products`
- Misma base de datos MongoDB Atlas
- Configuraciones preservadas

## 📋 Estado Final

**✅ ACTIVIDAD 4.4 COMPLETADA AL 100%**

- Todos los requisitos implementados
- Sistema JWT funcionando correctamente
- Validaciones de acceso operativas
- Interfaz de usuario completa
- API REST documentada y probada
- Base de datos integrative_practice activa
