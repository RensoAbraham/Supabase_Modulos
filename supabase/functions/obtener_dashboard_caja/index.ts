import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const authHeader = req.headers.get('Authorization');

    // 1. Validar JWT y crear cliente seguro
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Token JWT necesario.' }), { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    
    // Crear Cliente RLS-Aware (usando el token para seguridad)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
    });

    // 2. Obtener Usuario y Rol
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Sesión inválida o expirada.' }), { status: 401 });
    }

    // Obtener el rol de la tabla users (necesario para la lógica Admin/Cajero en la función SQL)
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    const userRole = userData?.role || 'cajero';
    
    // 3. Llamar a la función PostgreSQL fn_obtener_dashboard_caja
    try {
        const { data: dashboardData, error: rpcError } = await supabase.rpc('fn_obtener_dashboard_caja', {
            p_user_id: user.id,
            p_role: userRole,
        });

        if (rpcError) throw rpcError;

        // La función SQL devuelve una tabla, si es vacía, devolvemos un objeto base.
        const result = dashboardData && dashboardData.length > 0 ? dashboardData[0] : { 
            total_vendido: 0.00, 
            total_efectivo: 0.00, 
            total_ingresos: 0.00, 
            total_salidas: 0.00, 
            saldo_caja: 0.00 
        };

        // 4. Devolver éxito
        return new Response(JSON.stringify({ status: 'success', data: result }), { 
            headers: { 'Content-Type': 'application/json' }, 
            status: 200 
        });

    } catch (error: any) {
        console.error("Error RPC Dashboard:", error);
        return new Response(JSON.stringify({ 
            error: 'Error al generar el dashboard.', 
            details: error.message 
        }), { status: 500 });
    }
});