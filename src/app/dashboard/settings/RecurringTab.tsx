// src/app/dashboard/settings/RecurringTab.tsx
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Edit, Trash2, Loader2, X, Repeat } from 'lucide-react';
import { type Category, type RecurringTransaction } from './types';

const recurringSchema = z.object({
    description: z.string().min(2, "A descrição é obrigatória."),
    amount: z.string().refine(v => !isNaN(parseFloat(v.replace(',', '.'))), "Valor inválido."),
    type: z.enum(['expense', 'income']),
    category_id: z.string().uuid("Selecione uma categoria."),
    frequency: z.enum(['weekly', 'monthly', 'yearly']),
    day_of_month: z.number().min(1).max(31).optional().nullable(),
    day_of_week: z.number().min(1).max(7).optional().nullable(),
    start_date: z.string().min(1, "A data de início é obrigatória."),
}).refine(data => {
    if (data.frequency === 'monthly' && !data.day_of_month) return false;
    if (data.frequency === 'weekly' && !data.day_of_week) return false;
    return true;
}, { message: "Especifique o dia para a frequência selecionada.", path: ["day_of_month"] });

type RecurringFormData = z.infer<typeof recurringSchema>;

interface RecurringTabProps {
  initialRecurring: RecurringTransaction[];
  expenseCategories: Category[];
  incomeCategories: Category[];
}

export default function RecurringTab({ initialRecurring, expenseCategories, incomeCategories }: RecurringTabProps) {
  const [recurring, setRecurring] = useState(initialRecurring);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const supabase = createClientComponentClient();

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema)
  });

  const watchedType = watch('type', 'expense');
  const watchedFrequency = watch('frequency', 'monthly');
  const currentCategories = watchedType === 'expense' ? expenseCategories : incomeCategories;

  const openModal = (item: RecurringTransaction | null = null) => {
    setEditing(item);
    if (item) {
        reset({ description: item.description, amount: String(item.amount).replace('.', ','), type: item.type, category_id: item.category_id, frequency: item.frequency, day_of_month: item.day_of_month, day_of_week: item.day_of_week, start_date: item.start_date, });
    } else {
        reset({ description: '', amount: '', type: 'expense', category_id: '', frequency: 'monthly', day_of_month: 1, day_of_week: undefined, start_date: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const onSubmit: SubmitHandler<RecurringFormData> = async (data) => {
    try {
        const amountAsNumber = parseFloat(data.amount.replace(',', '.'));
        const dataToSave = { ...data, amount: amountAsNumber, day_of_month: data.frequency === 'monthly' ? data.day_of_month : null, day_of_week: data.frequency === 'weekly' ? data.day_of_week : null, };

        if (editing) {
            const { data: updated, error } = await supabase.from('recurring_transactions').update(dataToSave).eq('id', editing.id).select('*, categories(name, icon)').single();
            if (error) throw error;
            setRecurring(prev => prev.map(r => r.id === updated.id ? updated : r));
        } else {
            const { data: created, error } = await supabase.from('recurring_transactions').insert(dataToSave).select('*, categories(name, icon)').single();
            if (error) throw error;
            setRecurring(prev => [...prev, created].sort((a,b) => a.description.localeCompare(b.description)));
        }
        closeModal();
    } catch (e) {
        console.error(e);
        alert("Não foi possível salvar a conta recorrente.");
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza?')) return;
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
    if (error) {
      alert('Não foi possível excluir a conta.');
    } else {
      setRecurring(prev => prev.filter(r => r.id !== id));
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => openModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
          <PlusCircle size={20} /> Nova Conta Recorrente
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Suas Contas Recorrentes</h2>
        <div className="space-y-2">
            {recurring.length > 0 ? recurring.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center gap-3">
                        <span className={`text-xl ${item.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>{item.categories?.icon || '🔁'}</span>
                        <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-gray-500">{item.categories?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`font-semibold ${item.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(item.amount)}</span>
                        <button onClick={() => openModal(item)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                </div>
            )) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Repeat className="mx-auto h-12 w-12 opacity-50" />
                    <p className="mt-4">Nenhuma conta recorrente cadastrada.</p>
                </div>
            )}
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md relative">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold">{editing ? 'Editar' : 'Nova'} Conta Recorrente</h3>
                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <input {...register('description')} placeholder="Descrição (Ex: Aluguel, Salário)" className="w-full input-style" />
                    {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    <input {...register('amount')} placeholder="Valor (Ex: 1500,00)" inputMode="decimal" className="w-full input-style" />
                    {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                    <select {...register('type')} className="w-full input-style"><option value="expense">Despesa</option><option value="income">Receita</option></select>
                    <select {...register('category_id')} className="w-full input-style">
                        <option value="">Selecione uma categoria</option>
                        {currentCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.category_id && <p className="text-sm text-red-500">{errors.category_id.message}</p>}
                    <select {...register('frequency')} className="w-full input-style">
                        <option value="monthly">Mensal</option><option value="weekly">Semanal</option><option value="yearly">Anual</option>
                    </select>
                    {watchedFrequency === 'monthly' && <input type="number" {...register('day_of_month', {valueAsNumber: true})} placeholder="Dia do Mês (1-31)" className="w-full input-style"/>}
                    {watchedFrequency === 'weekly' && <input type="number" {...register('day_of_week', {valueAsNumber: true})} placeholder="Dia da Semana (1=Dom, 7=Sáb)" className="w-full input-style"/>}
                    <input type="date" {...register('start_date')} className="w-full input-style"/>
                    {errors.day_of_month && <p className="text-sm text-red-500">{errors.day_of_month.message}</p>}
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
