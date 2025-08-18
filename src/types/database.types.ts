// Em um arquivo como src/types/database.types.ts ou um novo

import type { Database } from '@/lib/supabase'; // Tipos gerados pelo Supabase CLI

// Usando os tipos gerados pelo Supabase como base
export type Task = Database['public']['Tables']['tarefas']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type TaskCategory = Database['public']['Tables']['tarefa_categorias']['Row'];
export type TaskTag = Database['public']['Tables']['tarefa_tags']['Row'];

// Um tipo mais completo para usar na UI, incluindo as relações
export type FullTask = Task & {
  tarefa_categorias: TaskCategory | null;
  criador: Profile | null;
  atribuido_a: Profile | null;
  tarefa_tem_tags: {
    tarefa_tags: TaskTag;
  }[];
};

export type Category = {
  name: string;
  color?: string;
};

export type Income = {
  amount: number;
  categories?: Category;
};

export type Expense = {
  amount: number;
  categories?: Category;
};

// Tipo para o perfil do usuário, combinando dados da tabela 'profiles' e do auth.user
export type UserProfile = {
  full_name: string | null;
  avatar_url: string | null;
  email: string;
};