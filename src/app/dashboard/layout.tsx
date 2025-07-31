// src/app/dashboard/layout.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import InvitationBanner from './InvitationBanner';
import { PendingInvitation } from './types';

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

  // Busca convites pendentes para o usuário logado usando a função RPC segura.
  // Isso garante que o usuário possa ver os detalhes do convite sem ferir as políticas de segurança.
  const { data: invitations } = await supabase.rpc('get_my_pending_invitations');

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {invitations && invitations.length > 0 && (
            <InvitationBanner invitations={invitations as PendingInvitation[]} />
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
