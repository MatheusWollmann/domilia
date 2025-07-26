// src/app/dashboard/analysis/page.tsx

import { redirect } from 'next/navigation';
import AnalysisView from './AnalysisView';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Income, Expense } from '@/types/database.types';
import { SANKEY_NODE_NAMES, SANKEY_NODE_COLORS } from '@/lib/constants';
import { getMonthlyTransactions } from './data';

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

export default async function AnalysisPage({
  searchParams,
}: {
  // This is the most robust and correct way to type page props in the Next.js App Router.
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const monthParam = searchParams?.month;
  // Safely handle the case where a query param could be an array
  const monthString = Array.isArray(monthParam) ? monthParam[0] : monthParam;
  const selectedMonth = monthString ? parseISO(monthString) : new Date();
  const startDate = startOfMonth(selectedMonth);
  const endDate = endOfMonth(selectedMonth);
  
  // NOTE: Consider adding a Next.js error boundary (error.tsx) to gracefully handle this error.
  const { user, incomes, expenses } = await getMonthlyTransactions(
    startDate,
    endDate,
  );
  
  if (!user) {
    redirect('/login');
  }

  const { nodes, links, totalIncome, totalExpense } = prepareSankeyData(
    incomes,
    expenses,
  );

  const defaultExpense: Expense = {
    amount: 0,
    categories: { name: SANKEY_NODE_NAMES.NOT_APPLICABLE },
  };

  const biggestExpense = expenses.reduce(
    (max, expense) => (expense.amount > max.amount ? expense : max),
    defaultExpense,
  );

  return (
    <AnalysisView
      data={{ nodes, links }}
      currentMonth={startDate}
      totalIncome={totalIncome}
      totalExpense={totalExpense}
      biggestExpense={{
        name:
          biggestExpense.categories?.name ?? SANKEY_NODE_NAMES.NOT_APPLICABLE,
        amount: biggestExpense.amount,
      }}
    />
  );
}