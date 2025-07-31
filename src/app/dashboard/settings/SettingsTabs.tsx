// src/app/dashboard/settings/SettingsTabs.tsx
'use client';

import { useState } from 'react';
import { Tag, Repeat, Users } from 'lucide-react';
import CategoriesTab from './CategoriesTab';
import RecurringTab from './RecurringTab';
import MembersTab from './MembersTab';
import { type Category, type RecurringTransaction, type DomusMember, type DomusInvitation } from './types';

interface SettingsTabsProps {
  initialCategories: Category[];
  initialRecurring: RecurringTransaction[];
  initialMembers: DomusMember[];
  initialInvitations: DomusInvitation[];
  domusId: string;
  isOwner: boolean;
}

export default function SettingsTabs({ 
  initialCategories, 
  initialRecurring, 
  initialMembers, 
  initialInvitations, 
  domusId,
  isOwner
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'recurring' | 'members'>('categories');

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
            Categorias
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
        {activeTab === 'recurring' && <RecurringTab initialRecurring={initialRecurring} expenseCategories={expenseCategories} incomeCategories={incomeCategories} domusId={domusId} />}
        {activeTab === 'members' && <MembersTab initialMembers={initialMembers} initialInvitations={initialInvitations} domusId={domusId} isOwner={isOwner} />}
      </div>
    </div>
  );
}