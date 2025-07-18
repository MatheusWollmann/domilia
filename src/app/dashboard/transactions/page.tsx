// src/app/dashboard/transactions/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TransactionsView from './TransactionsView';
import { startOfMonth, parseISO } from 'date-fns'; // Adicionar importações

export const dynamic = 'force-dynamic';

// 1. Alterar a função para ser 'async' e aceitar 'searchParams'
export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/login'); }

  // 2. Determinar o mês a partir da URL ou usar a data atual
  const selectedMonth = searchParams.month ? parseISO(searchParams.month) : new Date();
  const startDate = startOfMonth(selectedMonth);

  // A busca de dados continua a mesma, pois o cliente faz a filtragem
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

  return (
    <TransactionsView 
      oneOffExpenses={oneOffExpenses}
      oneOffIncomes={oneOffIncomes}
      recurringRules={recurringRules}
      categories={categories}
      // 3. Passar a propriedade 'currentMonth' que estava faltando
      currentMonth={startDate} 
    />
  );
}