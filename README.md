# Backend II - Entrega Final

**Francisco Haro** - CoderHouse 2025

## Qué es esto

E-commerce con login, productos, carrito y compras. Usa Node.js, Express, MongoDB y JWT.

## Cómo correrlo

```bash
npm install
cp .env.example .env   # configurar las variables
npm start
```

Abrir http://localhost:3000

## Usuarios de prueba

| Email            | Contraseña | Rol     |
| ---------------- | ---------- | ------- |
| admin@coder.com  | admin123   | admin   |
| user@test.com    | user123    | user    |
| premium@test.com | premium123 | premium |

## Endpoints principales

### Productos

- `GET /api/products` - listar productos
- `POST /api/products` - crear (admin/premium)
- `PUT /api/products/:id` - editar
- `DELETE /api/products/:id` - eliminar

### Carrito

- `GET /api/carts/:id` - ver carrito
- `POST /api/carts/:cid/products/:pid` - agregar producto
- `DELETE /api/carts/:cid/products/:pid` - quitar producto
- `POST /api/carts/:cid/purchase` - comprar

### Sesiones

- `POST /api/sessions/login` - login con JWT
- `GET /api/sessions/current` - usuario actual

## Roles

- **admin**: puede todo
- **premium**: crea sus productos, no puede comprar los propios
- **user**: solo compra
