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
      .eq('domus_id', domusId) // FIX: Filter tasks by the user's household
      .order('created_at', { ascending: false }),
    supabase
      .from('tarefa_categorias')
      .select('id, nome')
      .eq('domus_id', domusId),
    // FIX: Correctly join domus_membra with profiles table
    supabase
      .from('domus_membra')
      .select('user_id, role, profiles(id, full_name, avatar_url)')
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
  
  const members = (membersResult.data || [])
    .map(member => {
      // Supabase may return a one-to-one join as a single object or an array
      const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;

      if (!profile) {
        return null;
      }
      return {
        user_id: member.user_id,
        role: member.role,
        users: {
          id: profile.id,
          email: null, // Email is not available in the profiles table
          raw_user_meta_data: {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          },
        },
      };
    })
    .filter(Boolean) as DomusMember[];

  return (
    <div className="space-y-8">
      <TasksView 
        initialTasks={initialTasks}
        categories={categories}
        members={members}
        domusId={domusId}
      />
    </div>
  );
}