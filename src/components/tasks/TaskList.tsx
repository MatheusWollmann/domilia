// src/components/tasks/TaskList.tsx

import TaskCard from './TaskCard';
import { ClipboardList } from 'lucide-react';
import { type Task } from '@/app/dashboard/tasks/types';

interface TaskListProps {
  tasks: Task[];
}

/**
 * Componente TaskList
 * Responsável por renderizar uma lista de tarefas ou uma mensagem de estado vazio.
 */
export default function TaskList({ tasks }: TaskListProps) {
  // Se a lista de tarefas estiver vazia, exibe um placeholder amigável.
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Nenhuma tarefa encontrada</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Parece que está tudo em ordem por aqui! Crie uma nova tarefa para começar.
        </p>
      </div>
    );
  }

  // Se houver tarefas, renderiza a lista em um grid responsivo.
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}