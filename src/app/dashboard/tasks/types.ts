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
  data_limite: string | null;
  // Supabase aninha os resultados de joins em propriedades com o nome da relação
  categoria: TaskCategory | null;
  atribuido: TaskAssignee | null;
};