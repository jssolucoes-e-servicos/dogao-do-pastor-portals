'use client'

import { Medal, Star, Trophy } from "lucide-react"

interface RankingListProps {
  data: { name: string, total: number }[]
  color?: 'orange' | 'blue'
}

export function RankingList({ data, color = 'orange' }: RankingListProps) {
  const maxSales = data.length > 0 ? data[0].total : 0
  const barColor = color === 'orange' ? 'bg-orange-500' : 'bg-blue-500'
  const bgColor = color === 'orange' ? 'bg-orange-100 dark:bg-orange-950/40' : 'bg-blue-100 dark:bg-blue-950/40'

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <Star className="h-8 w-8 mb-2 opacity-20" />
        <p className="text-xs font-medium">Nenhum registro nesta edição.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {data.map((item, index) => {
        const percentage = maxSales > 0 ? (item.total / maxSales) * 100 : 0
        return (
          <div key={item.name} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center shrink-0">
                  {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                  {index === 1 && <Medal className="h-4 w-4 text-slate-400" />}
                  {index === 2 && <Medal className="h-4 w-4 text-orange-400" />}
                  {index > 2 && <span className="text-[10px] font-bold text-slate-400">#{index + 1}</span>}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase truncate max-w-[150px]">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 dark:text-white">{item.total}</span>
              </div>
            </div>
            <div className={`h-1.5 w-full rounded-full ${bgColor}`}>
              <div 
                className={`h-full rounded-full ${barColor} transition-all duration-500`} 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}