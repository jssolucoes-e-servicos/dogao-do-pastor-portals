'use client'

import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Circle, ShoppingBag } from "lucide-react"

interface RecentOrdersProps {
  list: { id: string, customer: string, status: string, time: string | Date }[]
}

const statusMap: Record<string, { label: string, color: string, text: string }> = {
  PAID: { label: 'Pago', color: 'bg-emerald-500', text: 'text-emerald-500' },
  PENDING_PAYMENT: { label: 'Pendente', color: 'bg-orange-500', text: 'text-orange-500' },
  DIGITATION: { label: 'Carrinho', color: 'bg-slate-400', text: 'text-slate-400' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500', text: 'text-red-500' },
}

export function RecentDonations({ list }: RecentOrdersProps) {
  if (list.length === 0) return <p className="text-xs text-slate-400 text-center py-4">Sem atividades.</p>

  return (
    <div className="space-y-4">
      {list.map((order) => {
        const status = statusMap[order.status] || { label: order.status, color: 'bg-slate-200', text: 'text-slate-400' }
        return (
          <div key={order.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-orange-500 transition-colors">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-1 truncate max-w-[120px]">
                  {order.customer || 'Consumidor'}
                </span>
                <span className="text-[9px] font-medium text-slate-400 uppercase">
                  {formatDistanceToNow(new Date(order.time), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
            </div>
            <Badge variant="outline" className="text-[9px] font-black border-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Circle className={`h-1 w-1 fill-current ${status.text}`} />
              {status.label}
            </Badge>
          </div>
        )
      })}
    </div>
  )
}