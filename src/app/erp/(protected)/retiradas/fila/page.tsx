'use client'

import { CommandsPaginateAction } from "@/actions/commands/paginate.action";
import { UpdateCommandStatusAction } from "@/actions/commands/update-status.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { CommandStatusEnum } from "@/common/enums/command-status.enum";
import {
  ShoppingBag, CheckCircle2, RefreshCw, LayoutDashboard,
  PackageSearch, Building2, Hash
} from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";

export default function RetiradasFilaPage() {
  const [mounted, setMounted] = useState(false);
  const [confirmCommand, setConfirmCommand] = useState<any>(null);

  useEffect(() => { setMounted(true); }, []);

  // Busca PICKUP (EXPEDITION) + doações (EXPEDITION com withdrawalId)
  const { data: response, error, mutate, isValidating } = useSWR(
    mounted ? 'pickup-queue' : null,
    () => CommandsPaginateAction(1, 50, undefined, [CommandStatusEnum.EXPEDITION]),
    { refreshInterval: 5000 }
  );

  const commands = response?.data?.data || [];
  const isLoading = !response && !error;

  const handleDeliver = async (id: string) => {
    const res = await UpdateCommandStatusAction(id, CommandStatusEnum.DELIVERED);
    if (res.success) {
      toast.success("Entregue com sucesso!");
      mutate();
      setConfirmCommand(null);
    } else {
      toast.error("Erro ao marcar como entregue");
    }
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400 italic">Carregando...</p>
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
              Balcão & Doações • {commands.length} prontos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isValidating && <RefreshCw className="h-4 w-4 animate-spin text-slate-300" />}
          <Link href="/erp">
            <Button variant="outline" size="sm" className="gap-2 h-9 font-bold text-[10px] uppercase tracking-widest border-slate-200 dark:border-slate-800">
              <LayoutDashboard className="h-3.5 w-3.5" /> Voltar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {commands.map((command: any) => {
          const isWithdrawal = !!command.withdrawalId && !command.orderId;
          const name = isWithdrawal
            ? (command.withdrawal?.partner?.name || 'Doação')
            : (command.order?.customerName || 'Cliente');
          const phone = isWithdrawal
            ? command.withdrawal?.partner?.phone
            : command.order?.customerPhone;
          const obs = command.order?.observations || '';
          const hasPromo = obs.toLowerCase().includes('coca') || obs.toLowerCase().includes('combo');
          const qty = isWithdrawal
            ? (command.quantity || command.withdrawal?.items?.length || 0)
            : (command.commandItems?.length || command.order?.items?.length || 0);

          return (
            <Card key={command.id}
              className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 hover:shadow-md transition-all">
              <div className={`h-1 w-full ${isWithdrawal ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <CardHeader className="pb-2 pt-3 px-4 space-y-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xl font-black tracking-tighter italic ${isWithdrawal ? 'text-emerald-600' : 'text-blue-600'}`}>
                    #{command.sequentialId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isWithdrawal && <Badge className="bg-emerald-100 text-emerald-700 border-none text-[8px] font-black uppercase h-4 px-1.5">Doação</Badge>}
                    <span className="text-[9px] font-bold text-slate-400">
                      {formatDistanceToNow(new Date(command.updatedAt), { addSuffix: false, locale: ptBR })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {isWithdrawal && <Building2 className="h-3 w-3 text-emerald-500 shrink-0" />}
                  <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{name}</p>
                </div>
                {phone && <p className="text-[9px] text-slate-400 font-bold">{phone}</p>}
                <p className="text-[9px] font-black text-orange-600">{qty} dog{qty !== 1 ? 's' : ''}</p>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-1 space-y-2">
                {hasPromo && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                    <p className="text-[9px] font-black uppercase text-orange-600 mb-0.5">Atenção</p>
                    <p className="text-[10px] font-bold text-orange-800 italic">&ldquo;{obs}&rdquo;</p>
                  </div>
                )}
                <Button
                  className={`w-full text-white font-black uppercase text-[9px] gap-1.5 h-9 border-none transition-all active:scale-95
                    ${isWithdrawal ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  onClick={() => setConfirmCommand(command)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isWithdrawal ? 'Confirmar Retirada' : 'Entregue'}
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {commands.length === 0 && !isLoading && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <PackageSearch className="h-16 w-16 text-slate-200 mb-4" />
            <p className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">Nenhum pedido aguardando</p>
          </div>
        )}
      </div>

      {/* Modal de confirmação de retirada */}
      <Dialog open={!!confirmCommand} onOpenChange={(v) => !v && setConfirmCommand(null)}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-black uppercase text-sm flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Confirmar {confirmCommand?.withdrawalId ? 'Retirada' : 'Entrega'}
            </DialogTitle>
          </DialogHeader>

          {confirmCommand && (
            <div className="space-y-4 py-2">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-orange-500" />
                  <span className="font-black text-2xl text-orange-600">#{confirmCommand.sequentialId}</span>
                </div>
                <p className="font-bold text-sm uppercase">
                  {confirmCommand.withdrawal?.partner?.name || confirmCommand.order?.customerName}
                </p>
                <p className="text-[10px] text-slate-500 font-bold">
                  {confirmCommand.quantity || confirmCommand.commandItems?.length || confirmCommand.order?.items?.length || 0} dog(s)
                </p>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Confirme que o número acima corresponde ao cupom apresentado.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmCommand(null)} className="rounded-xl font-black uppercase text-[10px]">
              Cancelar
            </Button>
            <Button
              onClick={() => confirmCommand && handleDeliver(confirmCommand.id)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-[10px] gap-2"
            >
              <CheckCircle2 className="h-4 w-4" /> Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
