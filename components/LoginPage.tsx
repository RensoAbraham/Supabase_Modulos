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

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      }
    });

    if (error) {
      setError('Error: ' + error.message);
      setLoading(false);
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

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">o continuar con</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <button
          onClick={handleGitHubLogin}
          disabled={loading}
          className="mt-4 w-full rounded bg-gray-800 py-2 font-bold text-white hover:bg-gray-900 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          {loading ? 'Conectando...' : 'Continuar con GitHub'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;