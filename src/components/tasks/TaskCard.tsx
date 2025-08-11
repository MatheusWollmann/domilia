// src/components/tasks/TaskCard.tsx

import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type Task } from "@/app/dashboard/tasks/types";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  // CORREÇÃO: Usar 'task.deadline' para formatar a data
  const formattedDate = task.deadline
    ? format(new Date(task.deadline), "d 'de' MMM", { locale: ptBR })
    : "Sem prazo";

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col h-full">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
          {task.nome}
        </h3>
        <div className="flex-grow space-y-3 mt-2">
          {/* ... (categoria e atribuído) */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Calendar size={16} />
            <span>{formattedDate}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          {/* ... (status) */}
        </div>
      </div>
    </div>
  );
}
