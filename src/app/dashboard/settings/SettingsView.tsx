// src/app/dashboard/settings/SettingsView.tsx
'use client';

import { useState } from 'react';
import CategoriesTab from './CategoriesTab';
import RecurringTab from './RecurringTab';

// Tipos que serão usados pelos componentes filhos
export type Category = {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon?: string | null;
  color?: string | null;
  budget?: number | null;
};

export type RecurringTransaction = {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  frequency: 'weekly' | 'monthly' | 'yearly';
  day_of_month?: number | null;
  day_of_week?: number | null;
  category_id: string;
  start_date: string;
  categories: { // Propriedade aninhada
    name: string | null;
    icon: string | null;
  } | null;
};

interface SettingsViewProps {
  initialCategories: Category[];
  initialRecurringTransactions: RecurringTransaction[];
}

export default function SettingsView({ initialCategories, initialRecurringTransactions }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'recurring'>('categories');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
      </div>

      {/* Abas de Navegação */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('categories')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categorias e Orçamentos
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recurring'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contas Recorrentes
          </button>
        </nav>
      </div>

      {/* Conteúdo da Aba */}
      <div>
        {activeTab === 'categories' && (
          <CategoriesTab initialCategories={initialCategories} />
        )}
        {activeTab === 'recurring' && (
          <RecurringTab 
            initialRecurring={initialRecurringTransactions}
            // Passa as categorias para o modal de contas recorrentes
            expenseCategories={initialCategories.filter(c => c.type === 'expense')}
            incomeCategories={initialCategories.filter(c => c.type === 'income')}
          />
        )}
      </div>
    </div>
  );
}
