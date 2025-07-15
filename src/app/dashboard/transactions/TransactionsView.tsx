// src/app/dashboard/transactions/TransactionsView.tsx
'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO, subMonths, addMonths, eachDayOfInterval, getDay, getDate, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Transaction = { id: string; description: string; amount: number; date: string; category_id: string; };
type RecurringRule = { id: string; description: string; amount: number; type: 'income' | 'expense'; frequency: 'monthly' | 'weekly' | 'yearly'; day_of_month: number | null; day_of_week: number | null; start_date: string; end_date: string | null; category_id: string; };
type Category = { id: string; name: string; icon: string | null; };
type CombinedTransaction = { id: string; description: string; amount: number; date: string; type: 'income' | 'expense'; category: Category | undefined; isRecurring: boolean; category_id: string; };

interface TransactionsViewProps {
  oneOffExpenses: Transaction[];
  oneOffIncomes: Transaction[];
  recurringRules: RecurringRule[];
  categories: Category[];
  startingBalance: number;
}

const generateRecurringInstances = (rules: RecurringRule[], start: Date, end: Date): CombinedTransaction[] => {
  const instances: CombinedTransaction[] = [];
  rules.forEach(rule => {
    const ruleStart = parseISO(rule.start_date);
    const intervalStart = start > ruleStart ? start : ruleStart;
    const intervalEnd = rule.end_date && parseISO(rule.end_date) < end ? parseISO(rule.end_date) : end;
    if (intervalStart > intervalEnd) return;
    eachDayOfInterval({ start: intervalStart, end: intervalEnd }).forEach(day => {
      let shouldCreate = false;
      if (rule.frequency === 'monthly' && getDate(day) === rule.day_of_month) shouldCreate = true;
      else if (rule.frequency === 'weekly' && (getDay(day) + 1) === rule.day_of_week) shouldCreate = true;
      else if (rule.frequency === 'yearly' && getMonth(day) === getMonth(ruleStart) && getDate(day) === getDate(ruleStart)) shouldCreate = true;
      if (shouldCreate) {
        instances.push({ id: `rec-${rule.id}-${format(day, 'yyyy-MM-dd')}`, description: rule.description, amount: rule.amount, date: format(day, 'yyyy-MM-dd'), type: rule.type, category: undefined, isRecurring: true, category_id: rule.category_id });
      }
    });
  });
  return instances;
};

export default function TransactionsView({ oneOffExpenses, oneOffIncomes, recurringRules, categories, startingBalance }: TransactionsViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { groupedTransactions, dailyBalances, totals } = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const categoriesMap = new Map(categories.map(c => [c.id, c]));
    const recurringInstances = generateRecurringInstances(recurringRules, start, end);
    const combined: CombinedTransaction[] = [
      ...oneOffExpenses.map((t): CombinedTransaction => ({ ...t, type: 'expense', category: categoriesMap.get(t.category_id), isRecurring: false })),
      ...oneOffIncomes.map((t): CombinedTransaction => ({ ...t, type: 'income', category: categoriesMap.get(t.category_id), isRecurring: false })),
      ...recurringInstances.map((t): CombinedTransaction => ({ ...t, category: categoriesMap.get(t.category_id) }))
    ].filter(t => { const tDate = parseISO(t.date); return tDate >= start && tDate <= end; }).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

    const grouped = combined.reduce((acc, t) => {
      const dayKey = format(parseISO(t.date), 'yyyy-MM-dd');
      if (!acc[dayKey]) acc[dayKey] = [];
      acc[dayKey].push(t);
      return acc;
    }, {} as Record<string, CombinedTransaction[]>);

    const dailyBalances: { date: string; Saldo: number; Entradas: number; Saídas: number }[] = [];
    let runningBalance = startingBalance;
    eachDayOfInterval({ start, end }).forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayTransactions = grouped[dayKey] || [];
        const dailyIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const dailyExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        runningBalance += dailyIncome - dailyExpense;
        dailyBalances.push({ date: format(day, 'dd'), Saldo: runningBalance, Entradas: dailyIncome, Saídas: dailyExpense });
    });

    const totals = { incomes: dailyBalances.reduce((sum, d) => sum + d.Entradas, 0), expenses: dailyBalances.reduce((sum, d) => sum + d.Saídas, 0), };
    return { groupedTransactions: grouped, dailyBalances, totals };
  }, [currentMonth, oneOffExpenses, oneOffIncomes, recurringRules, categories, startingBalance]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 flex justify-between items-center">
            <button onClick={() => setCurrentMonth(prev => subMonths(prev, 1))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft size={24} /></button>
            <h2 className="text-xl font-semibold capitalize text-center w-48">{format(currentMonth, 'MMMM \'de\' yyyy', { locale: ptBR })}</h2>
            <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight size={24} /></button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
                {Object.keys(groupedTransactions).length > 0 ? Object.entries(groupedTransactions).map(([day, transactions]) => (
                    <div key={day}>
                        <h3 className="font-semibold text-gray-600 dark:text-gray-400 pb-2 mb-2 border-b dark:border-gray-700">{format(parseISO(day), "dd '•' EEEE", { locale: ptBR })}</h3>
                        <div className="space-y-3">
                            {transactions.map(t => (
                                <div key={t.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{t.category?.icon || '📁'}</span>
                                        <div>
                                            <p className="font-medium">{t.description}</p>
                                            <p className="text-sm text-gray-500">{t.category?.name || 'Sem Categoria'}</p>
                                        </div>
                                    </div>
                                    <p className={`font-semibold ${t.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(t.amount)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : ( <div className="text-center py-10 text-gray-500"><p>Nenhuma transação neste mês.</p></div> )}
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 text-center"><p className="text-sm text-green-500 font-semibold">Entradas</p><p className="text-2xl font-bold">{formatCurrency(totals.incomes)}</p></div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 text-center"><p className="text-sm text-red-500 font-semibold">Saídas</p><p className="text-2xl font-bold">{formatCurrency(totals.expenses)}</p></div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 text-center"><p className="text-sm text-gray-500 font-semibold">Saldo do Mês</p><p className="text-2xl font-bold">{formatCurrency(totals.incomes - totals.expenses)}</p></div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 h-64">
                    <h4 className="font-semibold mb-2">Saldo</h4>
                    <ResponsiveContainer width="100%" height="100%"><AreaChart data={dailyBalances} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><defs><linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="date" /><YAxis width={80} tickFormatter={(value) => formatCurrency(value as number)} /><Tooltip formatter={(value) => [formatCurrency(value as number), "Saldo"]} /><Area type="monotone" dataKey="Saldo" stroke="#8884d8" fill="url(#colorSaldo)" /></AreaChart></ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 h-64">
                    <h4 className="font-semibold mb-2">Entradas</h4>
                     <ResponsiveContainer width="100%" height="100%"><AreaChart data={dailyBalances} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><defs><linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="date" /><YAxis domain={[0, 'dataMax']} width={80} tickFormatter={(value) => formatCurrency(value as number)} /><Tooltip formatter={(value) => [formatCurrency(value as number), "Entradas"]} /><Area type="monotone" dataKey="Entradas" stroke="#22c55e" fill="url(#colorEntradas)" /></AreaChart></ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 h-64">
                    <h4 className="font-semibold mb-2">Saídas</h4>
                     <ResponsiveContainer width="100%" height="100%"><AreaChart data={dailyBalances} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><defs><linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="date" /><YAxis domain={[0, 'dataMax']} width={80} tickFormatter={(value) => formatCurrency(value as number)} /><Tooltip formatter={(value) => [formatCurrency(value as number), "Saídas"]} /><Area type="monotone" dataKey="Saídas" stroke="#ef4444" fill="url(#colorSaidas)" /></AreaChart></ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );
}
