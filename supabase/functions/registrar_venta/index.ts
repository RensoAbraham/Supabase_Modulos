import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // 1. Validar Token y Sesión
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Token JWT necesario.' }), { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    
    // Crear Cliente RLS-Aware (usando el token para seguridad)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Sesión inválida.' }), { status: 401 });
    }
    
    // 2. Obtener Payload
    const { payment_method, items } = await req.json();

    if (!items || items.length === 0) {
        return new Response(JSON.stringify({ error: 'La lista de ítems está vacía.' }), { status: 400 });
    }
    
    try {
        // 3. Llamar a la función fn_registrar_venta (que contiene la lógica de negocio y triggers)
        const { data: saleId, error: rpcError } = await supabase.rpc('fn_registrar_venta', {
            p_user_id: user.id,
            p_payment_method: payment_method,
            p_items: items, // El JSON se mapea al tipo sale_item[]
        });

        if (rpcError) throw rpcError;

        // 4. Devolver éxito
        return new Response(JSON.stringify({ 
            status: 'success', 
            sale_id: saleId, 
            message: 'Venta registrada exitosamente.'
        }), { 
            headers: { 'Content-Type': 'application/json' }, 
            status: 200 
        });

    } catch (error: any) {
        // Manejo de errores de stock o de DB
        return new Response(JSON.stringify({ 
            error: 'Error al procesar la venta.', 
            details: error.message 
        }), { status: 500 });
    }
});