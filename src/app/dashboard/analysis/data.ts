// src/app/dashboard/analysis/data.ts
'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Income, Expense } from '@/types/database.types';
import { User } from '@supabase/supabase-js';

type TransactionData = {
  user: User | null;
  incomes: Income[];
  expenses: Expense[];
};

export async function getMonthlyTransactions(
  startDate: Date,
  endDate: Date,
): Promise<TransactionData> {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, incomes: [], expenses: [] };
  }

  const commonQuery = (table: 'incomes' | 'expenses') =>
    supabase
      .from(table)
      .select('amount, categories(name, color)')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

  const [incomesResult, expensesResult] = await Promise.all([
    commonQuery('incomes'),
    commonQuery('expenses'),
  ]);

  if (incomesResult.error) throw new Error(`Failed to fetch incomes: ${incomesResult.error.message}`);
  if (expensesResult.error) throw new Error(`Failed to fetch expenses: ${expensesResult.error.message}`);

  // The TypeScript error indicates Supabase is returning `categories` as an array.
  // This happens in one-to-many relationships. We'll take the first element
  // from the array to match our `Income` and `Expense` types, which expect a single category object.
  const incomes: Income[] = (incomesResult.data || []).map((i) => ({
    amount: i.amount,
    // Use optional chaining `?.[0]` to safely get the first category, if it exists.
    categories: i.categories?.[0],
  }));
  const expenses: Expense[] = (expensesResult.data || []).map((e) => ({
    amount: e.amount,
    categories: e.categories?.[0],
  }));

  return { user, incomes, expenses };
}