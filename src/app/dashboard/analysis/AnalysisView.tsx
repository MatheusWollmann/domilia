// src/app/dashboard/analysis/AnalysisView.tsx

'use client';
import { useRouter } from 'next/navigation';
import { Sankey, ResponsiveContainer, Tooltip } from 'recharts';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

// --- Tipos ---
interface AnalysisViewProps {
  data: {
    nodes: { name: string; color: string }[];
    links: { source: number; target: number; value: number }[];
  };
  currentMonth: Date;
  totalIncome: number;
  totalExpense: number;
  biggestExpense: { name: string; amount: number };
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function AnalysisView({ data, currentMonth, totalIncome, totalExpense, biggestExpense }: AnalysisViewProps) {
  const router = useRouter();
  const currentMonthDate = new Date(currentMonth);

  const handleMonthChange = (amount: number) => {
    const newMonth = amount > 0 ? addMonths(currentMonthDate, 1) : subMonths(currentMonthDate, 1);
    const newPath = `/dashboard/analysis?month=${format(newMonth, 'yyyy-MM-dd')}`;
    router.push(newPath);
  };
  
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Cabeçalho e Navegação de Mês */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Análise de Fluxo</h1>
            <p className="text-lg text-gray-500">
                Veja o caminho do seu dinheiro em {format(currentMonthDate, "MMMM 'de' yyyy", { locale: ptBR })}.
            </p>
        </div>
        <div className="p-1 bg-white border border-gray-200 rounded-lg flex items-center">
            <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-md hover:bg-gray-100"> <ChevronLeft size={20} /> </button>
            <span className="font-semibold text-gray-700 w-36 text-center capitalize">
              {format(currentMonthDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <button onClick={() => handleMonthChange(1)} className="p-2 rounded-md hover:bg-gray-100"> <ChevronRight size={20} /> </button>
        </div>
      </div>

      {/* Widgets de Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <PiggyBank className="text-green-600" size={24}/>
                <p className="text-base font-medium text-green-800">Você economizou</p>
              </div>
              <p className="text-3xl font-bold text-green-700 mt-2">{formatCurrency(savings)}</p>
              {savingsRate > 0 && <p className="text-sm text-green-600">{savingsRate.toFixed(0)}% da sua renda</p>}
          </div>
          <div className="bg-red-50 p-6 rounded-xl border border-red-200">
              <div className="flex items-center gap-3">
                  <TrendingDown className="text-red-600" size={24}/>
                  <p className="text-base font-medium text-red-800">Maior Despesa</p>
              </div>
              <p className="text-3xl font-bold text-red-700 mt-2">{formatCurrency(biggestExpense.amount)}</p>
              <p className="text-sm text-red-600">{biggestExpense.name}</p>
          </div>
      </div>

      {/* Gráfico */}
      <div className="w-full h-[600px] bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Detalhes do Fluxo</h2>
        {data.nodes.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
                <Sankey
                    data={data}
                    nodePadding={30}
                    margin={{ left: 150, right: 150, top: 5, bottom: 5 }}
                    link={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
                    node={({ x = 0, y = 0, width = 0, height = 0, index, payload }: any) => {
                      const nodePayload = payload;
                      return (
                        <g key={`sankey-node-${index}`}> 
                          <rect x={x} y={y} width={width} height={height} fill={nodePayload.color || '#8884d8'} fillOpacity="1" />
                          <text x={x < 200 ? x - 6 : x + width + 6} y={y + height / 2} textAnchor={x < 200 ? 'end' : 'start'} dominantBaseline="middle" className="fill-current text-gray-700 font-medium">
                            {nodePayload.name}
                          </text>
                        </g>
                      );
                    }}
                >
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </Sankey>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>Não há dados suficientes para exibir a análise para este mês.</p>
            </div>
        )}
      </div>
    </div>
  );
}