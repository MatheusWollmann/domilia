// src/app/dashboard/settings/SettingsView.tsx

'use client';

import { type User } from '@supabase/supabase-js';
import { useState } from 'react';
import { User as UserIcon, Tag, Repeat, Edit, Trash2, PlusCircle } from 'lucide-react';

// Tipos para os dados recebidos
type Category = { id: string; name: string; icon: string | null; color: string | null; type: 'income' | 'expense', budget: number | null };
type RecurringTransaction = { id: string; description: string; amount: number; type: 'income' | 'expense'; categories: { name: string | null; color: string | null } | null };

interface SettingsViewProps {
  user: User;
  initialCategories: Category[];
  initialRecurringTransactions: RecurringTransaction[];
}

export default function SettingsView({ user, initialCategories, initialRecurringTransactions }: SettingsViewProps) {
  const [categories] = useState(initialCategories);
  const [recurring] = useState(initialRecurringTransactions);
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Ajustes e Personalização</h1>
        <p className="text-lg text-gray-500">Gerencie suas informações e personalize o Domilia.</p>
      </div>

      {/* Seção de Perfil */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
            <UserIcon className="text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Seu Perfil</h2>
        </div>
        <div className="space-y-3">
            <p><span className="font-semibold">Nome:</span> {user.user_metadata.full_name || 'Não informado'}</p>
            <p><span className="font-semibold">Email:</span> {user.email}</p>
            {/* Futuramente, botões para alterar nome/senha podem ser adicionados aqui */}
        </div>
      </div>

      {/* Seção de Categorias */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
                <Tag className="text-purple-600" />
                <h2 className="text-xl font-bold text-gray-800">Categorias</h2>
            </div>
            <button className="bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm shadow-sm">
                <PlusCircle size={18} /> Nova Categoria
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map(cat => (
                <div key={cat.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200">
                    <div className="flex items-center gap-3">
                        <span className="text-xl" style={{color: cat.color || '#000'}}>{cat.icon || '📁'}</span>
                        <span className="font-medium text-gray-700">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-blue-600"><Edit size={16}/></button>
                        <button className="text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      {/* Seção de Contas Recorrentes */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
         <div className="flex items-center gap-3 mb-4">
            <Repeat className="text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Contas Recorrentes</h2>
        </div>
        <div className="space-y-3">
            {recurring.map(rec => (
                <div key={rec.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200">
                    <div>
                        <p className="font-medium text-gray-800">{rec.description}</p>
                        <p className="text-sm text-gray-500" style={{color: rec.categories?.color || '#000'}}>{rec.categories?.name || 'Sem Categoria'}</p>
                    </div>
                    <p className={`font-semibold ${rec.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(rec.amount)}</p>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}