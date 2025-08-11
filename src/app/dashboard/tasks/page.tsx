// src/app/dashboard/tasks/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TasksView from './TasksView';
import { Task } from './types';
import { DomusMember } from '../settings/types';

export const dynamic = 'force-dynamic';

type PageCategory = {
  id: string;
  nome: string;
}

export default async function TasksPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: domusData, error: domusError } = await supabase
    .from('domus_membra')
    .select('domus_id')
    .eq('user_id', user.id)
    .single();

  if (domusError || !domusData) {
    return <div>Erro ao carregar dados da sua casa.</div>
  }
  const domusId = domusData.domus_id;

  const [tasksResult, categoriesResult, membersResult] = await Promise.all([
    supabase
      .from('tarefas')
      .select(`
        id,
        nome,
        estado,
        deadline,
        categoria:tarefa_categorias (nome, cor),
        atribuido:profiles!tarefas_atribuido_a_id_fkey (full_name, avatar_url)
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('tarefa_categorias')
      .select('id, nome')
      .eq('domus_id', domusId),
    // ✅ CORREÇÃO 1: Adicionamos 'id' à query dos perfis (users)
    supabase
      .from('domus_membra')
      .select(`user_id, role, users:profiles (id, email, raw_user_meta_data)`)
      .eq('domus_id', domusId)
  ]);

  if (tasksResult.error) console.error("Server Fetch Error (Tasks):", tasksResult.error);
  if (categoriesResult.error) console.error("Server Fetch Error (Categories):", categoriesResult.error);
  if (membersResult.error) console.error("Server Fetch Error (Members):", membersResult.error);

  const initialTasks = (tasksResult.data || []).map((task) => ({
    ...task,
    categoria: task.categoria?.[0] ?? null,
    atribuido: Array.isArray(task.atribuido) ? task.atribuido[0] ?? null : task.atribuido,
  })) as Task[];

  const categories = (categoriesResult.data || []) as PageCategory[];
  
  // ✅ CORREÇÃO 2: Normalizamos os dados dos membros para corresponder ao tipo DomusMember
  const members = (membersResult.data || []).map(member => ({
    ...member,
    // Converte o array 'users' em um único objeto ou null
    users: Array.isArray(member.users) ? (member.users[0] ?? null) : member.users
  })) as DomusMember[];

  return (
    <div className="space-y-8">
      <TasksView 
        initialTasks={initialTasks}
        categories={categories}
        members={members}
      />
    </div>
  );
}