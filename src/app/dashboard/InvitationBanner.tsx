// src/app/dashboard/InvitationBanner.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { Mail, Check, X, Loader2 } from 'lucide-react';
import { acceptInvitation, declineInvitation } from './settings/actions';
import { type PendingInvitation } from './types';

interface InvitationBannerProps {
  invitations: PendingInvitation[];
}

function ActionButton({ children, variant }: { children: React.ReactNode, variant: 'accept' | 'decline' }) {
  const { pending } = useFormStatus();
  const baseClasses = "px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed";
  const variantClasses = variant === 'accept' 
    ? "bg-indigo-600 text-white hover:bg-indigo-700"
    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500";
  
  return (
    <button type="submit" disabled={pending} className={`${baseClasses} ${variantClasses}`}>
      {pending ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
}

export default function InvitationBanner({ invitations }: InvitationBannerProps) {
  // Por enquanto, vamos mostrar apenas o primeiro convite.
  // Uma implementação mais robusta poderia ter um carrossel ou uma lista.
  const invitation = invitations[0];
  const inviterName = invitation.inviter_name || 'Alguém';
  const domusName = invitation.domus_name || 'uma casa';

  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 rounded-lg p-4 mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-100 dark:bg-indigo-800/50 p-2 rounded-full">
          <Mail className="text-indigo-600 dark:text-indigo-400" size={20} />
        </div>
        <p className="text-sm text-indigo-800 dark:text-indigo-200">
          <span className="font-semibold">{inviterName}</span> convidou você para se juntar à casa <span className="font-semibold">{domusName}</span>.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <form action={acceptInvitation}>
          <input type="hidden" name="invitationId" value={invitation.id} />
          <ActionButton variant="accept">
            <Check size={16} />
            Aceitar
          </ActionButton>
        </form>
        <form action={declineInvitation}>
          <input type="hidden" name="invitationId" value={invitation.id} />
          <ActionButton variant="decline">
            <X size={16} />
            Recusar
          </ActionButton>
        </form>
      </div>
    </div>
  );
}