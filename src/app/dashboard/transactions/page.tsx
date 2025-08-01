import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TransactionsView from './TransactionsView';
import { startOfMonth, parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';

// A função da página agora usa uma tipagem mais genérica para os searchParams,
// que é a forma recomendada para evitar o erro.
export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/login'); }

  // 1. Encontrar a "Domus" do usuário (lógica que já funciona no seu dashboard)
  const { data: domusUser, error: domusUserError } = await supabase
    .from('domus_membra')
    .select('domus_id')
    .eq('user_id', user.id)
    .single();

  if (domusUserError || !domusUser) {
    console.error('[TransactionsPage] Erro ou usuário sem domus:', domusUserError?.message);
    return <div>Ocorreu um erro ao carregar os dados da sua casa.</div>;
  }

  const { domus_id } = domusUser;

  // 2. CORREÇÃO: Acessando o parâmetro 'month' de forma segura
  const monthParam = searchParams?.month;
  const selectedMonth = typeof monthParam === 'string' ? parseISO(monthParam) : new Date();
  const startDate = startOfMonth(selectedMonth);

  // 3. Buscar dados usando os nomes de tabela e IDs corretos
  const [
    expensesResult, 
    incomesResult, 
    recurringResult, 
    categoriesResult
  ] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', user.id),
    supabase.from('incomes').select('*').eq('user_id', user.id),
    supabase.from('transactiones_recurrentes').select('*').eq('domus_id', domus_id),
    supabase.from('categoriae').select('*').eq('domus_id', domus_id)
  ]);

  const oneOffExpenses = expensesResult.data || [];
  const oneOffIncomes = incomesResult.data || [];
  const recurringRules = recurringResult.data || [];
  const categories = categoriesResult.data || [];
  
  return (
    <TransactionsView 
      user={user}
      oneOffExpenses={oneOffExpenses}
      oneOffIncomes={oneOffIncomes}
      recurringRules={recurringRules}
      categories={categories}
      currentMonth={startDate} 
    />
  );
}
