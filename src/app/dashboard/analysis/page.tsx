// src/app/dashboard/analysis/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AnalysisView from './AnalysisView';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Income, Expense } from '@/types/database.types';
import { SANKEY_NODE_NAMES, SANKEY_NODE_COLORS } from '@/lib/constants';

// A função prepareSankeyData permanece a mesma
const prepareSankeyData = (incomes: Income[], expenses: Expense[]) => {
  const nodes: { name: string; color: string }[] = [];
  const links: { source: number; target: number; value: number }[] = [];
  const nodeMap = new Map<string, number>();

  const addNode = (name: string, color: string) => {
    if (!nodeMap.has(name)) {
      nodeMap.set(name, nodes.length);
      nodes.push({ name, color });
    }
    return nodeMap.get(name)!;
  };
  
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (totalIncome === 0) {
    return { nodes: [], links: [], totalIncome, totalExpense };
  }
  
  const receitaBrutaNodeIndex = addNode(SANKEY_NODE_NAMES.GROSS_INCOME, SANKEY_NODE_COLORS.GROSS_INCOME);

  incomes.forEach(income => {
    if (income.amount > 0) {
      const sourceNodeIndex = addNode(
        income.categories?.name || SANKEY_NODE_NAMES.OTHER_INCOMES,
        income.categories?.color || SANKEY_NODE_COLORS.OTHER_INCOMES
      );
      links.push({
        source: sourceNodeIndex,
        target: receitaBrutaNodeIndex,
        value: income.amount,
      });
    }
  });

  if (totalExpense > 0) {
    const despesasTotaisNodeIndex = addNode(SANKEY_NODE_NAMES.TOTAL_EXPENSES, SANKEY_NODE_COLORS.TOTAL_EXPENSES);
    links.push({
      source: receitaBrutaNodeIndex,
      target: despesasTotaisNodeIndex,
      value: totalExpense,
    });

    expenses.forEach(expense => {
      if (expense.amount > 0) {
        const targetNodeIndex = addNode(
          expense.categories?.name || SANKEY_NODE_NAMES.OTHER_EXPENSES,
          expense.categories?.color || SANKEY_NODE_COLORS.OTHER_EXPENSES
        );
        links.push({
          source: despesasTotaisNodeIndex,
          target: targetNodeIndex,
          value: expense.amount,
        });
      }
    });
  }
  
  const savings = totalIncome - totalExpense;
  if (savings > 0) {
    const savingsNodeIndex = addNode(SANKEY_NODE_NAMES.MONTHLY_SAVINGS, SANKEY_NODE_COLORS.MONTHLY_SAVINGS);
    links.push({
      source: receitaBrutaNodeIndex,
      target: savingsNodeIndex,
      value: savings,
    });
  }

  return { nodes, links, totalIncome, totalExpense };
};

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function AnalysisPage({ searchParams }: PageProps) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/login'); }

  const monthParam = searchParams?.month;
  // Safely handle the case where a query param could be an array
  const monthString = Array.isArray(monthParam) ? monthParam[0] : monthParam;
  const selectedMonth = monthString ? parseISO(monthString) : new Date();
  const startDate = startOfMonth(selectedMonth);
  const endDate = endOfMonth(selectedMonth);

  const fetchTransactions = async () => {
    const commonQuery = (table: 'incomes' | 'expenses') => supabase
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

    return { incomes: incomesResult.data, expenses: expensesResult.data };
  };

  // NOTE: Consider adding a Next.js error boundary (error.tsx) to gracefully handle this error.
  const { incomes, expenses } = await fetchTransactions();
  
  const flatIncomes = (incomes || []).map(i => ({
    amount: i.amount,
    // Supabase returns a one-to-many relation as an array, so we take the first item.
    categories: i.categories?.[0],
  }));

  const flatExpenses = (expenses || []).map(e => ({
    amount: e.amount,
    categories: e.categories?.[0],
  }));

  const { nodes, links, totalIncome, totalExpense } = prepareSankeyData(flatIncomes, flatExpenses);

  const biggestExpense = flatExpenses.reduce((max, expense) =>
    (expense.amount || 0) > (max.amount || 0) ? expense : max,
    { amount: 0, categories: { name: 'N/A', color: '#71717a' } }
  );

  return (
    <AnalysisView 
      data={{ nodes, links }} 
      currentMonth={startDate}
      totalIncome={totalIncome}
      totalExpense={totalExpense}
      biggestExpense={{
        name: biggestExpense.categories?.name ?? 'N/A',
        amount: biggestExpense.amount
      }}
    />
  );
}