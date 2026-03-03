'use client'

import { DashboardStatsEntity } from "@/common/entities"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileSpreadsheet,
  Minimize,
  MoreVertical,
  Tv
} from "lucide-react"

interface DashboardActionsProps {
  data: DashboardStatsEntity | undefined
  isFullScreen: boolean
  onToggleFullScreen: () => void
}

export function DashboardActions({ data, isFullScreen, onToggleFullScreen }: DashboardActionsProps) {
  
  const exportToCSV = () => {
    if (!data) return;

    const rows = [
      ["Relatorio de Vendas - " + data.editionName],
      ["Gerado em", new Date().toLocaleString()],
      [""],
      ["Categoria", "Valor"],
      ["Faturamento Total", data.totalRevenue.toFixed(2)],
      ["Cachorros Vendidos", data.totalDogsSold.toString()],
      ["Doacoes Totais", data.totalDonations.toString()],
      [""],
      ["Ranking Celulas (Top 5)"],
      ...data.rankingCells.map(c => [c.name, c.total.toString()]),
      [""],
      ["Ingredientes Mais Retirados"],
      ...data.ingredientsStats.map(i => [i.name, i.count.toString()])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dashboard_${data.editionName.replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800">
          <MoreVertical className="h-4 w-4 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          Ferramentas
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onToggleFullScreen} className="cursor-pointer gap-2 font-medium">
          {isFullScreen ? (
            <>
              <Minimize className="h-4 w-4 text-orange-500" />
              <span>Sair do Modo Monitor</span>
            </>
          ) : (
            <>
              <Tv className="h-4 w-4 text-blue-500" />
              <span>Modo Monitor</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={exportToCSV} disabled={!data} className="cursor-pointer gap-2 font-medium">
          <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
          <span>Exportar Planilha (CSV)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}