// src/app/dashboard/analysis/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AnalysisView from './AnalysisView';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

const prepareSankeyData = (incomes: any[], expenses: any[]) => {
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
    return { nodes: [], links: [] };
  }

  // ETAPA 1: Definir a ordem dos nós
  incomes.forEach(income => {
    if (income.amount > 0) {
      addNode(
        income.categories?.name || 'Outras Receitas',
        income.categories?.color || '#82ca9d'
      );
    }
  });

  addNode('Receita Bruta', '#22c55e');
  
  const savings = totalIncome - totalExpense;
  if (savings > 0) {
    addNode('Sobra do Mês', '#8884d8');
  }

  if (totalExpense > 0) {
    addNode('Despesas Totais', '#ef4444');
  }
  
  expenses.forEach(expense => {
    if (expense.amount > 0) {
      addNode(
        expense.categories?.name || 'Outras Despesas',
        expense.categories?.color || '#ff8042'
      );
    }
  });

  // ETAPA 2: Criar os links
  const receitaBrutaNodeIndex = nodeMap.get('Receita Bruta')!;
  incomes.forEach(income => {
    if (income.amount > 0) {
      links.push({
        source: nodeMap.get(income.categories?.name || 'Outras Receitas')!,
        target: receitaBrutaNodeIndex,
        value: income.amount,
      });
    }
  });

  if (savings > 0) {
    links.push({
      source: receitaBrutaNodeIndex,
      target: nodeMap.get('Sobra do Mês')!,
      value: savings,
    });
  }

  if (totalExpense > 0) {
    const despesasTotaisNodeIndex = nodeMap.get('Despesas Totais')!;
    links.push({
      source: receitaBrutaNodeIndex,
      target: despesasTotaisNodeIndex,
      value: totalExpense,
    });

    expenses.forEach(expense => {
      if (expense.amount > 0) {
        links.push({
          source: despesasTotaisNodeIndex,
          target: nodeMap.get(expense.categories?.name || 'Outras Despesas')!,
          value: expense.amount,
        });
      }
    });
  }

  return { nodes, links };
};


// A palavra-chave 'async' é a correção para o erro
export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/login'); }

  const selectedMonth = searchParams.month ? parseISO(searchParams.month) : new Date();
  const startDate = startOfMonth(selectedMonth);
  const endDate = endOfMonth(selectedMonth);

  const { data: incomes } = await supabase
    .from('incomes')
    .select('amount, categories(name, color)')
    .eq('user_id', user.id)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());
    
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, categories(name, color)')
    .eq('user_id', user.id)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());
  
  const sankeyData = prepareSankeyData(incomes || [], expenses || []);

  return <AnalysisView data={sankeyData} currentMonth={startDate} />;
}