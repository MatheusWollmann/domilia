// src/app/dashboard/settings/CategoriesTab.tsx
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Edit, Trash2, Loader2, X, FolderKanban } from 'lucide-react';
import { type Category } from './SettingsView'; // Importa o tipo

// Schema de validação
const categorySchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  type: z.enum(['expense', 'income']),
  icon: z.string().optional(),
  color: z.string().optional(),
  budget: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const num = Number(val.replace(',', '.'));
      return !isNaN(num) && num >= 0;
    }, { message: 'O orçamento deve ser um número positivo.' }),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoriesTabProps {
  initialCategories: Category[];
}

export default function CategoriesTab({ initialCategories }: CategoriesTabProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const supabase = createClientComponentClient();

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', type: 'expense', icon: '', color: '#6B7280', budget: '' }
  });

  const watchedType = watch('type');

  const openModal = (category: Category | null = null) => {
    setEditingCategory(category);
    if (category) {
      reset({
        name: category.name,
        type: category.type,
        icon: category.icon || '',
        color: category.color || '#6B7280',
        budget: category.budget != null ? String(category.budget).replace('.', ',') : '',
      });
    } else {
      reset({ name: '', type: 'expense', icon: '', color: '#6B7280', budget: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    try {
      const budgetAsNumber = data.budget && data.budget.trim() !== '' ? Number(data.budget.replace(',', '.')) : null;
      const dataToSave = {
        name: data.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
        budget: data.type === 'expense' ? budgetAsNumber : null,
      };

      if (editingCategory) {
        const { data: updatedCategory, error } = await supabase.from('categories').update(dataToSave).eq('id', editingCategory.id).select().single();
        if (error) throw error;
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
      } else {
        const { data: newCategory, error } = await supabase.from('categories').insert(dataToSave).select().single();
        if (error) throw error;
        setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      }
      closeModal();
    } catch (error) {
      alert('Não foi possível salvar a categoria.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert('Não foi possível excluir a categoria.');
    } else {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  return (
    <div>
        <div className="flex justify-end mb-4">
            <button onClick={() => openModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
                <PlusCircle size={20} />
                Nova Categoria
            </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Categorias de Despesa</h2>
          <div className="space-y-2">
            {expenseCategories.length > 0 ? expenseCategories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex flex-col">
                    <span className="flex items-center gap-3 font-medium">
                        <span className="text-xl">{cat.icon || '📁'}</span>
                        {cat.name}
                    </span>
                    {cat.budget != null && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-9">
                            Orçamento: {formatCurrency(cat.budget)}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(cat)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FolderKanban className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-4">Nenhuma categoria de despesa criada.</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Categorias de Receita</h2>
          <div className="space-y-2">
            {incomeCategories.length > 0 ? incomeCategories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <span className="flex items-center gap-3 font-medium">
                  <span className="text-xl">{cat.icon || '📁'}</span>
                  {cat.name}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(cat)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FolderKanban className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-4">Nenhuma categoria de receita criada.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md relative">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold">{editingCategory ? 'Editar' : 'Nova'} Categoria</h3>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <select {...register('type')} className="w-full input-style"><option value="expense">Despesa</option><option value="income">Receita</option></select>
              <input {...register('name')} className="w-full input-style" placeholder="Nome da Categoria"/>
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
              {watchedType === 'expense' && (
                <div>
                    <div className="relative"><span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">R$</span><input type="text" inputMode="decimal" {...register('budget')} className="w-full input-style pl-10" placeholder="Orçamento (Ex: 500,00)" /></div>
                    {errors.budget && <p className="text-sm text-red-500 mt-1">{errors.budget.message}</p>}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <input {...register('icon')} className="w-full input-style" placeholder="Ícone (Emoji)" />
                <input type="color" {...register('color')} className="w-full h-10 p-1 border-gray-300 rounded-md" defaultValue="#6B7280" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50">{isSubmitting && <Loader2 className="animate-spin" />} Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
