// src/app/dashboard/tasks/actions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema para validar os dados do formulário com Zod
const taskSchema = z.object({
  nome: z.string().min(3, { message: 'O nome da tarefa deve ter pelo menos 3 caracteres.' }),
  descricao: z.string().optional(),
  // Permite string vazia, que será tratada como null
  categoria_id: z.string().uuid({ message: 'ID de categoria inválido.' }).optional().or(z.literal('')),
  atribuido_a_id: z.string().uuid({ message: 'ID de membro inválido.' }).optional().or(z.literal('')),
  deadline: z.string().optional(),
});

// Interface para o estado do formulário, usada pelo hook useFormState
export interface TaskFormState {
  success: boolean;
  message: string;
  errors?: {
    nome?: string[];
    descricao?: string[];
    categoria_id?: string[];
    atribuido_a_id?: string[];
    deadline?: string[];
  }
}

// Server Action para criar a tarefa
export async function createTask(prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  // Busca o domus_id do usuário logado para associar a tarefa à casa correta
  const { data: domusData } = await supabase
    .from('domus_membra')
    .select('domus_id')
    .eq('user_id', user.id)
    .single();

  if (!domusData) {
    return { success: false, message: 'Erro: Usuário não associado a uma casa.' };
  }

  const deadlineValue = formData.get('deadline');
  
  const validatedFields = taskSchema.safeParse({
    nome: formData.get('nome'),
    descricao: formData.get('descricao'),
    categoria_id: formData.get('categoria_id'),
    atribuido_a_id: formData.get('atribuido_a_id'),
    // Garante que uma string de data vazia seja convertida para null
    deadline: deadlineValue === '' ? null : deadlineValue,
  });
  
  if (!validatedFields.success) {
    return { 
      success: false, 
      message: 'Por favor, corrija os erros no formulário.',
      errors: validatedFields.error.flatten().fieldErrors 
    };
  }

  // Prepara os dados para inserção, convertendo strings vazias em null
  const dataToInsert = {
    ...validatedFields.data,
    domus_id: domusData.domus_id,
    criador_id: user.id,
    estado: 'A Fazer' as const, // Estado inicial padrão
    categoria_id: validatedFields.data.categoria_id === '' ? null : validatedFields.data.categoria_id,
    atribuido_a_id: validatedFields.data.atribuido_a_id === '' ? null : validatedFields.data.atribuido_a_id,
  };

  const { error } = await supabase.from('tarefas').insert(dataToInsert);

  if (error) {
    console.error('Erro ao criar tarefa:', error);
    return { success: false, message: `Erro do banco de dados: ${error.message}` };
  }

  // Revalida o path para que o SWR busque os dados atualizados e a nova tarefa apareça na lista
  revalidatePath('/dashboard/tasks');
  return { success: true, message: 'Tarefa criada com sucesso!' };
}