// src/app/dashboard/types.ts

export type PendingInvitation = {
  id: string;
  domus_id: string;
  invitee_email: string;
  domus_name: string | null;
  inviter_name: string | null;
};