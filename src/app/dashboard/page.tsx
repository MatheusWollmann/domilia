// src/app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardView from './DashboardView';
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, getDate, getMonth, format } from 'date-fns';

export const dynamic = 'force-dynamic';

type ExpenseWithCategory = {
  amount: number;
  categories: { name: string; color: string | null; } | null;
  [key: string]: any;
};

// Função auxiliar para gerar transações a partir das regras de recorrência
const generateTransactionsFromRecurring = (
  recurringItems: any[], 
  startDate: Date, 
  endDate: Date
) => {
  const generated: any[] = [];

  recurringItems.forEach(item => {
    const itemStartDate = new Date(item.start_date);
    
    // Define o intervalo para o qual gerar transações, respeitando a data de início da regra
    const interval = {
      start: startDate > itemStartDate ? startDate : itemStartDate,
      end: item.end_date && new Date(item.end_date) < endDate ? new Date(item.end_date) : endDate,
    };

    if (interval.start > interval.end) return;

    const allDaysInInterval = eachDayOfInterval(interval);

    allDaysInInterval.forEach(day => {
      let shouldCreate = false;
      if (item.frequency === 'monthly' && getDate(day) === item.day_of_month) {
        shouldCreate = true;
      } else if (item.frequency === 'weekly' && (getDay(day) + 1) === item.day_of_week) { // getDay é 0-6 (Dom-Sáb), nosso day_of_week é 1-7
        shouldCreate = true;
      } else if (item.frequency === 'yearly' && getMonth(day) === getMonth(itemStartDate) && getDate(day) === getDate(itemStartDate)) {
        shouldCreate = true;
      }

      if (shouldCreate) {
        generated.push({
          id: `recurring-${item.id}-${format(day, 'yyyy-MM-dd')}`, // ID único para a instância
          description: item.description,
          amount: item.amount,
          date: format(day, 'yyyy-MM-dd'),
          type: item.type,
          category_id: item.category_id,
          categories: item.categories, // Passa a informação da categoria aninhada
          is_recurring_instance: true, // Flag para identificar
        });
      }
    });
  });

  return generated;
};

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  const [incomesResult, expensesResult, categoriesResult, recurringResult] = await Promise.all([
    supabase.from('incomes').select('*, categories (id, name, icon, color)').eq('user_id', user.id).gte('date', startDate.toISOString()).lte('date', endDate.toISOString()),
    supabase.from('expenses').select('*, categories (id, name, icon, color, budget)').eq('user_id', user.id).gte('date', startDate.toISOString()).lte('date', endDate.toISOString()),
    supabase.from('categories').select('*').eq('user_id', user.id),
    supabase.from('recurring_transactions').select('*, categories (id, name, icon, color)').eq('user_id', user.id)
  ]);

  const oneOffIncomes = incomesResult.data || [];
  const oneOffExpenses: ExpenseWithCategory[] = (expensesResult.data as any) || [];
  const allCategories = categoriesResult.data || [];
  const recurringTransactions = recurringResult.data || [];

  // Gera as instâncias de transações recorrentes para o mês atual
  const generatedRecurring = generateTransactionsFromRecurring(recurringTransactions, startDate, endDate);

  // Combina transações normais e as instâncias geradas
  const allMonthTransactions = [
    ...oneOffIncomes.map(t => ({ ...t, type: 'income' })),
    ...oneOffExpenses.map(t => ({ ...t, type: 'expense' })),
    ...generatedRecurring
  ];

  const expenseCategories = allCategories.filter(c => c.type === 'expense');
  const incomeCategories = allCategories.filter(c => c.type === 'income');

  // Recalcula os totais com base na lista unificada
  const totalIncomes = allMonthTransactions.filter(t => t.type === 'income').reduce((acc, item) => acc + item.amount, 0);
  const totalExpenses = allMonthTransactions.filter(t => t.type === 'expense').reduce((acc, item) => acc + item.amount, 0);
  const balance = totalIncomes - totalExpenses;

  // Agrega despesas (normais e recorrentes) por categoria para o gráfico
  const expensesByCategory = allMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce<Record<string, { value: number; color: string }>>((acc, expense) => {
      const categoryName = expense.categories?.name || 'Sem Categoria';
      const categoryColor = expense.categories?.color || '#8884d8';
      if (!acc[categoryName]) {
        acc[categoryName] = { value: 0, color: categoryColor };
      }
      acc[categoryName].value += expense.amount;
      return acc;
    }, {});

  const chartData = Object.entries(expensesByCategory).map(([name, data]) => ({
    name,
    value: data.value,
    color: data.color
  }));
  
  const budgetedCategories = expenseCategories.filter(c => c.budget != null && c.budget > 0);
  const budgetsData = budgetedCategories.map(cat => {
      const spent = allMonthTransactions
          .filter(exp => exp.type === 'expense' && exp.category_id === cat.id)
          .reduce((acc, exp) => acc + exp.amount, 0);
      return {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          spent: spent,
          budget: cat.budget as number,
          progress: Math.min((spent / (cat.budget as number)) * 100, 100)
      };
  });

  // Ordena a lista unificada para mostrar as transações mais recentes
  const recentTransactions = allMonthTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <DashboardView 
      user={user}
      balance={balance}
      totalIncomes={totalIncomes}
      totalExpenses={totalExpenses}
      recentTransactions={recentTransactions}
      chartData={chartData}
      expenseCategories={expenseCategories}
      incomeCategories={incomeCategories}
      budgetsData={budgetsData}
    />
  )
}
