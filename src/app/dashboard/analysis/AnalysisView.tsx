// src/app/dashboard/analysis/AnalysisView.tsx

'use client';
import { Sankey, ResponsiveContainer, Tooltip } from 'recharts';

// --- Tipos (sem alterações) ---
type CustomSankeyNode = {
  name: string;
  color: string;
};
type SankeyData = {
  nodes: CustomSankeyNode[];
  links: { source: number; target: number; value: number }[];
};
interface AnalysisViewProps {
  data: SankeyData;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const CustomNode = ({ x = 0, y = 0, width = 0, height = 0, payload }: any) => {
  const nodePayload = payload as CustomSankeyNode;
  const isOutNode = x > 200;

  const fillColor = nodePayload.color || '#8884d8';
  const name = nodePayload.name || 'N/A';

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fillColor}
        fillOpacity="1"
        stroke="#374151"
        strokeWidth={0.5}
      />
      <text
        x={isOutNode ? x + width + 6 : x - 6}
        y={y + height / 2}
        textAnchor={isOutNode ? 'start' : 'end'}
        dominantBaseline="middle"
        className="fill-current text-gray-700 dark:text-gray-300 font-medium"
      >
        {name}
      </text>
    </g>
  );
};


export default function AnalysisView({ data }: AnalysisViewProps) {
  if (!data || data.links.length === 0) {
    return <div className="text-center p-8">Não há dados suficientes para exibir a análise.</div>;
  }

  return (
    <div className="w-full h-[600px] bg-white dark:bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Fluxo Financeiro</h2>
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={data}
          nodePadding={30}
          margin={{
            left: 150,
            right: 150,
            top: 20,
            bottom: 20,
          }}
          link={{ stroke: '#6b7280', strokeOpacity: 0.3 }}
          
          // --- CORREÇÃO FINAL AQUI ---
          // Adicionamos a 'key' única que o React exige para cada item da lista.
          // A 'props' que a recharts nos dá já inclui o 'index' para usarmos como chave.
          node={(props) => <CustomNode key={`sankey-node-${props.index}`} {...props} />}
          
        >
          <Tooltip formatter={(value: any) => formatCurrency(value)} />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}