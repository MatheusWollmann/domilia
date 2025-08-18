// src/app/dashboard/settings/TaskCategoriesTab.tsx
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Edit, Trash2, Loader2, X, Tag } from 'lucide-react';
import { type TaskCategory } from './types';

const taskCategorySchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  cor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida.'),
});

type TaskCategoryFormData = z.infer<typeof taskCategorySchema>;

interface TaskCategoriesTabProps {
  initialTaskCategories: TaskCategory[];
  domusId: string;
}

export default function TaskCategoriesTab({ initialTaskCategories, domusId }: TaskCategoriesTabProps) {
  const [categories, setCategories] = useState(initialTaskCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TaskCategory | null>(null);
  const supabase = createClientComponentClient();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TaskCategoryFormData>({
    resolver: zodResolver(taskCategorySchema),
  });

  const openModal = (category: TaskCategory | null = null) => {
    setEditingCategory(category);
    if (category) {
      reset({ nome: category.nome, cor: category.cor || '#6B7280' });
    } else {
      reset({ nome: '', cor: '#6B7280' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const onSubmit: SubmitHandler<TaskCategoryFormData> = async (data) => {
    try {
      if (editingCategory) {
        const { data: updatedCategory, error } = await supabase
          .from('tarefa_categorias')
          .update({ nome: data.nome, cor: data.cor })
          .eq('id', editingCategory.id)
          .select()
          .single<TaskCategory>();
        if (error) throw error;
        if (updatedCategory) {
          setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
        }
      } else {
        const { data: newCategory, error } = await supabase
          .from('tarefa_categorias')
          .insert({ domus_id: domusId, nome: data.nome, cor: data.cor })
          .select()
          .single<TaskCategory>();
        if (error) throw error;
        if (newCategory) {
          setCategories(prev => [...prev, newCategory].sort((a, b) => a.nome.localeCompare(b.nome)));
        }
      }
      closeModal();
    } catch (e) {
      console.error(e);
      alert('Não foi possível salvar a categoria de tarefa.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    const { error } = await supabase.from('tarefa_categorias').delete().eq('id', id);
    if (error) {
      alert('Não foi possível excluir a categoria. Verifique se ela não está sendo usada em alguma tarefa.');
    } else {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Categorias de Tarefas</h2>
          <p className="text-gray-500 dark:text-gray-400">Crie e gerencie as categorias para organizar suas tarefas.</p>
        </div>
        <button onClick={() => openModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
          <PlusCircle size={20} /> Nova Categoria
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="space-y-2">
          {categories.length > 0 ? categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <span style={{ backgroundColor: cat.cor }} className="h-4 w-4 rounded-full"></span>
                <span className="font-medium">{cat.nome}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openModal(cat)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit size={16} /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Tag className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-4">Nenhuma categoria de tarefa criada.</p>
              <p className="text-sm">Clique em &apos;Nova Categoria&apos; para começar.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md relative">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold">{editingCategory ? 'Editar' : 'Nova'} Categoria de Tarefa</h3>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <input {...register('nome')} className="w-full input-style" placeholder="Nome da Categoria" />
              {errors.nome && <p className="text-sm text-red-500 mt-1">{errors.nome.message}</p>}
              
              <div className="flex items-center gap-4">
                <label htmlFor="color" className="text-sm font-medium">Cor:</label>
                <input id="color" type="color" {...register('cor')} className="w-16 h-10 p-1 border-gray-300 rounded-md" />
              </div>
              {errors.cor && <p className="text-sm text-red-500 mt-1">{errors.cor.message}</p>}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
