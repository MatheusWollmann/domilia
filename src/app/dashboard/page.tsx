// src/app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardView, { type BudgetData, type TransactionWithCategory, type Category } from './DashboardView';
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, getDate, getMonth, format, parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';

// Tipos mais explícitos para os dados do Supabase
type CategoryDB = { id: string; name: string; icon: string | null; color: string | null; budget?: number | null };
type TransactionDB = { id: string; description: string; amount: number; date: string; type: 'income' | 'expense'; category_id: string; categories: { id: string; name: string; icon: string | null; color: string | null; } | null; };
type RecurringTransactionDB = TransactionDB & { frequency: 'weekly' | 'monthly' | 'yearly'; day_of_month: number | null; day_of_week: number | null; start_date: string; end_date: string | null; };

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
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/login'); }

  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  const [incomesResult, expensesResult, categoriesResult, recurringResult] = await Promise.all([
    supabase.from('incomes').select('*, categories (id, name, icon, color)').eq('user_id', user.id).gte('date', startDate.toISOString()).lte('date', endDate.toISOString()),
    supabase.from('expenses').select('*, categories (id, name, icon, color, budget)').eq('user_id', user.id).gte('date', startDate.toISOString()).lte('date', endDate.toISOString()),
    supabase.from('categories').select('*').eq('user_id', user.id),
    supabase.from('recurring_transactions').select('*, categories (id, name, icon, color)').eq('user_id', user.id)
  ]);

  const oneOffIncomes: TransactionDB[] = incomesResult.data || [];
  const oneOffExpenses: TransactionDB[] = expensesResult.data || [];
  const allCategories: Category[] = categoriesResult.data || [];
  const recurringTransactions = (recurringResult.data as RecurringTransactionDB[]) || [];

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
    .filter((t): t is TransactionDB => t.type === 'expense')
    .reduce<Record<string, { value: number; color: string }>>((acc, expense) => {
      const categoryName = expense.categories?.name || 'Sem Categoria';
      const categoryColor = expense.categories?.color || '#8884d8';
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
          icon: cat.icon ?? null, // Correção aqui
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
  )
}
