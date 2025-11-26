-- **********************************************************
-- 1. REASENTAMIENTO DE LLAVES FORÁNEAS (El Ensamblaje Correcto)
--    Este bloque garantiza la integridad referencial del modelo.
-- **********************************************************

-- A. Vínculo de seguridad y perfil (users.id -> auth.users)
ALTER TABLE public.users
    DROP CONSTRAINT IF EXISTS users_id_fkey; -- Se borra primero si existe

ALTER TABLE public.users
    ADD CONSTRAINT users_id_fkey
        FOREIGN KEY (id)
        REFERENCES auth.users(id);

-- B. Vínculo de Catálogo (products <-> categories)
ALTER TABLE public.products
    DROP CONSTRAINT IF EXISTS products_category_id_fkey;

ALTER TABLE public.products
    ADD CONSTRAINT products_category_id_fkey
        FOREIGN KEY (category_id)
        REFERENCES public.categories(id);

-- C. Vínculo de Inventario (product_stock <-> products)
-- Asegura que la tabla de stock se enlace y se borre en cascada
ALTER TABLE public.product_stock
    DROP CONSTRAINT IF EXISTS product_stock_product_id_fkey;

ALTER TABLE public.product_stock
    ADD CONSTRAINT product_stock_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES public.products(id)
        ON DELETE CASCADE;

-- D. Vínculo de Transacciones (sales_header, cash_movements)
ALTER TABLE public.sales_header
    DROP CONSTRAINT IF EXISTS sales_header_user_id_fkey;
ALTER TABLE public.sales_header
    ADD CONSTRAINT sales_header_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id);

ALTER TABLE public.cash_movements
    DROP CONSTRAINT IF EXISTS cash_movements_user_id_fkey;
ALTER TABLE public.cash_movements
    ADD CONSTRAINT cash_movements_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id);

-- E. Vínculo de Detalle (sales_detail)
ALTER TABLE public.sales_detail
    DROP CONSTRAINT IF EXISTS sales_detail_sale_id_fkey;
ALTER TABLE public.sales_detail
    ADD CONSTRAINT sales_detail_sale_id_fkey
        FOREIGN KEY (sale_id)
        REFERENCES public.sales_header(id)
        ON DELETE CASCADE;

ALTER TABLE public.sales_detail
    DROP CONSTRAINT IF EXISTS sales_detail_product_id_fkey;
ALTER TABLE public.sales_detail
    ADD CONSTRAINT sales_detail_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES public.products(id);


-- **********************************************************
-- 2. RESTRICCIONES DE NEGOCIO Y TIPO (Ejemplo de Módulo 3)
-- **********************************************************

-- Añadir checks de integridad faltantes (Obligatorio)
ALTER TABLE public.products ADD CONSTRAINT price_positive_check CHECK (price >= 0);
ALTER TABLE public.sales_header ADD CONSTRAINT total_positive_check CHECK (total >= 0);
ALTER TABLE public.cash_movements ADD CONSTRAINT amount_positive_check CHECK (amount >= 0);


-- **********************************************************
-- 3. CREACIÓN DE ÍNDICES FALTANTES (Performance)
-- **********************************************************

-- Índices en todas las Llaves Foráneas (FKs) que mejoran la velocidad de JOINs
CREATE INDEX IF NOT EXISTS idx_cash_movements_user_id ON public.cash_movements (user_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_sales_header_user_id ON public.sales_header (user_id);
CREATE INDEX IF NOT EXISTS idx_sales_detail_product_id ON public.sales_detail (product_id);
CREATE INDEX IF NOT EXISTS idx_sales_detail_sale_id ON public.sales_detail (sale_id);


-- **********************************************************
-- 4. CONTROL DE SEGURIDAD (product_stock)
-- **********************************************************

-- Habilitar RLS y denegar acceso directo al Frontend
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "RLS_DENY_FRONTEND_STOCK_ACCESS" ON public.product_stock;
CREATE POLICY "RLS_DENY_FRONTEND_STOCK_ACCESS"
ON public.product_stock
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- **********************************************************
-- 5. LIMPIEZA DE TRIGGERS OBSOLETOS (Correlativo)
-- **********************************************************

-- Eliminar el código del trigger de correlativo que causaba error (si existe)
DROP TRIGGER IF EXISTS trg_generar_correlativo ON public.sales_header;
DROP FUNCTION IF EXISTS public.trg_generar_correlativo() CASCADE;