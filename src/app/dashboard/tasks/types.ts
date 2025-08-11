// src/app/dashboard/tasks/types.ts

/**
 * Representa os dados aninhados da pessoa atribuída à tarefa.
 * Vem da tabela 'profiles'.
 */
export type TaskAssignee = {
  full_name: string | null;
  avatar_url: string | null;
};

/**
 * Representa os dados aninhados da categoria da tarefa.
 * Vem da tabela 'tarefa_categorias'.
 */
export type TaskCategory = {
  nome: string;
  cor: string;
};

/**
 * Tipo principal para uma Tarefa, incluindo os dados das tabelas relacionadas.
 * Este é o tipo que nossos componentes irão consumir.
 */
export type Task = {
  id: string;
  nome: string;
  estado: 'A Fazer' | 'Em Progresso' | 'Concluído';
  deadline: string | null; // CORREÇÃO: 'prazo' alterado para 'deadline'
  categoria: TaskCategory | null;
  atribuido: TaskAssignee | null;
};