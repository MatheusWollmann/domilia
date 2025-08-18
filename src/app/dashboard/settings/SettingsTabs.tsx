// src/app/dashboard/settings/SettingsTabs.tsx
'use client';

import { useState } from 'react';
import { Tag, Repeat, Users, ListTodo } from 'lucide-react'; // Adicionado ListTodo
import CategoriesTab from './CategoriesTab';
import RecurringTab from './RecurringTab';
import MembersTab from './MembersTab';
import TaskCategoriesTab from './TaskCategoriesTab'; // Importar o novo componente
import { type Category, type RecurringTransaction, type DomusMember, type DomusInvitation, type TaskCategory } from './types'; // Adicionado TaskCategory

interface SettingsTabsProps {
  initialCategories: Category[];
  initialTaskCategories: TaskCategory[]; // Adicionado
  initialRecurring: RecurringTransaction[];
  initialMembers: DomusMember[];
  initialInvitations: DomusInvitation[];
  domusId: string;
  isOwner: boolean;
}

export default function SettingsTabs({ 
  initialCategories, 
  initialTaskCategories, // Adicionado
  initialRecurring, 
  initialMembers, 
  initialInvitations, 
  domusId,
  isOwner
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState('categories');

  const expenseCategories = initialCategories.filter(c => c.type === 'expense');
  const incomeCategories = initialCategories.filter(c => c.type === 'income');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Ajustes e Personalização</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">Gerencie suas categorias, contas recorrentes e membros da casa.</p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('categories')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Tag size={18} />
            Categorias (Finanças)
          </button>
          <button
            onClick={() => setActiveTab('task-categories')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'task-categories'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <ListTodo size={18} />
            Categorias (Tarefas)
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'recurring'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Repeat size={18} />
            Contas Recorrentes
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'members'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Users size={18} />
            Membros da Casa
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'categories' && <CategoriesTab initialCategories={initialCategories} domusId={domusId} />}
        {activeTab === 'task-categories' && <TaskCategoriesTab initialTaskCategories={initialTaskCategories} domusId={domusId} />}
        {activeTab === 'recurring' && <RecurringTab initialRecurring={initialRecurring} expenseCategories={expenseCategories} incomeCategories={incomeCategories} domusId={domusId} />}
        {activeTab === 'members' && <MembersTab initialMembers={initialMembers} initialInvitations={initialInvitations} domusId={domusId} isOwner={isOwner} />}
      </div>
    </div>
  );
}