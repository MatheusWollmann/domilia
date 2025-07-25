// src/app/dashboard/DashboardView.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'
import TransactionModal, { type Transaction } from '@/components/TransactionModal'
import { type User } from '@supabase/supabase-js'
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos recebidos como props
export type Category = { id: string; name: string; type: 'expense' | 'income'; icon?: string | null; color?: string | null; budget?: number | null; };
export type TransactionWithCategory = Transaction & { categories: { name: string; icon: string | null; color: string | null } | null }
export type BudgetData = { id: string; name: string; icon: string | null; spent: number; budget: number; progress: number; }

interface DashboardViewProps {
  user: User;
  balance: number;
  totalIncomes: number;
  totalExpenses: number;
  recentTransactions: TransactionWithCategory[];
  chartData: { name: string; value: number; color: string }[];
  expenseCategories: Category[];
  incomeCategories: Category[];
  budgetsData: BudgetData[];
}

// Função para agrupar transações por dia
const groupTransactionsByDay = (transactions: TransactionWithCategory[]) => {
  return transactions.reduce((acc, transaction) => {
    const day = format(new Date(transaction.date), 'yyyy-MM-dd');
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(transaction);
    return acc;
  }, {} as Record<string, TransactionWithCategory[]>);
};

export default function DashboardView({ user, balance, totalIncomes, totalExpenses, recentTransactions, expenseCategories, incomeCategories, budgetsData }: DashboardViewProps) {
  const router = useRouter();
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleOpenModal = (transaction?: Transaction) => {
    setTransactionToEdit(transaction || null);
    setShowTransactionModal(true);
  }
  
  const groupedTransactions = groupTransactionsByDay(recentTransactions);

  const formatDateHeading = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  }

  return (
    <div className="space-y-10">
      {/* Cabeçalho Amigável */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Olá, {user.user_metadata.full_name || user.email?.split('@')[0]}!</h1>
        <p className="text-lg text-gray-500">Aqui está o resumo financeiro deste mês.</p>
      </div>

      {/* Resumo Financeiro - Menos "cards", mais "widgets" */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
              <p className="text-base font-medium text-gray-500">Saldo Atual</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">{formatCurrency(balance)}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <p className="text-base font-medium text-green-800">Receitas</p>
              <p className="text-3xl font-bold text-green-700 mt-2">{formatCurrency(totalIncomes)}</p>
          </div>
          <div className="bg-red-50 p-6 rounded-xl border border-red-200">
              <p className="text-base font-medium text-red-800">Despesas</p>
              <p className="text-3xl font-bold text-red-700 mt-2">{formatCurrency(totalExpenses)}</p>
          </div>
      </div>

      {/* Layout Principal - Feed de Transações e Orçamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Últimos Lançamentos</h2>
            <button onClick={() => handleOpenModal()} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm">
              <PlusCircle size={20} /> Adicionar
            </button>
          </div>

          {/* Feed de Transações Conversacional */}
          <div className="space-y-6">
            {Object.keys(groupedTransactions).map(day => (
              <div key={day}>
                <h3 className="font-semibold text-gray-500 mb-3">{formatDateHeading(day)}</h3>
                <div className="space-y-2">
                  {groupedTransactions[day].map(t => {
                    const isExpense = t.type === 'expense';
                    // CORREÇÃO APLICADA AQUI
                    const categoryColor = t.categories?.color || '#71717a'; // Cinza como cor padrão
                    return (
                      <div key={t.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between transition hover:shadow-md">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl`} style={{backgroundColor: categoryColor + '20', color: categoryColor}}>
                              {t.categories?.icon || (isExpense ? '💸' : '💰')}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{t.description}</p>
                            <p className="text-sm text-gray-500">{t.categories?.name || 'Sem Categoria'}</p>
                          </div>
                        </div>
                        <p className={`font-bold text-lg ${isExpense ? 'text-gray-700' : 'text-green-600'}`}>
                          {isExpense ? '-' : '+'} {formatCurrency(t.amount)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna Lateral com Orçamentos */}
        <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Orçamentos</h2>
              <div className="space-y-5">
                {budgetsData.length > 0 ? budgetsData.map(budget => (
                  <div key={budget.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium flex items-center gap-2 text-gray-700">{budget.icon} {budget.name}</span>
                      <span className="text-sm text-gray-500">{Math.round(budget.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${budget.progress}%` }}></div>
                    </div>
                  </div>
                )) : <p className="text-center text-gray-500 text-sm py-4">Nenhum orçamento definido.</p>}
              </div>
            </div>
        </div>
      </div>
      
      <TransactionModal isOpen={showTransactionModal} onClose={() => setShowTransactionModal(false)} onSuccess={() => router.refresh()} user={user} expenseCategories={expenseCategories} incomeCategories={incomeCategories} transactionToEdit={transactionToEdit} />
    </div>
  )
}