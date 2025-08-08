import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TransactionsView from './TransactionsView';
import { startOfMonth, parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';

// Esta é a Page (Server Component). A única prop que ela pode receber da estrutura do Next.js é `searchParams`.
export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 1. A busca de dados (usuário, transações, etc.) acontece aqui, no servidor.
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/login'); }

  // Busca a "Domus" do usuário
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

  // Processa o mês atual a partir dos searchParams
  const monthParam = searchParams?.month;
  const selectedMonth = typeof monthParam === 'string' ? parseISO(monthParam) : new Date();
  const startDate = startOfMonth(selectedMonth);

  // Faz todas as buscas de dados necessárias para a página
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
  
  // 2. Os dados buscados e processados são então passados como props para o Client Component abaixo.
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