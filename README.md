# 🛒 POS Verdulería - Sistema de Punto de Venta

Sistema moderno de punto de venta (POS) para verdulerías, desarrollado con React, TypeScript, Vite y Supabase.

## ✨ Características

### 🔐 Autenticación

- **Login con Email/Contraseña**: Autenticación tradicional con Supabase Auth
- **Login con GitHub**: Autenticación OAuth para acceso rápido
- **Roles de Usuario**: Sistema de permisos con roles de `admin` y `cajero`

### 💼 Panel de Cajero

- **Apertura de Caja**: Registro de monto inicial y notas
- **Catálogo de Productos**: Visualización por categorías con imágenes
- **Carrito de Compras**: Gestión de productos con cantidades y precios
- **Métodos de Pago**: Efectivo, tarjeta, transferencia y Yape
- **Configuración de Balanza**: Integración con balanza digital (opcional)
- **Historial de Ventas**: Registro completo de transacciones

### 👨‍💼 Panel de Administrador

- **Dashboard de Ventas**:
  - Historial completo de ventas
  - Información detallada del cajero (nombre, email, rol)
  - Métodos de pago utilizados
  - Totales y fechas de transacciones
- **Gestión de Productos**:
  - Crear, editar y eliminar productos
  - Asignación automática de categorías
  - Gestión de imágenes y precios
  - Búsqueda y filtrado
- **Gestión de Usuarios**:
  - Visualización de cajeros registrados
  - Información de roles y fechas de registro

## 🚀 Instalación

### Prerrequisitos

- Node.js (v16 o superior)
- npm o yarn
- Cuenta de Supabase

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd MODULO-2
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crear un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. **Configurar Supabase**

Ejecuta las migraciones SQL necesarias en tu proyecto de Supabase (ver sección de Base de Datos).

5. **Configurar GitHub OAuth (Opcional)**

En tu proyecto de Supabase:

- Ve a Authentication > Providers
- Habilita GitHub
- Configura las credenciales de tu GitHub OAuth App
- Añade `http://localhost:5173` como URL de callback para desarrollo

6. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## 🗄️ Estructura de Base de Datos

### Tablas Principales

#### `users`

- `id` (uuid, PK)
- `email` (text)
- `role` (text) - 'admin' o 'cajero'
- `raw_user_meta_data` (jsonb) - Metadata del usuario (nombre, avatar, etc.)
- `created_at` (timestamp)

#### `products`

- `id` (bigint, PK)
- `name` (text)
- `price` (numeric)
- `category_id` (bigint, FK)
- `image_url` (text)
- `created_at` (timestamp)

#### `categories`

- `id` (bigint, PK)
- `name` (text)
- `created_at` (timestamp)

#### `sales_header`

- `id` (bigint, PK)
- `user_id` (uuid, FK)
- `total` (numeric)
- `payment_method` (text)
- `created_at` (timestamp)

#### `sales_detail`

- `id` (bigint, PK)
- `sale_id` (bigint, FK)
- `product_id` (bigint, FK)
- `quantity` (numeric)
- `unit_price` (numeric)
- `subtotal` (numeric)

#### `cash_movements`

- `id` (bigint, PK)
- `user_id` (uuid, FK)
- `type` (text) - 'apertura' o 'cierre'
- `amount` (numeric)
- `note` (text)
- `created_at` (timestamp)

## 🎨 Tecnologías Utilizadas

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite 6
- **Backend/Database**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth (Email + GitHub OAuth)
- **Iconos**: Lucide React
- **Estilos**: CSS Modules / Tailwind-like utilities

## 👥 Roles y Permisos

### Cajero

- Abrir/cerrar caja
- Realizar ventas
- Ver catálogo de productos
- Ver historial de sus propias ventas

### Administrador

- Todas las funciones de cajero
- Gestionar productos (CRUD)
- Ver todas las ventas del sistema
- Ver información de todos los cajeros
- Acceso al panel de administración

## 🔒 Seguridad

- Autenticación mediante Supabase Auth
- Row Level Security (RLS) en Supabase
- Validación de roles en el frontend
- Tokens JWT para sesiones
- OAuth 2.0 para GitHub

## 📝 Uso

### Para Cajeros

1. **Iniciar Sesión**: Usa tu email/contraseña o GitHub
2. **Abrir Caja**: Ingresa el monto inicial y una nota opcional
3. **Realizar Venta**:
   - Selecciona productos del catálogo
   - Ajusta cantidades en el carrito
   - Elige método de pago
   - Confirma la venta
4. **Ver Historial**: Revisa tus ventas anteriores

### Para Administradores

1. **Acceder al Panel Admin**: Click en el botón "Admin" en la barra superior
2. **Gestionar Productos**:
   - Click en "Nuevo Producto"
   - Completa nombre, precio, categoría e imagen
   - Guarda los cambios
3. **Ver Ventas**: Revisa todas las transacciones con detalles de cajeros
4. **Gestionar Cajeros**: Visualiza usuarios registrados

## 🐛 Solución de Problemas

### Error de conexión a Supabase

- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que tu proyecto de Supabase esté activo

### GitHub OAuth no funciona

- Verifica la configuración en Supabase > Authentication > Providers
- Asegúrate de que la URL de callback esté correctamente configurada
- Revisa que tu GitHub OAuth App tenga las credenciales correctas

### Productos no se crean

- Verifica que tengas permisos de admin
- Revisa la consola del navegador para errores
- Asegúrate de que la tabla `categories` tenga datos

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o soporte, por favor abre un issue en el repositorio.

---

Desarrollado con ❤️ para facilitar la gestión de verdulerías
