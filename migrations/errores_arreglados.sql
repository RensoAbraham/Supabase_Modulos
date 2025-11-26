-- **********************************************************
-- PASO 1: LIMPIEZA DE CONSTRICCIONES EXISTENTES
-- **********************************************************

-- Eliminamos todas las FKs que puedan estar rotas o duplicadas
ALTER TABLE public.sales_detail DROP CONSTRAINT IF EXISTS sales_detail_product_id_fkey;
ALTER TABLE public.sales_detail DROP CONSTRAINT IF EXISTS sales_detail_sale_id_fkey;
ALTER TABLE public.sales_header DROP CONSTRAINT IF EXISTS sales_header_user_id_fkey;
ALTER TABLE public.cash_movements DROP CONSTRAINT IF EXISTS cash_movements_user_id_fkey;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey; -- La FK principal
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE public.product_stock DROP CONSTRAINT IF EXISTS product_stock_product_id_fkey;


-- **********************************************************
-- PASO 2: REASENTAMIENTO DE LLAVES FORÁNEAS (El Ensamblaje Correcto)
-- **********************************************************

-- 1. Vínculo de seguridad y perfil
-- CRÍTICO: users.id debe ser el UUID de Auth
ALTER TABLE public.users
    ADD CONSTRAINT users_id_fkey
        FOREIGN KEY (id)
        REFERENCES auth.users(id);

-- 2. Vínculo de Catálogo
ALTER TABLE public.products
    ADD CONSTRAINT products_category_id_fkey
        FOREIGN KEY (category_id)
        REFERENCES public.categories(id);

-- 3. Vínculo de Inventario (product_stock <-> products)
ALTER TABLE public.product_stock
    ADD CONSTRAINT product_stock_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES public.products(id)
        ON DELETE CASCADE;

-- 4. Vínculo de Transacciones (sales_header, cash_movements)
ALTER TABLE public.sales_header
    ADD CONSTRAINT sales_header_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id);

ALTER TABLE public.cash_movements
    ADD CONSTRAINT cash_movements_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id);

-- 5. Vínculo de Detalle (sales_detail)
ALTER TABLE public.sales_detail
    ADD CONSTRAINT sales_detail_sale_id_fkey
        FOREIGN KEY (sale_id)
        REFERENCES public.sales_header(id)
        ON DELETE CASCADE;

ALTER TABLE public.sales_detail
    ADD CONSTRAINT sales_detail_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES public.products(id);


-- Correlative
-- 1. Eliminar el trigger de la tabla (desactivar la rutina)
DROP TRIGGER IF EXISTS trg_generar_correlativo ON public.sales_header;

-- 2. Eliminar la función asociada al trigger (limpieza completa)
DROP FUNCTION IF EXISTS public.trg_generar_correlativo() CASCADE;

-- 3. (OPCIONAL) Limpiar el tipo ENUM de pago si existe un error de caché (solo para asegurar)
-- ALTER TYPE public.payment_method_type RENAME VALUE 'transferencia' TO 'transferencia_ok';



-- Arreglos finales:

-- **********************************************************
-- PASO 1: ARREGLO DE SEGURIDAD (product_stock)
-- **********************************************************

-- Habilitamos RLS
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

-- Denegamos todo acceso SELECT/INSERT/UPDATE/DELETE al público y autenticados, 
-- permitiendo que solo los triggers y el admin accedan.
CREATE POLICY "RLS_DENY_FRONTEND_STOCK_ACCESS"
ON public.product_stock
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);


-- **********************************************************
-- PASO 2: LIMPIEZA DE POLÍTICAS DUPLICADAS
-- **********************************************************

-- Borramos políticas de detalle de venta que puedan estar duplicadas o fallando
DROP POLICY IF EXISTS "Permitir todo a autenticados" ON public.sales_detail;
DROP POLICY IF EXISTS "INSERT_FINAL_DETALLE_DEMO" ON public.sales_detail;


-- **********************************************************
-- PASO 3: CREACIÓN DE ÍNDICES FALTANTES (Performance)
-- **********************************************************

-- Índices en todas las Llaves Foráneas (FKs) que causan advertencias

-- cash_movements
CREATE INDEX IF NOT EXISTS idx_cash_movements_user_id ON public.cash_movements (user_id);

-- products
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);

-- sales_header
CREATE INDEX IF NOT EXISTS idx_sales_header_user_id ON public.sales_header (user_id);

-- sales_detail
CREATE INDEX IF NOT EXISTS idx_sales_detail_product_id ON public.sales_detail (product_id);
CREATE INDEX IF NOT EXISTS idx_sales_detail_sale_id ON public.sales_detail (sale_id);