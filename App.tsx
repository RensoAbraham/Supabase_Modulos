import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout'; // Dashboard
import OpeningModal from './components/OpeningModal'; // Modal
import LoginPage from './components/LoginPage'; // Login
import { supabase } from './src/lib/supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  // --- 1. ESTADO DE AUTENTICACIÓN ---
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // --- 2. ESTADO DE CAJA ---
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [showModal, setShowModal] = useState(true);

  // --- 3. EFECTO PARA VERIFICAR SESIÓN ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Si cierran sesión, reseteamos el estado de la caja por seguridad
      if (!session) {
        setIsRegisterOpen(false);
        setShowModal(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 4. MANEJO DE APERTURA DE CAJA (CONECTADO A SUPABASE) ---
  const handleOpenRegister = async (amountStr: string, note: string) => {
    const amount = parseFloat(amountStr) || 0;

    // Validar usuario
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        alert("Error: Sesión no válida.");
        return;
    }

    // Insertar en la tabla cash_movements
    const { error } = await supabase
        .from('cash_movements')
        .insert({
            user_id: user.id,
            type: 'apertura',
            amount: amount,
            note: note,
            created_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error abriendo caja:', error);
        alert("❌ Error al guardar apertura: " + error.message);
    } else {
        console.log(`✅ Caja abierta con S/ ${amount}`);
        // Solo si guardó bien, cerramos el modal y mostramos el POS
        setIsRegisterOpen(true);
        setShowModal(false);
    }
  };

  const handleDiscard = () => {
    console.log("Apertura descartada");
    // Aquí podrías cerrar sesión si es obligatorio abrir caja
  };

  // --- 5. RENDERIZADO (LO QUE SE VE EN PANTALLA) ---

  // A) Pantalla de Carga
  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-100 text-gray-500">Cargando sistema...</div>;
  }

  // B) Si NO hay usuario -> Muestra Login
  if (!session) {
    return <LoginPage />;
  }

  // C) Si SÍ hay usuario -> Muestra TU APP (Dashboard + Modal)
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
      {/* El Dashboard se ve borroso si el modal está abierto */}
      <DashboardLayout isBlurred={showModal} />

      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <OpeningModal 
            onOpenRegister={handleOpenRegister}
            onDiscard={handleDiscard}
          />
        </div>
      )}
    </div>
  );
};

export default App;