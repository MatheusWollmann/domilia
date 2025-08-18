// src/app/dashboard/settings/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SettingsTabs from './SettingsTabs';
import { type Category, type RecurringTransaction, type DomusMember, type DomusInvitation, type TaskCategory } from './types';

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
    console.error("Erro: Usuário não pertence a nenhuma Domus.", domusError);
    return <p>Erro ao carregar dados da sua casa. Por favor, tente novamente.</p>;
  }

  const { domus_id } = domusData;
  const isOwner = domusData.role === 'owner';

  // 2. Buscar os dados das tabelas usando o domus_id.
  const [categoriesResult, taskCategoriesResult, recurringResult, membersRpcResult, invitationsRpcResult] = await Promise.all([
    supabase.from('categoriae').select<'*', Category>('*').eq('domus_id', domus_id).order('name'),
    supabase.from('tarefa_categorias').select<'*', TaskCategory>('*').eq('domus_id', domus_id).order('nome'),
    supabase.from('transactiones_recurrentes').select<'*, categoriae(name, icon, color)', RecurringTransaction>('*, categoriae(name, icon, color)').eq('domus_id', domus_id),
    supabase.rpc('get_domus_members', { p_domus_id: domus_id }),
    supabase.rpc('get_domus_invitations', { p_domus_id: domus_id })
  ]);

  if (categoriesResult.error) console.error('Erro ao buscar categorias:', categoriesResult.error);
  if (taskCategoriesResult.error) console.error('Erro ao buscar categorias de tarefas:', taskCategoriesResult.error);
  if (recurringResult.error) console.error('Erro ao buscar contas recorrentes:', recurringResult.error);
  if (membersRpcResult.error) console.error('Erro ao buscar membros (RPC):', membersRpcResult.error);
  if (invitationsRpcResult.error) console.error('Erro ao buscar convites (RPC):', invitationsRpcResult.error);

  const categories = categoriesResult.data || [];
  const taskCategories = taskCategoriesResult.data || [];
  const recurringTransactions = recurringResult.data || [];
  const members = (membersRpcResult.data || []).map((m: MemberRpcResult) => ({
    user_id: m.user_id,
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

  return (
    <SettingsTabs 
      initialCategories={categories} 
      initialTaskCategories={taskCategories}
      initialRecurring={recurringTransactions} 
      initialMembers={members}
      initialInvitations={invitations} 
      domusId={domus_id}
      isOwner={isOwner}
    />
  );
}