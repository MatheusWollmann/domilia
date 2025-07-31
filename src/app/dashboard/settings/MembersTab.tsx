// src/app/dashboard/settings/MembersTab.tsx
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { UserPlus, Mail, Trash2, Crown, User, Loader2 } from 'lucide-react';
import { type DomusMember, type DomusInvitation } from './types';
import { inviteMember, cancelInvitation } from './actions';

interface MembersTabProps {
  initialMembers: DomusMember[];
  initialInvitations: DomusInvitation[];
  domusId: string;
  isOwner: boolean;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
      {pending ? 'Enviando...' : 'Convidar'}
    </button>
  );
}

function CancelButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed">
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}

export default function MembersTab({ initialMembers: members, initialInvitations: invitations, domusId, isOwner }: MembersTabProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState(inviteMember, { success: false, message: '' });

  useEffect(() => {
    if (state.success) {
      // O revalidatePath na action deve atualizar a lista, mas para uma melhor UX,
      // limpamos o formulário imediatamente.
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Coluna da esquerda: Membros e Convites */}
      <div className="space-y-8">
        {/* Lista de Membros */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Membros da Casa</h2>
          <div className="space-y-3">
            {members.map(member => (
              <div key={member.user_id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-gray-200 dark:bg-gray-700 rounded-full h-10 w-10 flex items-center justify-center font-bold text-gray-500">
                    {member.users?.email?.[0].toUpperCase() || '?'}
                  </span>
                  <div>
                    <p className="font-medium">{member.users?.raw_user_meta_data?.full_name || member.users?.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      {member.role === 'owner' ? <Crown size={14} className="text-yellow-500" /> : <User size={14} />}
                      {member.role === 'owner' ? 'Dono(a)' : 'Membro'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de Convites Pendentes */}
        {isOwner && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Convites Pendentes</h2>
            {invitations.length > 0 ? (
              <div className="space-y-3">
                {invitations.map(invitation => (
                  <div key={invitation.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-400" />
                      <p className="font-medium">{invitation.invitee_email}</p>
                    </div>
                    <form action={cancelInvitation}>
                      <input type="hidden" name="invitationId" value={invitation.id} />
                      <input type="hidden" name="domusId" value={domusId} />
                      <CancelButton />
                    </form>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-500">Nenhum convite pendente.</p>}
          </div>
        )}
      </div>

      {/* Coluna da direita: Formulário de Convite */}
      {isOwner && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 h-fit">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><UserPlus size={22} /> Convidar Novo Membro</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">O membro convidado terá acesso a todas as finanças da casa.</p>
          <form ref={formRef} action={formAction} className="space-y-4">
            <input type="hidden" name="domusId" value={domusId} />
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                required 
                className="w-full input-style" 
                placeholder="nome@exemplo.com" 
              />
            </div>
            <div className="flex justify-end">
              <SubmitButton />
            </div>
            {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>{state.message}</p>}
          </form>
        </div>
      )}
    </div>
  );
}