'use client'

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface IngredientsChartProps {
  data: { name: string; count: number }[]
}

export function IngredientsChart({ data }: IngredientsChartProps) {
  if (!data || data.length === 0) return <div className="h-40 flex items-center justify-center text-xs text-slate-400 font-medium">Nenhuma remoção.</div>

  const chartData = data.slice(0, 6)

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 30, top: 10 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false}
            width={90}
            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#f43f5e'} fillOpacity={1 - index * 0.15} />
            ))}
            <LabelList 
              dataKey="count" 
              position="right" 
              style={{ fontSize: '11px', fontWeight: 'bold', fill: '#64748b' }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}