// src/app/dashboard/layout.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import DashboardUI from './DashboardUI';

// Força o layout e todas as suas páginas filhas a serem dinâmicas.
export const dynamic = 'force-dynamic';

// Este é um componente de servidor por padrão (sem 'use client')
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  // Se não houver usuário, o layout redireciona para o login antes de renderizar qualquer coisa.
  if (!user) {
    redirect('/login');
  }

  // Se o usuário estiver logado, renderizamos a UI do dashboard,
  // passando o usuário e o conteúdo da página (children) como props.
  return <DashboardUI user={user}>{children}</DashboardUI>;
}
