'use client'

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface DataItem {
  label: string
  value: number
}

interface DistributionChartProps {
  data: DataItem[]
  colors?: string[]
}

const DEFAULT_COLORS = ["#f97316", "#3b82f6", "#ef4444", "#10b981", "#8b5cf6", "#facc15"]

export function DistributionChart({ data, colors = DEFAULT_COLORS }: DistributionChartProps) {
  if (data.length === 0) return <div className="h-40 flex items-center justify-center text-xs text-slate-400">Sem dados</div>

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          />
          <Pie
            data={data}
            innerRadius={50}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
            nameKey="label"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="none" />
            ))}
          </Pie>
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}