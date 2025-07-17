// src/app/dashboard/transactions/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TransactionsView from './TransactionsView';
import { startOfMonth, subDays, parseISO, eachDayOfInterval, getDay, getDate, getMonth, format } from 'date-fns';

export const dynamic = 'force-dynamic';

// CORREÇÃO: Definindo tipos específicos para substituir o 'any'
type RecurringRule = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'monthly' | 'weekly' | 'yearly';
  day_of_month: number | null;
  day_of_week: number | null;
  start_date: string;
  end_date: string | null;
  category_id: string;
};

type GeneratedTransaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category_id: string;
};

// CORREÇÃO: Aplicando os tipos na assinatura da função
const generateRecurringInstances = (
  recurringItems: RecurringRule[], 
  startDate: Date, 
  endDate: Date
): GeneratedTransaction[] => {
  // CORREÇÃO: Tipando o array de 'generated'
  const generated: GeneratedTransaction[] = [];

  recurringItems.forEach(item => {
    const itemStartDate = new Date(item.start_date);
    
    const interval = {
      start: startDate > itemStartDate ? startDate : itemStartDate,
      end: item.end_date && new Date(item.end_date) < endDate ? new Date(item.end_date) : endDate,
    };

    if (interval.start > interval.end) return;

    eachDayOfInterval(interval).forEach(day => {
      let shouldCreate = false;
      if (item.frequency === 'monthly' && getDate(day) === item.day_of_month) shouldCreate = true;
      else if (item.frequency === 'weekly' && (getDay(day) + 1) === item.day_of_week) shouldCreate = true;
      else if (item.frequency === 'yearly' && getMonth(day) === getMonth(itemStartDate) && getDate(day) === getDate(itemStartDate)) shouldCreate = true;

      if (shouldCreate) {
        generated.push({
          id: `rec-${item.id}-${format(day, 'yyyy-MM-dd')}`,
          description: item.description,
          amount: item.amount,
          date: format(day, 'yyyy-MM-dd'),
          type: item.type,
          category_id: item.category_id,
        });
      }
    });
  });

  return generated;
};


export default async function TransactionsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [expensesResult, incomesResult, recurringResult, categoriesResult] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', user.id),
    supabase.from('incomes').select('*').eq('user_id', user.id),
    supabase.from('recurring_transactions').select('*').eq('user_id', user.id),
    supabase.from('categories').select('*').eq('user_id', user.id)
  ]);

  const oneOffExpenses = expensesResult.data || [];
  const oneOffIncomes = incomesResult.data || [];
  const recurringRules = (recurringResult.data as RecurringRule[]) || []; // Casting para nosso novo tipo
  const categories = categoriesResult.data || [];

  const firstDayOfHistory = new Date('2020-01-01');
  const yesterday = subDays(startOfMonth(new Date()), 1);

  const pastRecurring = generateRecurringInstances(recurringRules, firstDayOfHistory, yesterday);
  const pastIncomesTotal = oneOffIncomes
    .filter(t => parseISO(t.date) <= yesterday)
    .reduce((sum, t) => sum + t.amount, 0);
  const pastExpensesTotal = oneOffExpenses
    .filter(t => parseISO(t.date) <= yesterday)
    .reduce((sum, t) => sum + t.amount, 0);
  const pastRecurringIncomesTotal = pastRecurring
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const pastRecurringExpensesTotal = pastRecurring
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const startingBalance = (pastIncomesTotal + pastRecurringIncomesTotal) - (pastExpensesTotal + pastRecurringExpensesTotal);

  return (
    <TransactionsView 
      oneOffExpenses={oneOffExpenses}
      oneOffIncomes={oneOffIncomes}
      recurringRules={recurringRules}
      categories={categories}
      startingBalance={startingBalance}
    />
  );
}