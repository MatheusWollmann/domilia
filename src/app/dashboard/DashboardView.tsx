// src/app/dashboard/DashboardView.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, PlusCircle, Receipt, Edit } from 'lucide-react'
import TransactionModal, { type Transaction } from '@/components/TransactionModal'
import { type User } from '@supabase/supabase-js'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

export type Category = { id: string; name: string; type: 'expense' | 'income'; icon?: string | null; color?: string | null; budget?: number | null; };
export type TransactionWithCategory = Transaction & { categories: { name: string; icon: string | null; } | null }
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

export default function DashboardView({ user, balance, totalIncomes, totalExpenses, recentTransactions, chartData, expenseCategories, incomeCategories, budgetsData }: DashboardViewProps) {
  const router = useRouter();
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
  const handleOpenModal = (transaction?: Transaction) => {
    setTransactionToEdit(transaction || null);
    setShowTransactionModal(true);
  }

  const handleCloseModal = () => {
    setShowTransactionModal(false);
    setTransactionToEdit(null);
  }

  const getBudgetBarColor = (progress: number) => {
    if (progress > 90) return 'bg-red-500';
    if (progress > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
          <PlusCircle size={20} /> Nova Transação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Disponível</p>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(balance)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Receitas no Mês</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncomes)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Despesas no Mês</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      {budgetsData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acompanhamento de Orçamentos</h2>
              <div className="space-y-4">
                  {budgetsData.map(budget => (
                      <div key={budget.id}>
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium flex items-center gap-2">{budget.icon} {budget.name}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(budget.spent)} / <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(budget.budget)}</span></span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div className={`h-2.5 rounded-full ${getBudgetBarColor(budget.progress)}`} style={{ width: `${budget.progress}%` }}></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <h2 className="p-6 text-lg font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700">Transações Recentes</h2>
          <div className="p-4">
            {recentTransactions.length > 0 ? (
              <div className="space-y-2">
                {recentTransactions.map((transaction) => {
                  const isExpense = transaction.type === 'expense';
                  return (
                    <div key={transaction.id} className="flex items-center justify-between py-3 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isExpense ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'}`}>
                          {isExpense ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.categories?.icon} {transaction.categories?.name || 'Sem Categoria'} • {new Date(transaction.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`font-semibold ${isExpense ? 'text-red-600' : 'text-green-600'}`}> {isExpense ? '-' : '+'} {formatCurrency(transaction.amount)} </p>
                        <button onClick={() => handleOpenModal(transaction)} className="p-2 text-gray-400 hover:text-indigo-600 rounded-md transition-colors"><Edit size={16}/></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhuma transação este mês</h3>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Despesas por Categoria</h2>
          <div className="flex-grow flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                    {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value as number), "Total"]} />
                  <Legend iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            ) : ( <p className="text-gray-500 dark:text-gray-400 text-center">Sem dados de despesas para exibir o gráfico.</p> )}
          </div>
        </div>
      </div>
      
      <TransactionModal isOpen={showTransactionModal} onClose={handleCloseModal} onSuccess={() => { router.refresh(); handleCloseModal(); }} user={user} expenseCategories={expenseCategories} incomeCategories={incomeCategories} transactionToEdit={transactionToEdit} />
    </div>
  )
}
