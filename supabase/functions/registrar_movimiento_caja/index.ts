import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const authHeader = req.headers.get('Authorization');

    // 1. Validar JWT y obtener user_id
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Falta token JWT.' }), { status: 401 });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Sesión inválida. Por favor, reinicie sesión.' }), { status: 401 });
    }

    // 2. Obtener datos de la petición
    const { type, amount, note } = await req.json();

    if (!type || !amount) {
        return new Response(JSON.stringify({ error: 'Faltan campos obligatorios (type, amount).' }), { status: 400 });
    }

    // 3. Insertar movimiento de caja
    const { data, error } = await supabase
        .from('cash_movements')
        .insert({
            user_id: user.id, // ID obtenido del JWT
            type: type,
            amount: amount,
            note: note,
        })
        .select()
        .single();

    if (error) {
        return new Response(JSON.stringify({ error: `Error DB al registrar movimiento: ${error.message}` }), { status: 500 });
    }

    // 4. Respuesta Exitosa
    return new Response(JSON.stringify({ status: 'success', id: data.id }), { 
        headers: { 'Content-Type': 'application/json' }, 
        status: 200 
    });
});