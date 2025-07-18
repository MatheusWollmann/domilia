// src/app/dashboard/analysis/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AnalysisView from './AnalysisView';
import { startOfMonth, endOfMonth } from 'date-fns';

// --- LÓGICA DE PREPARAÇÃO DE DADOS FINAL E CORRIGIDA ---
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
  
  // Se não houver transações, retorna dados vazios para evitar erros.
  if (incomes.length === 0 && expenses.length === 0) {
    return { nodes, links };
  }
  
  // 1. Nó Central de Receitas
  const totalIncomesNodeIndex = addNode('Total de Receitas', '#22c55e');

  // 2. Conecta as fontes de renda individuais ao nó central
  incomes.forEach(income => {
    if (income.amount > 0) {
      const sourceNodeIndex = addNode(
        income.categories?.name || 'Outras Receitas',
        income.categories?.color || '#82ca9d' // Usa a cor da categoria ou um padrão
      );
      links.push({
        source: sourceNodeIndex,
        target: totalIncomesNodeIndex,
        value: income.amount,
      });
    }
  });

  // 3. Conecta o nó central às categorias de despesa individuais
  expenses.forEach(expense => {
    if (expense.amount > 0) {
      const targetNodeIndex = addNode(
        expense.categories?.name || 'Outras Despesas',
        expense.categories?.color || '#ff7300' // Usa a cor da categoria ou um padrão
      );
      links.push({
        source: totalIncomesNodeIndex,
        target: targetNodeIndex,
        value: expense.amount,
      });
    }
  });

  // 4. Calcula a sobra e conecta do nó central para um nó de "Sobra"
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savings = totalIncome - totalExpense;

  if (savings > 0) {
    const savingsNodeIndex = addNode('Sobra do Mês', '#8884d8');
    links.push({
      source: totalIncomesNodeIndex,
      target: savingsNodeIndex,
      value: savings,
    });
  }

  return { nodes, links };
};


export default async function AnalysisPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/login'); }

  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  // --- CORREÇÃO PRINCIPAL: Buscando a 'cor' da categoria ---
  const { data: incomes } = await supabase
    .from('incomes')
    .select('amount, categories(name, color)') // <-- ADICIONADO 'color'
    .eq('user_id', user.id)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());
    
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, categories(name, color)') // <-- ADICIONADO 'color'
    .eq('user_id', user.id)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());
  
  const sankeyData = prepareSankeyData(incomes || [], expenses || []);

  return <AnalysisView data={sankeyData} />;
}