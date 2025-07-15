// src/app/dashboard/settings/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SettingsView from './SettingsView';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Busca as categorias e as transações recorrentes em paralelo
  const [categoriesResult, recurringResult] = await Promise.all([
    supabase.from('categories').select('*').eq('user_id', user.id).order('name', { ascending: true }),
    supabase.from('recurring_transactions').select('*, categories (name, icon)').eq('user_id', user.id).order('description', { ascending: true })
  ]);

  return (
    <SettingsView 
      initialCategories={categoriesResult.data || []} 
      initialRecurringTransactions={recurringResult.data || []}
    />
  );
}
