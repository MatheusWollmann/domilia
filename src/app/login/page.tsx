// src/app/login/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';

// Garante que a página sempre verifique a sessão no servidor
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // Se o usuário já estiver logado, redireciona para o dashboard
  if (session) {
    redirect('/dashboard');
  }

  // Caso contrário, mostra o formulário de login
  return <LoginForm />;
}
