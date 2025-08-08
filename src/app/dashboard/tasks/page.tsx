// src/app/dashboard/tasks/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TasksView from './TasksView';
import { Task } from './types';
import { ListTodo, PlusCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

/**
 * Página de Tarefas (Server Component)
 * Busca os dados iniciais no servidor para popular o SWR no cliente.
 */
export default async function TasksPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Proteção de rota
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Busca inicial dos dados no servidor. A RLS garante que apenas tarefas do domus correto sejam retornadas.
  const { data: initialTasks, error } = await supabase
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
    console.error("Server Fetch Error:", error);
    // Podemos mostrar uma mensagem de erro mais elaborada aqui se quisermos
  }

  // ✅ CORREÇÃO APLICADA AQUI
  // Normaliza os dados brutos do Supabase para o tipo `Task` esperado pelo componente `TasksView`.
  // Converte os campos `categoria` and `atribuido`, que vêm como arrays, para um objeto único ou null.
  const normalizedTasks = (initialTasks || []).map((task) => ({
    ...task,
    categoria: task.categoria?.[0] ?? null,
    atribuido: task.atribuido?.[0] ?? null,
  })) as Task[];

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <ListTodo size={30} />
            Quadro de Tarefas
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Organize e acompanhe as responsabilidades da casa.
          </p>
        </div>
        <div>
          <button className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
            <PlusCircle size={20} />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* A View do Cliente recebe os dados já normalizados e com a tipagem correta */}
      <TasksView initialTasks={normalizedTasks} />
    </div>
  );
}