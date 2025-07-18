// src/app/dashboard/transactions/TransactionsView.tsx
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO, eachDayOfInterval, getDay, getDate, getMonth, isToday, isYesterday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Tipos ---
type Transaction = { id: string; description: string; amount: number; date: string; category_id: string; type: 'income' | 'expense'; };
type RecurringRule = { id: string; description: string; amount: number; type: 'income' | 'expense'; frequency: 'monthly' | 'weekly' | 'yearly'; day_of_month: number | null; day_of_week: number | null; start_date: string; end_date: string | null; category_id: string; };
type Category = { id: string; name: string; icon: string | null; color: string | null; };
type CombinedTransaction = Transaction & { category: Category | undefined; isRecurring: boolean; };

interface TransactionsViewProps {
  oneOffExpenses: Transaction[];
  oneOffIncomes: Transaction[];
  recurringRules: RecurringRule[];
  categories: Category[];
  currentMonth: Date;
}

// --- Funções Auxiliares (sem alterações) ---
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

const groupTransactionsByDay = (transactions: CombinedTransaction[]) => {
    return transactions.reduce((acc, transaction) => {
      const day = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(transaction);
      return acc;
    }, {} as Record<string, CombinedTransaction[]>);
};

export default function TransactionsView({ oneOffExpenses, oneOffIncomes, recurringRules, categories, currentMonth }: TransactionsViewProps) {
  const router = useRouter();
  const currentMonthDate = new Date(currentMonth);

  const { groupedTransactions, dailyBalances, totals } = useMemo(() => {
    const categoriesMap = new Map(categories.map(c => [c.id, c]));
    const start = startOfMonth(currentMonthDate);
    const end = endOfMonth(currentMonthDate);
    
    // ... (lógica de cálculo do startingBalance e transações do mês permanece a mesma)
    const pastStart = new Date('2020-01-01');
    const pastEnd = new Date(start.getTime() - 1);
    const pastRecurring = generateRecurringInstances(recurringRules, pastStart, pastEnd);
    const pastIncomesTotal = oneOffIncomes.filter(t => parseISO(t.date) <= pastEnd).reduce((sum, t) => sum + t.amount, 0) + pastRecurring.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const pastExpensesTotal = oneOffExpenses.filter(t => parseISO(t.date) <= pastEnd).reduce((sum, t) => sum + t.amount, 0) + pastRecurring.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const startingBalanceForMonth = pastIncomesTotal - pastExpensesTotal;

    const recurringInstances = generateRecurringInstances(recurringRules, start, end);
    const combined: CombinedTransaction[] = [
      ...oneOffExpenses.map((t): CombinedTransaction => ({ ...t, type: 'expense', category: categoriesMap.get(t.category_id), isRecurring: false })),
      ...oneOffIncomes.map((t): CombinedTransaction => ({ ...t, type: 'income', category: categoriesMap.get(t.category_id), isRecurring: false })),
      ...recurringInstances.map((t): CombinedTransaction => ({ ...t, category: categoriesMap.get(t.category_id) }))
    ].filter(t => { const tDate = parseISO(t.date); return tDate >= start && tDate <= end; }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = startingBalanceForMonth;
    const dailyData = eachDayOfInterval({ start, end }).map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayTransactions = combined.filter(t => t.date === dayStr);
        const dailyIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const dailyExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        runningBalance += dailyIncome - dailyExpense;
        return { date: format(day, 'dd'), Saldo: runningBalance };
    });

    const monthTotals = { incomes: combined.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), expenses: combined.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) };
    
    // Invertendo a ordem para a exibição (do mais recente para o mais antigo)
    const displayTransactions = [...combined].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { groupedTransactions: groupTransactionsByDay(displayTransactions), dailyBalances: dailyData, totals: monthTotals };
  }, [currentMonthDate, oneOffExpenses, oneOffIncomes, recurringRules, categories]);
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleMonthChange = (amount: number) => {
    const newMonth = amount > 0 ? addMonths(currentMonthDate, 1) : subMonths(currentMonthDate, 1);
    router.push(`/dashboard/transactions?month=${format(newMonth, 'yyyy-MM-dd')}`);
  };

  const formatDateHeading = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
  }

  return (
    <div className="space-y-8">
      {/* 1. NAVEGAÇÃO DE MÊS */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Seus Lançamentos</h1>
        <div className="p-1 bg-white border border-gray-200 rounded-lg flex items-center">
            <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-md hover:bg-gray-100"> <ChevronLeft size={20} /> </button>
            <span className="font-semibold text-gray-700 w-36 text-center capitalize">
              {format(currentMonthDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <button onClick={() => handleMonthChange(1)} className="p-2 rounded-md hover:bg-gray-100"> <ChevronRight size={20} /> </button>
        </div>
      </div>

      {/* 2. RESUMO CONVERSACIONAL */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <p className="text-base text-gray-600">
          Neste mês, você teve 
          <span className="font-bold text-green-600"> {formatCurrency(totals.incomes)}</span> em receitas e 
          <span className="font-bold text-red-600"> {formatCurrency(totals.expenses)}</span> em despesas.
        </p>
        <div className="mt-4 bg-gray-50 h-64 rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyBalances} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs><linearGradient id="saldoColor" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis width={80} tickFormatter={(value) => formatCurrency(value as number)} domain={['auto', 'auto']} />
              <Tooltip formatter={(value) => [formatCurrency(value as number), "Saldo"]} />
              <Area type="monotone" dataKey="Saldo" stroke="#8884d8" fill="url(#saldoColor)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 3. FEED DE TRANSAÇÕES */}
      <div className="space-y-6">
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.keys(groupedTransactions).map(day => (
            <div key={day}>
              <h3 className="font-semibold text-gray-500 mb-3">{formatDateHeading(day)}</h3>
              <div className="space-y-2">
                {groupedTransactions[day].map(t => {
                  const isExpense = t.type === 'expense';
                  const categoryColor = t.category?.color || '#71717a';
                  return (
                    <div key={t.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between transition hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl`} style={{backgroundColor: categoryColor + '20', color: categoryColor}}>
                            {t.category?.icon || (isExpense ? '💸' : '💰')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{t.description}</p>
                          <p className="text-sm text-gray-500">{t.category?.name || 'Sem Categoria'}</p>
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
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Nenhuma transação para exibir neste mês.</p>
          </div>
        )}
      </div>
    </div>
  )
}