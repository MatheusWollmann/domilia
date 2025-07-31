// src/app/dashboard/settings/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SettingsTabs from './SettingsTabs';
import { type Category, type RecurringTransaction, type DomusMember, type DomusInvitation, type UnifiedMember } from './types';

export const dynamic = 'force-dynamic';

type MemberRpcResult = {
  user_id: string;
  role: 'owner' | 'member';
  user_email: string;
  user_full_name: string | null;
  user_avatar_url: string | null;
};

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/login'); }

  // 1. Buscar a 'domus' (casa) ativa do usuário.
  const { data: domusData, error: domusError } = await supabase
    .from('domus_membra')
    .select('domus_id, role')
    .eq('user_id', user.id)
    .single();

  if (domusError || !domusData) {
    // Isso não deveria acontecer por causa do gatilho, mas é uma boa prática de segurança.
    console.error("Erro: Usuário não pertence a nenhuma Domus.", domusError);
    return <p>Erro ao carregar dados da sua casa. Por favor, tente novamente.</p>;
  }

  const { domus_id } = domusData;
  const isOwner = domusData.role === 'owner';

  // 2. Buscar os dados das tabelas usando o domus_id.
  const [categoriesResult, recurringResult, membersRpcResult, invitationsRpcResult] = await Promise.all([
    supabase.from('categoriae').select<'*', Category>('*').eq('domus_id', domus_id).order('name'),
    supabase.from('transactiones_recurrentes').select<'*, categoriae(name, icon, color)', RecurringTransaction>('*, categoriae(name, icon, color)').eq('domus_id', domus_id),
    // AQUI ESTÁ A MUDANÇA: Chamar a função RPC em vez de consultar a tabela diretamente.
    supabase.rpc('get_domus_members', { p_domus_id: domus_id }),
    // E AQUI TAMBÉM: Usar uma RPC para buscar os convites de forma segura.
    supabase.rpc('get_domus_invitations', { p_domus_id: domus_id })
  ]);

  // Adicionando tratamento de erro robusto para depuração
  if (categoriesResult.error) console.error('Erro ao buscar categorias:', categoriesResult.error);
  if (recurringResult.error) console.error('Erro ao buscar contas recorrentes:', recurringResult.error);
  if (membersRpcResult.error) console.error('Erro ao buscar membros (RPC):', membersRpcResult.error);
  if (invitationsRpcResult.error) console.error('Erro ao buscar convites (RPC):', invitationsRpcResult.error);

  const categories = categoriesResult.data || [];
  const recurringTransactions = recurringResult.data || [];
  // E AQUI A TRANSFORMAÇÃO: Convertemos o resultado da RPC para o formato que o componente espera.
 const members = (membersRpcResult.data || []).map((m: MemberRpcResult) => ({    user_id: m.user_id,
    role: m.role,
    users: {
      id: m.user_id,
      email: m.user_email,
      raw_user_meta_data: {
        full_name: m.user_full_name,
        avatar_url: m.user_avatar_url,
      }
    }
  })) as DomusMember[];
  const invitations = (invitationsRpcResult.data || []) as DomusInvitation[];
  
  // Unificando as listas para a nova interface
  const unifiedList: UnifiedMember[] = [
    ...members.map(m => ({
      type: 'member' as const,
      userId: m.user_id,
      email: m.users?.email || '',
      fullName: m.users?.raw_user_meta_data?.full_name || null,
      role: m.role,
    })),
    ...invitations.map(i => ({
      type: 'invitation' as const,
      invitationId: i.id,
      email: i.invitee_email,
    }))
  ];

  return (
    <SettingsTabs 
      initialCategories={categories} 
      initialRecurring={recurringTransactions} 
      initialMembers={members}
      initialInvitations={invitations} 
      domusId={domus_id}
      isOwner={isOwner}
    />
  );
}