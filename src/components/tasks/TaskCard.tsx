// src/components/tasks/TaskCard.tsx

import { User, Tag, Calendar, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- Tipos de Dados ---
// Estes tipos virão do nosso futuro arquivo `src/app/dashboard/tasks/types.ts`

type TaskAssignee = {
  full_name: string | null;
  avatar_url: string | null;
};

type TaskCategory = {
  nome: string;
  cor: string;
};

export type Task = {
  id: string;
  nome: string;
  estado: 'A Fazer' | 'Em Progresso' | 'Concluído';
  data_limite: string | null;
  categoria: TaskCategory | null;
  atribuido: TaskAssignee | null;
};

interface TaskCardProps {
  task: Task;
}

// --- Mapeamento de Cores para o Status ---
// Podemos refinar isso depois, mas é um bom começo.
const statusStyles = {
  'A Fazer': 'bg-gray-200 text-gray-800',
  'Em Progresso': 'bg-blue-200 text-blue-800',
  'Concluído': 'bg-green-200 text-green-800',
};

/**
 * Componente TaskCard
 * * Exibe as informações essenciais de uma única tarefa em um formato de card.
 * É projetado para ser responsivo e informativo.
 */
export default function TaskCard({ task }: TaskCardProps) {
  
  // Formata a data de forma segura, retornando um placeholder se não houver data.
  const formattedDate = task.data_limite
    ? format(new Date(task.data_limite), "d 'de' MMM", { locale: ptBR })
    : 'Sem prazo';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col h-full">
        {/* Nome da Tarefa */}
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
          {task.nome}
        </h3>

        {/* Informações da Tarefa (flex-grow para empurrar os metadados para baixo) */}
        <div className="flex-grow space-y-3 mt-2">
          {/* Categoria */}
          {task.categoria && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Tag size={16} />
              <span 
                className="font-medium px-2 py-0.5 rounded-full text-xs"
                style={{ 
                  backgroundColor: `${task.categoria.cor}20`, // Cor com 20% de opacidade
                  color: task.categoria.cor 
                }}
              >
                {task.categoria.nome}
              </span>
            </div>
          )}

          {/* Pessoa Atribuída */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <User size={16} />
            <span>{task.atribuido?.full_name || 'Não atribuído'}</span>
          </div>

          {/* Data Limite */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Calendar size={16} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Status (Rodapé do Card) */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
           <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[task.estado]}`}>
              <Circle size={10} fill="currentColor" />
              {task.estado}
           </span>
        </div>
      </div>
    </div>
  );
}