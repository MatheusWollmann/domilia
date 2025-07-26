// src/app/dashboard/analysis/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AnalysisView from './AnalysisView';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Income, Expense } from '@/types/database.types';

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
  
  const receitaBrutaNodeIndex = addNode('Receita Bruta', '#22c55e');

  incomes.forEach(income => {
    if (income.amount > 0) {
      const sourceNodeIndex = addNode(
        income.categories?.name || 'Outras Receitas',
        income.categories?.color || '#82ca9d'
      );
      links.push({
        source: sourceNodeIndex,
        target: receitaBrutaNodeIndex,
        value: income.amount,
      });
    }
  });

  if (totalExpense > 0) {
    const despesasTotaisNodeIndex = addNode('Despesas Totais', '#ef4444');
    links.push({
      source: receitaBrutaNodeIndex,
      target: despesasTotaisNodeIndex,
      value: totalExpense,
    });

    expenses.forEach(expense => {
      if (expense.amount > 0) {
        const targetNodeIndex = addNode(
          expense.categories?.name || 'Outras Despesas',
          expense.categories?.color || '#ff8042'
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
    const savingsNodeIndex = addNode('Sobra do Mês', '#8884d8');
    links.push({
      source: receitaBrutaNodeIndex,
      target: savingsNodeIndex,
      value: savings,
    });
  }

  return { nodes, links, totalIncome, totalExpense };
};

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}) {
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