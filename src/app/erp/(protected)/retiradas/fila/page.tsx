'use client'

import { CommandsPaginateAction } from "@/actions/commands/paginate.action";
import { UpdateCommandStatusAction } from "@/actions/commands/update-status.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandStatusEnum } from "@/common/enums/command-status.enum";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  User,
  LayoutDashboard,
  PackageSearch
} from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";

export default function RetiradasFilaPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: response, error, mutate, isValidating } = useSWR(
    mounted ? 'pickup-queue' : null,
    () => CommandsPaginateAction(1, 50, undefined, [CommandStatusEnum.EXPEDITION], 'PICKUP'),
    { refreshInterval: 5000 }
  );

  const commands = response?.data?.data || [];
  const isLoading = !response && !error;

  const handleDeliver = async (id: string) => {
    const res = await UpdateCommandStatusAction(id, CommandStatusEnum.DELIVERED);
    if (res.success) {
      toast.success("Dogão entregue com sucesso!");
      mutate();
    } else {
      toast.error("Erro ao marcar como entregue");
    }
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400 italic">Carregando Fila de Retiradas...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
                <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
                Aguardando <span className="text-blue-600">Retirada</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
                Balcão & Pickup • {commands.length} dogões prontos
              </p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[9px] font-black uppercase text-slate-400">Balcão Ativo</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                    {isValidating && <RefreshCw className="h-2.5 w-2.5 animate-spin text-slate-300" />}
                    <Badge variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20 dark:text-blue-400 uppercase text-[9px] font-black px-2 py-0.5">
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
            className="border-none shadow-sm overflow-hidden transition-all duration-300 bg-white dark:bg-slate-900 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="h-1.5 w-full bg-blue-500" />
            
            <CardHeader className="pb-3 pt-4 space-y-0">
              <div className="flex items-center justify-between mb-2">
                <Badge className="uppercase font-black text-[9px] tracking-widest px-2 py-0.5 bg-emerald-500 hover:bg-emerald-500">
                  Pronto
                </Badge>
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 italic">
                  <Clock className="h-3 w-3" />
                  Concluído {formatDistanceToNow(new Date(command.updatedAt), { addSuffix: true, locale: ptBR })}
                </div>
              </div>
              <CardTitle className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-blue-600 italic">#{command.sequentialId}</span>
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 truncate">
                 <User className="h-3 w-3 text-slate-400" />
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    {command.order?.customerName || 'Cliente'}
                 </p>
              </div>
            </CardHeader>
            
            <CardContent className="pt-2 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Contato:</p>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {command.order?.customerPhone || 'Não informado'}
                </p>
              </div>

              {command.order?.observations && (
                  <div className="bg-orange-50/50 dark:bg-orange-950/10 p-3 rounded-xl border border-orange-100/50 dark:border-orange-900/20">
                     <p className="text-[9px] font-black uppercase text-orange-600 mb-1">Obs Importante:</p>
                     <p className="text-[11px] text-orange-900 dark:text-orange-300 font-bold leading-relaxed italic">
                        "{command.order.observations}"
                     </p>
                  </div>
              )}

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] gap-2 h-12 border-none transition-all active:scale-95 group shadow-lg shadow-blue-600/20"
                onClick={() => handleDeliver(command.id)}
              >
                <CheckCircle2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Marcar como Entregue
              </Button>
            </CardContent>
          </Card>
        ))}

        {commands.length === 0 && !isLoading && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 animate-in zoom-in duration-500">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-full shadow-sm mb-6">
                    <PackageSearch className="h-16 w-16 text-slate-200" />
                </div>
                <p className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">Nenhum pedido aguardando no balcão</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 opacity-60">Operação ágil...</p>
            </div>
        )}
      </div>
    </div>
  );
}
