'use client'

import { CommandsPaginateAction } from "@/actions/commands/paginate.action";
import { UpdateCommandStatusAction } from "@/actions/commands/update-status.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandStatusEnum } from "@/common/enums/command-status.enum";
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  PlayCircle,
  RefreshCw,
  Utensils,
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {commands.map((command: any) => (
          <Card 
            key={command.id} 
            className={`
              border-none shadow-sm overflow-hidden transition-all duration-300
              ${command.status === CommandStatusEnum.IN_PRODUCTION 
                ? 'bg-orange-50 dark:bg-orange-950/10 ring-2 ring-orange-500/30' 
                : 'bg-white dark:bg-slate-900'}
            `}
          >
            <div className={`h-1.5 w-full ${command.status === CommandStatusEnum.IN_PRODUCTION ? 'bg-orange-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-800'}`} />
            
            <CardHeader className="pb-3 pt-4 space-y-0">
              <div className="flex items-center justify-between mb-2">
                <Badge 
                   variant={command.status === CommandStatusEnum.PENDING ? 'outline' : 'default'} 
                   className={`
                     uppercase font-black text-[9px] tracking-widest px-2 py-0.5
                     ${command.status === CommandStatusEnum.PENDING 
                        ? 'border-slate-200 text-slate-500' 
                        : 'bg-orange-600 hover:bg-orange-600'}
                   `}
                >
                  {command.status === CommandStatusEnum.PENDING ? 'Aguardando' : 'Em Montagem'}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 italic">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(command.createdAt), { addSuffix: true, locale: ptBR })}
                </div>
              </div>
              <CardTitle className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-orange-600 italic">#{command.sequentialId}</span>
              </CardTitle>
              <p className="text-[10px] font-bold text-slate-400 uppercase truncate mt-0.5 tracking-tight border-b border-slate-50 dark:border-slate-800 pb-2">
                {command.order?.customerName || 'Retirada Direta'}
              </p>
            </CardHeader>
            
            <CardContent className="pt-2 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 mb-2">
                    <Utensils className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ingredientes</span>
                </div>
                {command.order?.items?.[0]?.removedIngredients?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {command.order.items[0].removedIngredients.map((ing: string) => (
                            <Badge key={ing} variant="destructive" className="text-[9px] font-bold px-2 py-0 uppercase bg-red-100 text-red-600 border-none hover:bg-red-100">
                                SEM {ing}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-[11px] font-black text-emerald-600 italic uppercase bg-emerald-50 dark:bg-emerald-950/20 w-fit px-2 rounded-md">Padrão da Casa ✨</p>
                )}
              </div>

              {command.order?.observations && (
                  <div className="bg-blue-50/50 dark:bg-blue-950/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                     <p className="text-[9px] font-black uppercase text-blue-500 mb-1">Obs:</p>
                     <p className="text-[11px] text-blue-900 dark:text-blue-300 font-bold leading-relaxed italic">
                        "{command.order.observations}"
                     </p>
                  </div>
              )}

              <div className="pt-2 flex gap-2">
                {command.status === CommandStatusEnum.PENDING ? (
                  <Button 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-black uppercase tracking-widest text-[10px] gap-2 h-11 border-none transition-all active:scale-95 group shadow-lg shadow-slate-900/10"
                    onClick={() => handleUpdateStatus(command.id, CommandStatusEnum.IN_PRODUCTION)}
                  >
                    <PlayCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Iniciar Montagem
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] gap-2 h-11 border-none transition-all active:scale-95 group shadow-lg shadow-emerald-600/20"
                    onClick={() => handleUpdateStatus(command.id, CommandStatusEnum.PRODUCED)}
                  >
                    <CheckCircle2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Concluir Dogão
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
