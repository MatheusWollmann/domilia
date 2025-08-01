import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardView, { type BudgetData, type TransactionWithCategory, type Category } from './DashboardView';
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, getDate, getMonth, format, parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';

// Tipos mais explícitos para os dados do Supabase
type TransactionDB = { id: string; description: string; amount: number; date: string; type: 'income' | 'expense'; category_id: string; categories: { id: string; name: string; icon: string | null; color: string | null; } | null; };
type RecurringTransactionDB = { id: string; description: string; amount: number; type: 'income' | 'expense'; category_id: string; frequency: 'weekly' | 'monthly' | 'yearly'; day_of_month: number | null; day_of_week: number | null; start_date: string; end_date: string | null; categories: { id: string; name: string; icon: string | null; color: string | null; } | null; };

const generateTransactionsFromRecurring = (recurringItems: RecurringTransactionDB[], startDate: Date, endDate: Date): TransactionWithCategory[] => {
  const generated: TransactionWithCategory[] = [];
  recurringItems.forEach(item => {
    const itemStartDate = parseISO(item.start_date);
    const intervalEnd = item.end_date ? parseISO(item.end_date) : endDate;
    const interval = { start: startDate > itemStartDate ? startDate : itemStartDate, end: intervalEnd < endDate ? intervalEnd : endDate };
    
    if (interval.start > interval.end) return;

    eachDayOfInterval(interval).forEach(day => {
      let shouldCreate = false;
      if (item.frequency === 'monthly' && getDate(day) === item.day_of_month) shouldCreate = true;
      else if (item.frequency === 'weekly' && (getDay(day) + 1) === item.day_of_week) shouldCreate = true;
      else if (item.frequency === 'yearly' && getMonth(day) === getMonth(itemStartDate) && getDate(day) === getDate(itemStartDate)) shouldCreate = true;
      
      if (shouldCreate) {
        generated.push({
          id: `recurring-${item.id}-${format(day, 'yyyy-MM-dd')}`,
          description: item.description,
          amount: item.amount,
          date: format(day, 'yyyy-MM-dd'),
          type: item.type,
          category_id: item.category_id,
          categories: item.categories,
        });
      }
    });
  });
  return generated;
};

export default async function DashboardPage() {
  console.log('--- [DashboardPage] Iniciando busca de dados no servidor ---');
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/login'); }

  console.log(`[DashboardPage] Usuário autenticado: ${user.id}`);

  // 1. Encontrar a "Domus" do usuário
  const { data: domusUser, error: domusUserError } = await supabase
    .from('domus_membra')
    .select('domus_id')
    .eq('user_id', user.id)
    .single();

  if (domusUserError) {
    console.error('[DashboardPage] Erro ao buscar domus_membra:', domusUserError.message);
    return <div>Ocorreu um erro ao carregar os dados da sua casa.</div>;
  }

  if (!domusUser) {
    console.log('[DashboardPage] Usuário não pertence a nenhuma casa.');
    return <div>Você ainda não faz parte de nenhuma casa. Crie uma ou aceite um convite.</div>;
  }

  const { domus_id } = domusUser;
  console.log(`[DashboardPage] Usuário pertence à Domus ID: ${domus_id}`);

  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  // 2. Buscar dados usando os nomes de tabela e IDs corretos
  const [incomesResult, expensesResult, categoriesResult, recurringResult] = await Promise.all([
    // 'incomes' e 'expenses' usam user_id, conforme seu schema
    supabase.from('incomes').select('*, categories:categoriae (id, name, icon, color)').eq('user_id', user.id).gte('date', startDate.toISOString()).lte('date', endDate.toISOString()),
    supabase.from('expenses').select('*, categories:categoriae (id, name, icon, color, budget)').eq('user_id', user.id).gte('date', startDate.toISOString()).lte('date', endDate.toISOString()),
    
    // CORREÇÃO: Usando 'categoriae' e 'domus_id'
    supabase.from('categoriae').select('*').eq('domus_id', domus_id),
    
    // CORREÇÃO: Usando 'transactiones_recurrentes' e 'domus_id'
    supabase.from('transactiones_recurrentes').select('*, categories:categoriae (id, name, icon, color)').eq('domus_id', domus_id)
  ]);

  if (categoriesResult.error) {
    console.error('[DashboardPage] Erro ao buscar categorias (categoriae):', categoriesResult.error.message);
  }

  const oneOffIncomes: TransactionDB[] = incomesResult.data || [];
  const oneOffExpenses: TransactionDB[] = expensesResult.data || [];
  const allCategories: Category[] = categoriesResult.data || [];
  const recurringTransactions = (recurringResult.data as RecurringTransactionDB[]) || [];

  console.log(`[DashboardPage] Busca finalizada. Total de categorias encontradas: ${allCategories.length}`);

  const generatedRecurring = generateTransactionsFromRecurring(recurringTransactions, startDate, endDate);
  
  const allMonthTransactions: (TransactionDB | TransactionWithCategory)[] = [
      ...oneOffIncomes.map(t => ({ ...t, type: 'income' as const })), 
      ...oneOffExpenses.map(t => ({ ...t, type: 'expense' as const })), 
      ...generatedRecurring
  ];
  
  const expenseCategories = allCategories.filter(c => c.type === 'expense');
  const incomeCategories = allCategories.filter(c => c.type === 'income');
  
  const totalIncomes = allMonthTransactions.filter(t => t.type === 'income').reduce((acc, item) => acc + item.amount, 0);
  const totalExpenses = allMonthTransactions.filter(t => t.type === 'expense').reduce((acc, item) => acc + item.amount, 0);
  const balance = totalIncomes - totalExpenses;

  const expensesByCategory = allMonthTransactions
    .filter((t): t is TransactionDB => t.type === 'expense' && t.categories != null)
    .reduce<Record<string, { value: number; color: string }>>((acc, expense) => {
      const categoryName = expense.categories!.name;
      const categoryColor = expense.categories!.color || '#8884d8';
      if (!acc[categoryName]) { acc[categoryName] = { value: 0, color: categoryColor }; }
      acc[categoryName].value += expense.amount;
      return acc;
  }, {});

  const chartData = Object.entries(expensesByCategory).map(([name, data]) => ({ name, value: data.value, color: data.color }));
  
  const budgetedCategories = expenseCategories.filter(c => c.budget != null && c.budget > 0);
  const budgetsData: BudgetData[] = budgetedCategories.map(cat => {
      const spent = allMonthTransactions
          .filter(exp => exp.type === 'expense' && exp.category_id === cat.id)
          .reduce((acc, exp) => acc + exp.amount, 0);
      return { 
          id: cat.id, 
          name: cat.name, 
          icon: cat.icon ?? null,
          spent: spent, 
          budget: cat.budget as number, 
          progress: Math.min((spent / (cat.budget as number)) * 100, 100) 
      };
  });

  const recentTransactions = allMonthTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <DashboardView 
      user={user}
      balance={balance}
      totalIncomes={totalIncomes}
      totalExpenses={totalExpenses}
      recentTransactions={recentTransactions as TransactionWithCategory[]}
      chartData={chartData}
      expenseCategories={expenseCategories}
      incomeCategories={incomeCategories}
      budgetsData={budgetsData}
    />
  );
}
