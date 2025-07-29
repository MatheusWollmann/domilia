// src/app/dashboard/settings/types.ts

export type Category = {
  id: string;
  user_id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string | null;
  color: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
};

export type RecurringTransaction = {
  id: string;
  user_id: string;
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