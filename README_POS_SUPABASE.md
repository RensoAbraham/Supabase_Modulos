# Sistema POS Verdulería – Frontend React + Backend Supabase

## 1. Descripción

Este proyecto es un prototipo funcional de un Punto de Venta (POS) para verdulerías y fruterías en Perú.

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Supabase (Postgres, Auth, Storage, RLS)
- Objetivo actual: Conectar el frontend existente a una base de datos real en Supabase y usar autenticación real para cajeros y administradores.

---

## 2. Alcance de esta fase

En esta fase NO se implementan:

- Integración real con balanza
- Impresión ESC/POS
- Facturación electrónica SUNAT

En esta fase SÍ se implementan:

- Modelo de base de datos en Supabase
- Autenticación real (Supabase Auth)
- Gestión de usuarios con roles (admin / cajero)
- Registro de ventas (cabecera y detalle)
- Registro de movimientos de caja
- Reemplazo de datos simulados (localStorage) por datos reales de Supabase

---

## 3. Estructura de Tablas (resumen)

- `users`: perfiles de usuarios y roles (enlazado a `auth.users`)
- `categories`: categorías de productos
- `products`: productos con precio, categoría e imagen
- `sales_header`: cabecera de ventas
- `sales_detail`: detalle de ventas
- `cash_movements`: movimientos de caja (apertura, ingresos, salidas, cierre)

El SQL completo se encuentra en:  
`/backend/sql/schema_pos_supabase.sql`

---

## 4. Organización del equipo

- Sala A (Backend Supabase)

  - Diseña y crea las tablas
  - Configura autenticación y roles
  - Aplica RLS básico
  - Proporciona a Sala B los nombres de tablas y campos

- Sala B (Integración POS)
  - Conecta el frontend a Supabase
  - Reemplaza localStorage por Supabase
  - Registra ventas y caja en la base de datos
  - Entrega capturas y video corto de una venta completa

---

## 5. Entregables

Cada sala crea una carpeta en Google Drive y la comparte a:  
`mdpixelcorp10@gmail.com`

Nombres sugeridos:

- `Grupo_SalaA_Supabase_POS`
- `Grupo_SalaB_Supabase_POS`

Cada carpeta debe contener:

- SQL utilizado (Sala A)
- Código relevante del frontend modificado (Sala B)
- Capturas de Supabase Studio (tablas, datos, políticas)
- Capturas o video del POS funcionando con datos reales
- Un archivo `INFORME.txt` con:
  - Integrantes y roles
  - Qué se logró
  - Problemas encontrados y soluciones
