import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentDonations({ list }: { list: any[] }) {
  return (
    <div className="space-y-8">
      {list.map((item) => (
        <div key={item.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
              {item.customer[0]}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-bold leading-none">{item.customer}</p>
            <p className="text-xs text-muted-foreground italic">Destino: {item.institution}</p>
          </div>
          <div className="ml-auto font-bold text-sm text-emerald-600">
            +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
          </div>
        </div>
      ))}
    </div>
  )
}