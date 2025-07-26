export type Category = {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon?: string | null;
  color?: string | null;
  budget?: number | null;
};

export type RecurringTransaction = {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category_id: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  day_of_month?: number | null;
  day_of_week?: number | null;
  start_date: string;
  // This is for the joined data from Supabase
  categories?: {
    name: string;
    icon?: string | null;
  } | null;
};