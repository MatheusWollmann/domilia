// src/app/dashboard/settings/types.ts

export type Category = {
  id: string;
  domus_id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string | null;
  color: string | null;
  budget: number | null;
  created_at: string;
};

export type RecurringTransaction = {
  id: string;
  domus_id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category_id: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  day_of_month: number | null;
  day_of_week: number | null;
  start_date: string;
  created_at: string;
  updated_at: string;
  // This is for the joined data from Supabase
  categoriae: {
    name: string | null;
    icon: string | null;
    color: string | null;
  } | null;
};

export type DomusMember = {
  user_id: string;
  role: 'owner' | 'member';
  users: {
    id: string;
    email: string | null;
    raw_user_meta_data: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
};

export type DomusInvitation = {
  id: string;
  invitee_email: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
};

export type UnifiedMember = {
  type: 'member';
  userId: string;
  email: string;
  fullName: string | null;
  role: 'owner' | 'member';
} | {
  type: 'invitation';
  invitationId: string;
  email: string;
};