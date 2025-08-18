// src/app/dashboard/tasks/TasksView.tsx
'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import TaskList from '@/components/tasks/TaskList';
import TaskModal from '@/components/tasks/TaskModal';
import { Task } from './types';
import { type DomusMember } from '../settings/types';
import { AlertTriangle, Loader2, ListTodo, PlusCircle } from 'lucide-react';

// O tipo de categoria que o modal usa
type ModalCategory = {
  id: string;
  nome: string;
}

// A chave SWR agora inclui o domusId para garantir o re-fetch correto
const getSWRKey = (domusId: string) => ({
  scope: 'tasks',
  domusId: domusId,
});

const fetcher = async ({ domusId }: { domusId: string }): Promise<Task[]> => {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('tarefas')
    .select(`
      id,
      nome,
      estado,
      deadline,
      categoria:tarefa_categorias (nome, cor),
      atribuido:profiles!tarefas_atribuido_a_id_fkey (full_name, avatar_url)
    `)
    .eq('domus_id', domusId) // FIX: Filter tasks by the user's household
    .order('created_at', { ascending: false });

  if (error) {
    console.error("SWR Fetch Error:", error);
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }
  
  const normalizedTasks = data.map(task => ({
    ...task,
    categoria: Array.isArray(task.categoria) ? task.categoria[0] ?? null : task.categoria,
    atribuido: Array.isArray(task.atribuido) ? task.atribuido[0] ?? null : task.atribuido,
  }));

  return normalizedTasks as Task[];
};

interface TasksViewProps {
  initialTasks: Task[];
  categories: ModalCategory[];
  members: DomusMember[];
  domusId: string; // FIX: Add domusId to props
}

const TasksView: React.FC<TasksViewProps> = ({ initialTasks, categories, members, domusId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: tasks, error, isLoading } = useSWR(getSWRKey(domusId), () => fetcher({ domusId }), {
    fallbackData: initialTasks,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="ml-4 text-gray-500">Carregando tarefas...</p>
      </div>
    );
  }

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

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
            <PlusCircle size={20} />
            Nova Tarefa
          </button>
        </div>
      </div>
      
      <TaskList tasks={tasks || []} />

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        members={members}
      />
    </>
  );
}

export default TasksView;