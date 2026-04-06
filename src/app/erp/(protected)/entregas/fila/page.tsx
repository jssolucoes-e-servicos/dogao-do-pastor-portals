'use client'

import { CommandsPaginateAction } from "@/actions/commands/paginate.action";
import { UpdateCommandStatusAction } from "@/actions/commands/update-status.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CommandStatusEnum } from "@/common/enums/command-status.enum";
import { 
  Truck, 
  MapPin, 
  RefreshCw,
  Navigation,
  LayoutDashboard,
  Boxes
} from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";

export default function EntregasFilaPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: response, error, mutate, isValidating } = useSWR(
    mounted ? 'delivery-queue' : null,
    () => CommandsPaginateAction(1, 100, undefined, [CommandStatusEnum.QUEUED_FOR_DELIVERY], 'DELIVERY'),
    { refreshInterval: 5000 }
  );

  const commands = response?.data?.data || [];
  const isLoading = !response && !error;

  const handleDispatch = async (id: string) => {
    const res = await UpdateCommandStatusAction(id, CommandStatusEnum.OUT_FOR_DELIVERY);
    if (res.success) {
      toast.success("Dogão saiu para entrega!");
      mutate();
    } else {
      toast.error("Erro ao despachar pedido");
    }
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400 italic">Carregando Fila de Entregas...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-600/20">
                <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
                Fila de <span className="text-purple-600">Entregas</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
                Expedição & Logística • {commands.length} pacotes aguardando
              </p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[9px] font-black uppercase text-slate-400">Despacho Ativo</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                    {isValidating && <RefreshCw className="h-2.5 w-2.5 animate-spin text-slate-300" />}
                    <Badge variant="outline" className="border-purple-500/30 text-purple-600 bg-purple-50/50 dark:bg-purple-950/20 dark:text-purple-400 uppercase text-[9px] font-black px-2 py-0.5">
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
        {commands.map((command: any) => {
          const order = command.order;
          const obs = order?.observations || '';
          const hasPromo = obs.toLowerCase().includes('coca') || obs.toLowerCase().includes('combo') || obs.toLowerCase().includes('promo');
          const isMoney = order?.paymentType === 'MONEY';
          const isPOS = order?.paymentType === 'POS';
          const totalValue: number = order?.totalValue || 0;

          // Detecta troco: obs contém "troco" ou "recebido" com valor
          const trocoMatch = obs.match(/receb[iu].*?R?\$?\s*([\d.,]+)/i) || obs.match(/troco.*?R?\$?\s*([\d.,]+)/i);
          const receivedValue = trocoMatch ? parseFloat(trocoMatch[1].replace(',', '.')) : 0;
          const troco = receivedValue > totalValue ? receivedValue - totalValue : 0;

          return (
          <Card 
            key={command.id} 
            className="border-none shadow-sm overflow-hidden transition-all duration-300 bg-white dark:bg-slate-900 hover:shadow-md"
          >
            <div className="h-1 w-full bg-purple-500" />
            
            <CardHeader className="pb-2 pt-3 px-4 space-y-0">
              <div className="flex items-center justify-between">
                <span className="text-xl font-black tracking-tighter text-purple-600 italic">#{command.sequentialId}</span>
                <span className="text-[9px] font-bold text-slate-400">
                  {formatDistanceToNow(new Date(command.updatedAt), { addSuffix: false, locale: ptBR })}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{order?.customerName || 'Cliente'}</p>
            </CardHeader>
            
            <CardContent className="px-4 pb-3 pt-1 space-y-2">
              {/* Endereço compacto */}
              {order?.address && (
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-3 w-3 text-purple-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-tight">
                    {order.address.street}, {order.address.number} — {order.address.neighborhood}
                  </p>
                </div>
              )}

              {/* Maquininha */}
              {isPOS && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-lg">💳</span>
                  <div>
                    <p className="text-[9px] font-black uppercase text-blue-700">Levar Maquininha</p>
                    <p className="text-[9px] text-blue-600 font-bold">R$ {totalValue.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {/* Troco */}
              {isMoney && (
                <div className={`rounded-xl px-3 py-2 border ${troco > 0 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-[9px] font-black uppercase text-slate-500">Pagamento Dinheiro</p>
                  <p className="text-[9px] font-bold text-slate-600">Total: R$ {totalValue.toFixed(2)}</p>
                  {troco > 0 && (
                    <>
                      <p className="text-[9px] font-bold text-amber-700">Recebido: R$ {receivedValue.toFixed(2)}</p>
                      <p className="text-sm font-black text-amber-700 uppercase">TROCO: R$ {troco.toFixed(2)}</p>
                    </>
                  )}
                </div>
              )}

              {/* Obs só se for promocional */}
              {hasPromo && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                  <p className="text-[9px] font-black uppercase text-orange-600 mb-0.5">Atenção</p>
                  <p className="text-[10px] font-bold text-orange-800 italic">&ldquo;{obs}&rdquo;</p>
                </div>
              )}

              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black uppercase text-[9px] gap-1.5 h-9 border-none transition-all active:scale-95"
                onClick={() => handleDispatch(command.id)}
              >
                <Navigation className="h-3.5 w-3.5" />
                Despachar
              </Button>
            </CardContent>
          </Card>
          );
        })}

        {commands.length === 0 && !isLoading && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 animate-in zoom-in duration-500">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-full shadow-sm mb-6">
                    <Boxes className="h-16 w-16 text-slate-200" />
                </div>
                <p className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">Nenhum pacote na fila de despacho</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 opacity-60">Logística limpa...</p>
            </div>
        )}
      </div>
    </div>
  );
}
