// src/components/TransactionModal.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type User } from '@supabase/supabase-js';
import { X, Loader2, Repeat } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export type Category = { id: string; name: string; type: 'expense' | 'income'; icon?: string | null; };
export type Transaction = { id: string; description: string; amount: number; category_id: string; date: string; type: 'expense' | 'income'; };

const transactionSchema = z.object({
  description: z.string().min(2, 'A descrição é obrigatória.'),
  amount: z.string().refine(v => !isNaN(parseFloat(v.replace(',', '.'))), "Valor inválido."),
  type: z.enum(['expense', 'income']),
  category_id: z.string().uuid("Selecione uma categoria."),
  date: z.string().min(1, "A data é obrigatória."),
  is_recurring: z.boolean(),
  frequency: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  day_of_month: z.number().min(1).max(31).optional().nullable(),
  day_of_week: z.number().min(1).max(7).optional().nullable(),
}).refine(data => {
    if (data.is_recurring && !data.frequency) return false;
    if (data.is_recurring && data.frequency === 'monthly' && !data.day_of_month) return false;
    if (data.is_recurring && data.frequency === 'weekly' && !data.day_of_week) return false;
    return true;
}, { message: "Especifique os detalhes da recorrência.", path: ["frequency"] });

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
  expenseCategories: Category[];
  incomeCategories: Category[];
  transactionToEdit?: Transaction | null;
}

export default function TransactionModal({ isOpen, onClose, onSuccess, user, expenseCategories, incomeCategories, transactionToEdit, }: TransactionModalProps) {
  const supabase = createClientComponentClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isEditMode = transactionToEdit != null;

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { is_recurring: false, type: 'expense' }
  });
  
  const isRecurring = watch('is_recurring');
  const frequency = watch('frequency');
  const type = watch('type');
  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && transactionToEdit) {
        reset({ description: transactionToEdit.description, amount: String(transactionToEdit.amount).replace('.',','), type: transactionToEdit.type, category_id: transactionToEdit.category_id, date: format(parseISO(transactionToEdit.date), 'yyyy-MM-dd'), is_recurring: false, });
      } else {
        reset({ description: '', amount: '', type: 'expense', category_id: '', date: new Date().toISOString().split('T')[0], is_recurring: false, frequency: undefined, day_of_month: undefined, day_of_week: undefined });
      }
      setErrorMessage(null);
    }
  }, [isOpen, reset, isEditMode, transactionToEdit]);

  const onSubmit: SubmitHandler<TransactionFormData> = async (data) => {
    setErrorMessage(null);
    try {
      if (!user) throw new Error('Usuário não autenticado.');
      const amountAsNumber = parseFloat(data.amount.replace(',', '.'));
      
      if (isEditMode && transactionToEdit) {
        const tableName = data.type === 'expense' ? 'expenses' : 'incomes';
        const { error } = await supabase.from(tableName).update({ description: data.description, amount: amountAsNumber, category_id: data.category_id, date: data.date, }).eq('id', transactionToEdit.id);
        if (error) throw error;
      } else if (data.is_recurring) {
        const { error } = await supabase.from('recurring_transactions').insert({ user_id: user.id, description: data.description, amount: amountAsNumber, type: data.type, category_id: data.category_id, frequency: data.frequency, day_of_month: data.frequency === 'monthly' ? data.day_of_month : null, day_of_week: data.frequency === 'weekly' ? data.day_of_week : null, start_date: data.date, });
        if (error) throw error;
      } else {
        const tableName = data.type === 'expense' ? 'expenses' : 'incomes';
        const { error } = await supabase.from(tableName).insert({ user_id: user.id, description: data.description, amount: amountAsNumber, category_id: data.category_id, date: data.date, });
        if (error) throw error;
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(`Erro ao salvar transação:`, err);
      setErrorMessage(err.message || 'Ocorreu um erro inesperado.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">{isEditMode ? 'Editar Transação' : 'Nova Transação'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            <label htmlFor="is_recurring" className={`font-medium flex items-center gap-2 ${isEditMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                <Repeat size={18} /> Tornar Recorrente?
            </label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" id="is_recurring" {...register('is_recurring')} disabled={isEditMode} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer disabled:cursor-not-allowed"/>
                <label htmlFor="is_recurring" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></label>
            </div>
          </div>
          <select {...register('type')} disabled={isEditMode} className="w-full input-style disabled:opacity-70"><option value="expense">Despesa</option><option value="income">Receita</option></select>
          <input {...register('description')} className="w-full input-style" placeholder="Descrição"/>
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          <input {...register('amount')} className="w-full input-style" placeholder="Valor (R$)"/>
          {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
          <select {...register('category_id')} className="w-full input-style">
            <option value="">Selecione uma categoria</option>
            {currentCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          {errors.category_id && <p className="text-sm text-red-500">{errors.category_id.message}</p>}
          <input type="date" {...register('date')} className="w-full input-style" />
          {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
          
          {isRecurring && (
            <div className="p-4 border-t dark:border-gray-700 space-y-4">
                <h3 className="font-medium">Detalhes da Recorrência</h3>
                <select {...register('frequency')} className="w-full input-style"><option value="monthly">Mensal</option><option value="weekly">Semanal</option><option value="yearly">Anual</option></select>
                {frequency === 'monthly' && <input type="number" {...register('day_of_month', {valueAsNumber: true})} placeholder="Dia do Mês (1-31)" className="w-full input-style"/>}
                {frequency === 'weekly' && <input type="number" {...register('day_of_week', {valueAsNumber: true})} placeholder="Dia da Semana (1=Dom)" className="w-full input-style"/>}
                {errors.frequency && <p className="text-sm text-red-500">{errors.frequency.message}</p>}
            </div>
          )}
          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50">{isSubmitting && <Loader2 className="animate-spin" />} Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
