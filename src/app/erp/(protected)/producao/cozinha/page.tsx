'use client'

import { CommandsPaginateAction } from "@/actions/commands/paginate.action";
import { UpdateCommandStatusAction } from "@/actions/commands/update-status.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CommandStatusEnum } from "@/common/enums/command-status.enum";
import { 
  ChefHat, 
  CheckCircle2, 
  PlayCircle,
  RefreshCw,
  LayoutDashboard
} from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";

export default function ProducaoCozinhaPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: response, error, mutate, isValidating } = useSWR(
    mounted ? 'production-queue' : null,
    () => CommandsPaginateAction(1, 50, undefined, [CommandStatusEnum.PENDING, CommandStatusEnum.IN_PRODUCTION]),
    { refreshInterval: 5000 }
  );

  const commands = response?.data?.data || [];
  const isLoading = !response && !error;

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Otimismo no UI
    const res = await UpdateCommandStatusAction(id, newStatus);
    if (res.success) {
      toast.success("Status atualizado!");
      mutate();
    } else {
      toast.error("Erro ao atualizar status");
    }
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400 italic animate-pulse">
            Carregando Fila de Produção...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="bg-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-600/20">
                <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
                Fila de <span className="text-orange-600">Produção</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
                Cozinha & Montagem • {commands.length} pedidos pendentes
              </p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[9px] font-black uppercase text-slate-400">Status do Servidor</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                    {isValidating && <RefreshCw className="h-2.5 w-2.5 animate-spin text-slate-300" />}
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 dark:text-emerald-400 uppercase text-[9px] font-black px-2 py-0.5">
                        • LIVE
                    </Badge>
                </div>
            </div>
            <Link href="/erp">
                <Button variant="outline" size="sm" className="gap-2 h-9 font-bold text-[10px] uppercase tracking-widest border-slate-200 dark:border-slate-800">
                    <LayoutDashboard className="h-3.5 w-3.5" /> Voltar
                </Button>
            </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {commands.map((command: any) => (
          <Card 
            key={command.id} 
            className={`border-none shadow-sm overflow-hidden transition-all duration-300
              ${command.status === CommandStatusEnum.IN_PRODUCTION 
                ? 'bg-orange-50 dark:bg-orange-950/10 ring-2 ring-orange-500/30' 
                : 'bg-white dark:bg-slate-900'}`}
          >
            <div className={`h-1 w-full ${command.status === CommandStatusEnum.IN_PRODUCTION ? 'bg-orange-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-800'}`} />
            
            <CardHeader className="pb-2 pt-3 px-4 space-y-0">
              <div className="flex items-center justify-between">
                <span className="text-xl font-black tracking-tighter text-orange-600 italic">
                  #{command.sequentialId}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge 
                    className={`uppercase font-black text-[8px] px-1.5 py-0 h-4
                      ${command.status === CommandStatusEnum.PENDING 
                        ? 'bg-slate-100 text-slate-500 border-none' 
                        : 'bg-orange-500 text-white border-none'}`}
                  >
                    {command.status === CommandStatusEnum.PENDING ? 'Aguardando' : 'Montando'}
                  </Badge>
                  <span className="text-[9px] font-bold text-slate-400">
                    {formatDistanceToNow(new Date(command.createdAt), { addSuffix: false, locale: ptBR })}
                  </span>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase truncate">
                {command.order?.customerName || command.withdrawal?.partner?.name || 'Retirada Direta'}
              </p>
            </CardHeader>
            
            <CardContent className="px-4 pb-3 pt-2 space-y-2">
              {/* Dogs agrupados */}
              <div className="space-y-1">
                {(() => {
                  // Para doações: usa withdrawal.items; para pedidos: usa commandItems ou order.items
                  const isWithdrawal = !!command.withdrawalId && !command.orderId;
                  const cmdItems: any[] = command.commandItems?.length > 0
                    ? command.commandItems
                    : isWithdrawal
                      ? (command.withdrawal?.items || [])
                      : (command.order?.items || []);

                  // Se é doação e não tem items detalhados, mostra só a quantidade total
                  if (isWithdrawal && cmdItems.length === 0 && command.quantity) {
                    return (
                      <div className="flex items-start gap-1.5">
                        <span className="text-xs font-black text-orange-600 shrink-0">{command.quantity}x</span>
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Completo ✓</span>
                      </div>
                    );
                  }
                  const groups: Record<string, { count: number; removed: string[] }> = {};
                  for (const item of cmdItems) {
                    const removed: string[] = item.removedIngredients || [];
                    const key = [...removed].sort().join('|') || '__completo__';
                    if (!groups[key]) groups[key] = { count: 0, removed };
                    groups[key].count++;
                  }
                  return Object.values(groups).map((g, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-xs font-black text-orange-600 shrink-0">{g.count}x</span>
                      {g.removed.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {g.removed.map((ing: string) => (
                            <span key={ing} className="text-[8px] font-black uppercase bg-red-600 text-white px-1.5 py-0.5 rounded-md">
                              -{ing}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Completo ✓</span>
                      )}
                    </div>
                  ));
                })()}
              </div>

              <div className="flex gap-2 pt-1">
                {command.status === CommandStatusEnum.PENDING ? (
                  <Button 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-black uppercase text-[9px] gap-1.5 h-9 border-none transition-all active:scale-95"
                    onClick={() => handleUpdateStatus(command.id, CommandStatusEnum.IN_PRODUCTION)}
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    Iniciar
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[9px] gap-1.5 h-9 border-none transition-all active:scale-95"
                    onClick={() => handleUpdateStatus(command.id, CommandStatusEnum.PRODUCED)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Concluído
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {commands.length === 0 && !isLoading && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 animate-in zoom-in duration-500">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-full shadow-sm mb-6">
                    <ChefHat className="h-16 w-16 text-slate-200" />
                </div>
                <p className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">Nenhum pedido em produção no momento</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 opacity-60">Cozinha em modo de espera...</p>
            </div>
        )}
      </div>
    </div>
  );
}
