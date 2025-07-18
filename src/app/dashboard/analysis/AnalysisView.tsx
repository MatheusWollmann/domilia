// src/app/dashboard/analysis/AnalysisView.tsx

'use client';
import { useRouter } from 'next/navigation';
import { Sankey, ResponsiveContainer, Tooltip } from 'recharts';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// --- Tipos ---
type CustomSankeyNodePayload = {
  name: string;
  color: string;
};
type SankeyData = {
  nodes: CustomSankeyNodePayload[];
  links: { source: number; target: number; value: number }[];
};
interface AnalysisViewProps {
  data: SankeyData;
  currentMonth: Date;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);


export default function AnalysisView({ data, currentMonth }: AnalysisViewProps) {
  const router = useRouter();
  const currentMonthDate = new Date(currentMonth);

  const handleMonthChange = (amount: number) => {
    const newMonth = amount > 0 ? addMonths(currentMonthDate, 1) : subMonths(currentMonthDate, 1);
    const newPath = `/dashboard/analysis?month=${format(newMonth, 'yyyy-MM-dd')}`;
    router.push(newPath);
  };
  
  return (
    <div className="space-y-6">
        {/* Barra de Navegação de Mês */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 flex justify-between items-center">
            <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-semibold capitalize text-center w-48">
                {format(currentMonthDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <button onClick={() => handleMonthChange(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronRight size={24} />
            </button>
        </div>

        {/* Gráfico */}
        <div className="w-full h-[600px] bg-white dark:bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Fluxo Financeiro</h2>
            {data.nodes.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                    <Sankey
                        data={data}
                        nodePadding={30}
                        margin={{ left: 150, right: 150, top: 20, bottom: 20 }}
                        link={{ stroke: '#6b7280', strokeOpacity: 0.3 }}
                        
                        // --- MUDANÇA PRINCIPAL AQUI ---
                        // A lógica do CustomNode foi movida para dentro da prop 'node'
                        node={({ x = 0, y = 0, width = 0, height = 0, index, payload }: any) => {
                          const nodePayload = payload as CustomSankeyNodePayload;
                          const isOutNode = x > 200;
                          const fillColor = nodePayload.color || '#8884d8';
                          const name = nodePayload.name || 'N/A';
                          
                          return (
                            // A key é aplicada diretamente no elemento <g> (grupo)
                            <g key={`sankey-node-${index}`}> 
                              <rect x={x} y={y} width={width} height={height} fill={fillColor} fillOpacity="1" stroke="#374151" strokeWidth={0.5}/>
                              <text x={isOutNode ? x + width + 6 : x - 6} y={y + height / 2} textAnchor={isOutNode ? 'start' : 'end'} dominantBaseline="middle" className="fill-current text-gray-700 dark:text-gray-300 font-medium" >
                                {name}
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
                    Não há dados suficientes para exibir a análise para este mês.
                </div>
            )}
        </div>
    </div>
  );
}