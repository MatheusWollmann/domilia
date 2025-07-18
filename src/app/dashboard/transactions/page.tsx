// src/app/dashboard/transactions/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TransactionsView from './TransactionsView';

// Remova as importações de 'date-fns' que não são mais necessárias aqui
// A função 'generateRecurringInstances' será movida para o cliente que já a possui

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/login'); }

  // Buscamos TODOS os dados, sem filtro de data no servidor.
  // O cliente fará todo o trabalho de filtragem e cálculo.
  const [expensesResult, incomesResult, recurringResult, categoriesResult] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', user.id),
    supabase.from('incomes').select('*').eq('user_id', user.id),
    supabase.from('recurring_transactions').select('*').eq('user_id', user.id),
    supabase.from('categories').select('*').eq('user_id', user.id)
  ]);

  const oneOffExpenses = expensesResult.data || [];
  const oneOffIncomes = incomesResult.data || [];
  const recurringRules = recurringResult.data || [];
  const categories = categoriesResult.data || [];

  // Não calculamos mais o startingBalance aqui.
  // Passamos os dados brutos para o componente de cliente.
  return (
    <TransactionsView 
      oneOffExpenses={oneOffExpenses}
      oneOffIncomes={oneOffIncomes}
      recurringRules={recurringRules}
      categories={categories}
    />
  );
}