-- Archivo: consultas_avanzadas.sql
-- Consultas de análisis de negocio obligatorias para el POS Verdulería.

-- 1. Productos más vendidos (Top 5 por cantidad)
SELECT
    p.name AS product_name,
    SUM(sd.quantity) AS total_quantity_sold
FROM
    public.sales_detail sd
JOIN
    public.products p ON sd.product_id = p.id
GROUP BY
    p.name
ORDER BY
    total_quantity_sold DESC
LIMIT 5;

-- 2. Ventas por día (Ingreso Total Diario)
SELECT
    DATE(created_at) AS sale_day,
    SUM(total) AS daily_revenue,
    COUNT(id) AS number_of_sales
FROM
    public.sales_header
GROUP BY
    sale_day
ORDER BY
    sale_day DESC;

-- 3. Ventas por Usuario (Cajero) - Asumiendo que 'users' tiene el email
SELECT
    u.email,
    COUNT(sh.id) AS total_sales,
    SUM(sh.total) AS total_revenue_generated
FROM
    public.sales_header sh
JOIN
    public.users u ON sh.user_id = u.id -- Unir con la tabla de perfiles/usuarios
GROUP BY
    u.email
ORDER BY
    total_revenue_generated DESC;

-- 4. Total vendido por forma de pago
SELECT
    payment_method,
    SUM(total) AS total_amount
FROM
    public.sales_header
GROUP BY
    payment_method
ORDER BY
    total_amount DESC;

-- 5. Caja del día (entradas/salidas/apertura)
SELECT
    type,
    SUM(amount) AS total_by_movement_type
FROM
    public.cash_movements
WHERE
    created_at >= date_trunc('day', now()) -- Filtra solo el día actual
GROUP BY
    type
ORDER BY
    type;

-- 6. Top categorías por ingreso total
SELECT
    c.name AS category_name,
    SUM(sd.subtotal) AS total_category_revenue
FROM
    public.sales_detail sd
JOIN
    public.products p ON sd.product_id = p.id
JOIN
    public.categories c ON p.category_id = c.id
GROUP BY
    c.name
ORDER BY
    total_category_revenue DESC
LIMIT 5;