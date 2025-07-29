// src/app/dashboard/settings/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SettingsTabs from './SettingsTabs';
import { type Category, type RecurringTransaction } from './types';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/login'); }

  // Buscar todos os dados necessários para a página de configurações
  const [categoriesResult, recurringResult] = await Promise.all([
    supabase.from('categoriae').select<'*', Category>('*').eq('user_id', user.id).order('name'),
    supabase.from('transactiones_recurrentes').select<'*, categoriae(name, icon, color)', RecurringTransaction>('*, categoriae(name, icon, color)').eq('user_id', user.id)
  ]);

  const categories = categoriesResult.data || [];
  const recurringTransactions = recurringResult.data || [];

  return (
    <SettingsTabs initialCategories={categories} initialRecurring={recurringTransactions} />
  );
}