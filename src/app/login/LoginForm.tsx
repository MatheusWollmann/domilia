// src/app/login/LoginForm.tsx
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Home, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
        setIsSignUp(false); // Volta para a tela de login
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh(); // Importante para recarregar os dados do servidor
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            <Home className="mx-auto h-12 w-auto text-indigo-600" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {isSignUp ? 'Crie sua conta' : 'Acesse sua conta'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Bem-vindo ao Domilia
            </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuthAction}>
          <div className="space-y-4 rounded-md bg-white dark:bg-gray-800 p-8 shadow-lg">
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input id="email-address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-style w-full" placeholder="Endereço de e-mail" />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-style w-full" placeholder="Senha" />
            </div>
          </div>

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <div>
            <button type="submit" disabled={loading} className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Cadastrar' : 'Entrar')}
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
            {isSignUp ? 'Faça login' : 'Cadastre-se'}
          </button>
        </p>
      </div>
    </div>
  );
}
