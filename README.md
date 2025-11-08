# Backend Tienda - Proyecto Final CoderHouse

Backend completo para una tienda online desarrollado con Node.js, Express, MongoDB y Handlebars.

## Descripción

Este proyecto implementa un sistema completo de e-commerce con gestión de productos y carritos de compra, incluyendo:
- API RESTful con paginación, filtros y ordenamiento
- Sistema de carritos con referencias a productos
- Vistas dinámicas con Handlebars
- Integración completa con MongoDB

## Tecnologías utilizadas

- **Node.js** - Runtime de JavaScript
- **Express 5** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **mongoose-paginate-v2** - Plugin de paginación
- **Handlebars** - Motor de plantillas
- **Socket.io** - Comunicación en tiempo real
- **Multer** - Manejo de archivos
- **Bootstrap 5** - Framework CSS

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd backend-tienda
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo de configuración en `src/config/config.js` con tu conexión a MongoDB:
```javascript
export const config = {
    mongoUrl: 'tu_url_de_mongodb'
}
```

4. Iniciar el servidor:
```bash
npm start
```

Para desarrollo con hot-reload:
```bash
npm run dev
```

## Endpoints de la API

### Productos

- `GET /api/products` - Listar productos con paginación, filtros y ordenamiento
  - Query params: `page`, `limit`, `sort` (asc/desc), `query` (category:valor o status:true/false)
- `GET /api/products/:pid` - Obtener un producto por ID
- `POST /api/products` - Crear un nuevo producto
- `PUT /api/products/:pid` - Actualizar un producto
- `DELETE /api/products/:pid` - Eliminar un producto

### Carritos

- `GET /api/carts` - Listar todos los carritos
- `POST /api/carts` - Crear un nuevo carrito
- `GET /api/carts/:cid` - Obtener un carrito por ID (con populate de productos)
- `POST /api/carts/:cid/product/:pid` - Agregar un producto al carrito
- `DELETE /api/carts/:cid/products/:pid` - Eliminar un producto del carrito
- `PUT /api/carts/:cid` - Actualizar todos los productos del carrito
- `PUT /api/carts/:cid/products/:pid` - Actualizar la cantidad de un producto
- `DELETE /api/carts/:cid` - Vaciar el carrito

## Vistas

- `/` - Vista principal con listado de productos, paginación y filtros
- `/products/:pid` - Vista de detalle de un producto
- `/carts` - Vista de lista de carritos
- `/carts/:cid` - Vista de un carrito específico
- `/realtimeproducts` - Vista de productos con actualización en tiempo real

## Scripts disponibles

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo con hot-reload

## Funcionalidades principales

### Productos
- Paginación con mongoose-paginate-v2
- Filtros por categoría y disponibilidad
- Ordenamiento por precio (ascendente/descendente)
- Límite configurable de productos por página (10, 20, 50)
- Validación de datos con función centralizada
- Formato de respuesta estandarizado con metadatos

### Carritos
- Modelo con referencias a productos (populate)
- CRUD completo de productos en el carrito
- Actualización de cantidades
- Cálculo automático de subtotales y total
- Sistema de selección/creación de carritos
- Validación de ObjectId en todos los endpoints

### Vistas
- Interfaz responsive con Bootstrap 5
- Paginación interactiva
- Filtros y ordenamiento en tiempo real
- Botones de "Agregar al carrito" funcionales
- Modal de selección de carrito
- Actualización de cantidades desde la vista del carrito

## Estructura del proyecto

```
backend-tienda/
├── src/
│   ├── app.js                 # Punto de entrada de la aplicación
│   ├── config/
│   │   ├── config.js          # Configuración general
│   │   └── db.js              # Configuración de MongoDB
│   ├── dao/
│   │   ├── models/
│   │   │   ├── cartModels.js  # Modelo de Cart
│   │   │   └── productModels.js # Modelo de Product
│   │   ├── CartManager.js     # Lógica de negocio de carritos
│   │   └── ProductManager.js  # Lógica de negocio de productos
│   ├── routes/
│   │   ├── cartsRouter.js     # Rutas de API de carritos
│   │   ├── productsRouter.js  # Rutas de API de productos
│   │   └── viewsRouter.js     # Rutas de vistas
│   ├── utils/
│   │   └── validators.js      # Funciones de validación
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.hbs       # Layout principal
│   │   ├── cart.hbs           # Vista del carrito
│   │   ├── carts.hbs          # Vista de lista de carritos
│   │   ├── home.hbs           # Vista principal
│   │   ├── productDetail.hbs  # Vista de detalle de producto
│   │   └── error.hbs          # Vista de error
│   ├── public/
│      └── js/
│          └── realtime.js    # Scripts del cliente
├── package.json
├── .gitignore
└── README.md
```

## Autor

**Franco Castro Miranda**

## Licencia

ISC

## Proyecto realizado para

**CoderHouse - Backend en Node.js**
Entrega Final - Noviembre 2025
