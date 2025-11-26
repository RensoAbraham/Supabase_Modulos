-- Función principal para registrar la venta (fn_registrar_venta)
CREATE OR REPLACE FUNCTION public.fn_registrar_venta(
    p_user_id uuid,
    p_payment_method public.payment_method_type,
    p_items public.sale_item[]
)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_sale_id bigint; v_total numeric(10, 2) := 0; v_item public.sale_item;
BEGIN
    SELECT SUM(item.quantity * item.unit_price) INTO v_total FROM unnest(p_items) AS item;
    
    INSERT INTO public.sales_header (user_id, total, payment_method)
    VALUES (p_user_id, v_total, p_payment_method) RETURNING id INTO v_sale_id;
    
    FOREACH v_item IN ARRAY p_items
    LOOP
        INSERT INTO public.sales_detail (sale_id, product_id, quantity, unit_price, subtotal)
        VALUES (v_sale_id, v_item.product_id, v_item.quantity, v_item.unit_price, (v_item.quantity * v_item.unit_price));
    END LOOP;
    
    RETURN v_sale_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.fn_registrar_venta(uuid, public.payment_method_type, public.sale_item[]) TO authenticated;

-- Función para obtener el dashboard (fn_obtener_dashboard_caja)
CREATE OR REPLACE FUNCTION public.fn_obtener_dashboard_caja(p_user_id uuid, p_role text)
RETURNS TABLE (
    total_vendido numeric, total_efectivo numeric, total_ingresos numeric, total_salidas numeric, saldo_caja numeric
)
LANGUAGE sql SECURITY DEFINER AS $$ ... (Código omitido por brevedad, usa el código completo de la función que te di antes) ... $$;

-- Función para validar apertura (fn_validar_apertura_caja)
CREATE OR REPLACE FUNCTION public.fn_validar_apertura_caja(p_user_id uuid)
RETURNS TABLE(has_open_cash BOOLEAN, message TEXT) LANGUAGE plpgsql AS $$ ... (Código omitido por brevedad) ... $$;
GRANT EXECUTE ON FUNCTION public.fn_validar_apertura_caja(uuid) TO authenticated;