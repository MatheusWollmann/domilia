// src/app/dashboard/tasks/TasksView.tsx
'use client';

import useSWR from 'swr';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import TaskList from '@/components/tasks/TaskList';
import { Task } from './types';
import { AlertTriangle, Loader2 } from 'lucide-react';

// Chave para o cache do SWR. Usamos um objeto para facilitar a passagem de parâmetros no futuro.
const SWR_KEY = { scope: 'tasks' };

// O "fetcher" é a função que o SWR usará para buscar os dados.
// Ela recebe a chave (SWR_KEY) como argumento.
const fetcher = async (): Promise<Task[]> => {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('tarefas')
    .select(`
      id,
      nome,
      estado,
      data_limite,
      categoria:tarefa_categorias (nome, cor),
      atribuido:profiles (full_name, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("SWR Fetch Error:", error);
    throw new Error(error.message);
  }

  // Se não houver dados, retorna um array vazio.
  if (!data) {
    return [];
  }
  
  // ✅ CORREÇÃO APLICADA AQUI
  // Normaliza os dados para corresponder ao tipo `Task[]`. O Supabase retorna joins
  // como arrays por padrão. Transformamos `categoria: [{...}]` em `categoria: {...}`
  // e `atribuido: [{...}]` em `atribuido: {...}`.
  const normalizedTasks = data.map(task => ({
    ...task,
    categoria: task.categoria?.[0] ?? null,
    atribuido: task.atribuido?.[0] ?? null,
  }));

  return normalizedTasks;
};

interface TasksViewProps {
  initialTasks: Task[];
}

/**
 * Componente TasksView
 * Orquestra a busca de dados com SWR e renderiza os estados de UI
 * (loading, error, success) para a lista de tarefas.
 */
export default function TasksView({ initialTasks }: TasksViewProps) {
  const { data: tasks, error, isLoading } = useSWR(SWR_KEY, fetcher, {
    // `fallbackData` é usado para a renderização inicial, vindo do Server Component.
    // Isso evita um piscar na tela e melhora o SEO/performance.
    fallbackData: initialTasks,
  });

  // Estado de Carregamento
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="ml-4 text-gray-500">Carregando tarefas...</p>
      </div>
    );
  }

  // Estado de Erro
  if (error) {
    return (
      <div className="text-center py-16 px-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-semibold text-red-800 dark:text-red-200">Ocorreu um erro</h3>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300">
          Não foi possível carregar as tarefas. Tente recarregar a página.
        </p>
      </div>
    );
  }

  // Estado de Sucesso (com ou sem dados)
  return <TaskList tasks={tasks || []} />;
}