'use client';

import { ConfirmSettlementAction, GetAllSettlementsAction } from "@/actions/cash-settlement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, DollarSign, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  SUBMITTED: 'Aguardando Confirmação',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-600',
};
const PAY_METHOD: Record<string, string> = { PIX: 'PIX', CASH: 'Espécie' };

export default function AcertosFinanceiroPage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState('SUBMITTED');
  const [confirming, setConfirming] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { data: res, mutate, isLoading } = useSWR(
    mounted ? ['settlements', tab] : null,
    () => GetAllSettlementsAction(tab === 'ALL' ? undefined : tab),
    { refreshInterval: 30000 }
  );

  const settlements = res?.data || [];

  // Métricas
  const { data: allRes } = useSWR(mounted ? ['settlements-all'] : null, () => GetAllSettlementsAction());
  const all = allRes?.data || [];
  const totalPending = all.filter((s: any) => s.status === 'PENDING').reduce((a: number, s: any) => a + s.totalAmount, 0);
  const totalSubmitted = all.filter((s: any) => s.status === 'SUBMITTED').reduce((a: number, s: any) => a + s.totalAmount, 0);
  const totalConfirmed = all.filter((s: any) => s.status === 'CONFIRMED').reduce((a: number, s: any) => a + s.totalAmount, 0);

  const handleConfirm = async () => {
    if (!confirming) return;
    setSaving(true);
    const r = await ConfirmSettlementAction(confirming.id);
    if (r.success) {
      toast.success(`Repasse de ${confirming.contributor?.name} confirmado`);
      setConfirming(null);
      mutate();
    } else {
      toast.error(r.error || "Erro ao confirmar");
    }
    setSaving(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-600/20">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Acertos <span className="text-emerald-600">Financeiros</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
            Repasses de vendas em dinheiro pelo app
          </p>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl cursor-pointer" onClick={() => setTab('PENDING')}>
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">A Repassar</p>
            <p className="text-2xl font-black text-orange-500 mt-1">
              {totalPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-[9px] text-slate-400 font-bold mt-0.5">vendedores ainda não informaram</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-blue-600 rounded-2xl cursor-pointer" onClick={() => setTab('SUBMITTED')}>
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Aguardando Confirmação</p>
            <p className="text-2xl font-black text-white mt-1">
              {totalSubmitted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-[9px] text-blue-200 font-bold mt-0.5">vendedores informaram o repasse</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl cursor-pointer" onClick={() => setTab('CONFIRMED')}>
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmados</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {totalConfirmed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-[9px] text-slate-400 font-bold mt-0.5">recebidos e confirmados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 h-auto">
          {[
            { value: 'SUBMITTED', label: 'Aguardando Confirmação' },
            { value: 'PENDING', label: 'Pendentes' },
            { value: 'CONFIRMED', label: 'Confirmados' },
            { value: 'ALL', label: 'Todos' },
          ].map((t) => (
            <TabsTrigger key={t.value} value={t.value}
              className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Vendedor</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Edição</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Vendas</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Forma</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Informado em</TableHead>
                  <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {[1,2,3,4,5,6,7,8].map((j) => <TableCell key={j}><div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" /></TableCell>)}
                    </TableRow>
                  ))
                ) : settlements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-48 text-center">
                      <p className="font-bold text-slate-400 uppercase text-xs tracking-widest italic">Nenhum acerto encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : settlements.map((s: any) => (
                  <TableRow key={s.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                    <TableCell className="pl-8 py-4">
                      <p className="font-black text-xs uppercase italic text-slate-900 dark:text-white">{s.contributor?.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">@{s.contributor?.username}</p>
                    </TableCell>
                    <TableCell className="text-[11px] font-bold text-slate-500">{s.edition?.name || '—'}</TableCell>
                    <TableCell className="text-center font-black text-sm text-slate-700">{s.orders?.length || 0}</TableCell>
                    <TableCell className="text-right font-black text-sm text-slate-900 dark:text-white">
                      {(s.totalAmount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell>
                      {s.paymentMethod ? (
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 border-none text-[9px] font-black">
                          {PAY_METHOD[s.paymentMethod] || s.paymentMethod}
                        </Badge>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${STATUS_COLOR[s.status] || 'bg-slate-100 text-slate-500'} border-none text-[9px] font-black`}>
                        {STATUS_LABEL[s.status] || s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] font-bold text-slate-400">
                      {s.submittedAt ? format(new Date(s.submittedAt), "dd/MM/yy HH:mm", { locale: ptBR }) : '—'}
                    </TableCell>
                    <TableCell className="pr-8">
                      {s.status === 'SUBMITTED' && (
                        <Button size="sm" onClick={() => setConfirming(s)}
                          className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] tracking-widest gap-1.5">
                          <CheckCircle2 className="h-3 w-3" /> Confirmar
                        </Button>
                      )}
                      {s.status === 'CONFIRMED' && s.confirmedAt && (
                        <span className="text-[10px] text-emerald-600 font-black">
                          ✓ {format(new Date(s.confirmedAt), "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de confirmação */}
      <Dialog open={!!confirming} onOpenChange={(v) => !v && setConfirming(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black uppercase italic flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Confirmar <span className="text-emerald-600">Recebimento</span>
            </DialogTitle>
          </DialogHeader>
          {confirming && (
            <div className="px-8 pb-4 space-y-3">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vendedor</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white">{confirming.contributor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</span>
                  <span className="font-black text-lg text-emerald-600">
                    {(confirming.totalAmount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Forma</span>
                  <span className="font-black text-sm text-slate-700">{PAY_METHOD[confirming.paymentMethod] || confirming.paymentMethod || '—'}</span>
                </div>
                {confirming.notes && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Obs do vendedor</p>
                    <p className="text-xs font-bold text-slate-600">{confirming.notes}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 font-bold text-center">
                Confirme que o valor acima foi recebido da tesouraria.
              </p>
            </div>
          )}
          <DialogFooter className="p-8 pt-0 flex flex-row gap-3">
            <Button variant="ghost" onClick={() => setConfirming(null)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] text-slate-400">Cancelar</Button>
            <Button onClick={handleConfirm} disabled={saving}
              className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest gap-2">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {saving ? "Confirmando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
