import React, { useState } from 'react';
import { supabase } from '../src/lib/supabase'; 

interface LoginPageProps {
}

const LoginPage: React.FC<LoginPageProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Error: ' + error.message);
      setLoading(false);
    } else {
      console.log("Login exitoso");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">POS Verdulería</h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="admin@pos.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;