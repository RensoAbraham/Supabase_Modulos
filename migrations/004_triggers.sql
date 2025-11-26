-- Creación de la secuencia para el correlativo de ventas
CREATE SEQUENCE IF NOT EXISTS public.sales_correlative_seq START WITH 1 INCREMENT BY 1;

-- Función para el Trigger de Stock
CREATE OR REPLACE FUNCTION public.trg_actualizar_stock_en_venta() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE public.product_stock
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE product_id = NEW.product_id;

    IF EXISTS (SELECT 1 FROM public.product_stock WHERE product_id = NEW.product_id AND stock_quantity < 0) THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto ID %', NEW.product_id USING HINT = 'La cantidad solicitada supera el inventario disponible.';
    END IF;
    RETURN NEW;
END;
$$;

-- Creación del Trigger de Stock
CREATE TRIGGER trg_actualizar_stock_en_venta
BEFORE INSERT ON public.sales_detail
FOR EACH ROW
EXECUTE FUNCTION public.trg_actualizar_stock_en_venta();

-- Función para el Trigger de Correlativo
CREATE OR REPLACE FUNCTION public.trg_generar_correlativo() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.correlative := nextval('public.sales_correlative_seq');
    RETURN NEW;
END;
$$;

-- Creación del Trigger de Correlativo (Requiere que añadas la columna 'correlative' a sales_header en 002)
-- ALTER TABLE public.sales_header ADD COLUMN correlative INTEGER;
-- CREATE TRIGGER trg_generar_correlativo BEFORE INSERT ON public.sales_header FOR EACH ROW EXECUTE FUNCTION public.trg_generar_correlativo();