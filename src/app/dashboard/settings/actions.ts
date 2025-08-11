// src/app/dashboard/settings/actions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  domusId: z.string().uuid(),
});

export async function inviteMember(
  prevState: { success: boolean; message: string },
  formData: FormData
) {
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  const validatedFields = inviteSchema.safeParse({
    email: formData.get('email'),
    domusId: formData.get('domusId'),
  });

  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.flatten().fieldErrors.email?.[0] || 'Dados inválidos.' };
  }

  const { email, domusId } = validatedFields.data;

  // 1. Verificar se o usuário é o dono da domus (forma robusta)
  const { data: memberData, error: memberError } = await supabase
    .from('domus_membra')
    .select('role')
    .eq('domus_id', domusId)
    .eq('user_id', user.id)
    .single();

  if (memberError || memberData?.role !== 'owner') {
    return { success: false, message: 'Você não tem permissão para convidar membros para esta casa.' };
  }

  // 2. Verificar se o usuário já é membro usando a função RPC que criamos
  const { data: isMember, error: rpcError } = await supabase.rpc('is_email_in_domus', { p_domus_id: domusId, p_email: email });
  if (rpcError) {
    console.error('Erro ao verificar membro:', rpcError);
    return { success: false, message: 'Ocorreu um erro interno.' };
  }
  if (isMember) {
    return { success: false, message: 'Este usuário já é um membro da sua casa.' };
  }

  // 3. Inserir o convite na tabela
  const { error: inviteError } = await supabase.from('domus_invitationes').insert({ domus_id: domusId, inviter_id: user.id, invitee_email: email });
  if (inviteError) {
    if (inviteError.code === '23505') { // unique_violation
      return { success: false, message: 'Um convite para este e-mail já está pendente.' };
    }
    console.error('Erro ao criar convite:', inviteError);
    return { success: false, message: 'Ocorreu um erro ao enviar o convite.' };
  }

  revalidatePath('/dashboard/settings');
  return { success: true, message: 'Convite enviado com sucesso!' };
}

export async function cancelInvitation(formData: FormData) {
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Não deve acontecer se a página estiver protegida, mas é uma salvaguarda.
    return;
  }

  const invitationId = formData.get('invitationId') as string;
  const domusId = formData.get('domusId') as string;

  if (!invitationId || !domusId) {
    // Dados do formulário inválidos, não faz nada.
    return;
  }

  // A Política de Segurança de Nível de Linha (RLS) "Donos podem cancelar convites pendentes"
  // já garante a segurança, verificando se o usuário é o dono da domus.
  // Portanto, podemos prosseguir com a exclusão.
  const { error } = await supabase
    .from('domus_invitationes')
    .delete()
    .eq('id', invitationId);

  if (error) {
    console.error('Erro ao cancelar convite:', error);

    return;
  }

  revalidatePath('/dashboard/settings');
}

export async function acceptInvitation(formData: FormData) {
  const supabase = createServerActionClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const invitationId = formData.get('invitationId') as string;
  if (!invitationId) return;

  // Chama a função RPC segura que criamos no banco de dados.
  const { error } = await supabase.rpc('accept_domus_invitation', {
    p_invitation_id: invitationId,
    p_user_id: user.id
  });

  if (error) {
    console.error("Erro ao aceitar convite:", error);
    // Idealmente, retornaríamos uma mensagem de erro para a UI.
    return;
  }

  // Revalida o dashboard para refletir a mudança de domus.
  revalidatePath('/dashboard', 'layout');
}

export async function declineInvitation(formData: FormData) {
  const supabase = createServerActionClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const invitationId = formData.get('invitationId') as string;
  if (!invitationId) return;

  // A política de RLS "Convidados podem recusar..." garante a segurança.
  const { error } = await supabase
    .from('domus_invitationes')
    .delete()
    .eq('id', invitationId);
  
  if (error) {
    console.error("Erro ao recusar convite:", error);
    return;
  }

  revalidatePath('/dashboard', 'layout');
}