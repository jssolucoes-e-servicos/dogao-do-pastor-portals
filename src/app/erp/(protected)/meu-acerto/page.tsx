'use client';

import { GetMyCashSettlementsAction } from "@/actions/cash-settlement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchApi, FetchCtx } from "@/lib/api";
import { DollarSign, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente', SUBMITTED: 'Aguardando Confirmação',
  CONFIRMED: 'Confirmado', CANCELLED: 'Cancelado',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700', SUBMITTED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700', CANCELLED: 'bg-red-100 text-red-600',
};

export default function MeuAcertoPage() {
  const [mounted, setMounted] = useState(false);
  const [submitModal, setSubmitModal] = useState<any>(null);
  const [payMethod, setPayMethod] = useState<'PIX' | 'CASH'>('PIX');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { data: res, mutate, isLoading } = useSWR(
    mounted ? 'my-settlements' : null,
    () => GetMyCashSettlementsAction(),
    { refreshInterval: 30000 }
  );

  const settlements = res?.data || [];
  const totalPending = settlements.filter((s: any) => s.status === 'PENDING').reduce((a: number, s: any) => a + s.totalAmount, 0);
  const totalSubmitted = settlements.filter((s: any) => s.status === 'SUBMITTED').reduce((a: number, s: any) => a + s.totalAmount, 0);

  const handleSubmit = async () => {
    if (!submitModal) return;
    setSaving(true);
    try {
      await fetchApi(FetchCtx.ERP, `/cash-settlements/${submitModal.id}/submit`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentMethod: payMethod }),
      });
      toast.success("Repasse informado com sucesso! Aguarde a confirmação da tesoureira.");
      setSubmitModal(null);
      mutate();
    } catch (e: any) {
      toast.error(e.message || "Erro ao informar repasse");
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
            Meu <span className="text-emerald-600">Acerto</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
            Saldo de vendas em dinheiro a repassar
          </p>
        </div>
      </div>

      {/* Métricas */}
      {(totalPending > 0 || totalSubmitted > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {totalPending > 0 && (
            <Card className="border-none shadow-sm bg-orange-600 rounded-2xl">
              <CardContent className="p-5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-100">Saldo a Repassar</p>
                <p className="text-3xl font-black text-white mt-1">
                  {totalPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-[9px] text-orange-200 font-bold mt-1">Informe o repasse quando pagar</p>
              </CardContent>
            </Card>
          )}
          {totalSubmitted > 0 && (
            <Card className="border-none shadow-sm bg-blue-600 rounded-2xl">
              <CardContent className="p-5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Aguardando Confirmação</p>
                <p className="text-3xl font-black text-white mt-1">
                  {totalSubmitted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-[9px] text-blue-200 font-bold mt-1">A tesoureira confirmará o recebimento</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Edição</TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Vendas</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {[1,2,3,4,5].map((j) => <TableCell key={j}><div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" /></TableCell>)}
                </TableRow>
              ))
            ) : settlements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <p className="font-bold text-slate-400 uppercase text-xs tracking-widest italic">Nenhum acerto pendente</p>
                  <p className="text-[10px] text-slate-300 mt-2">Vendas em dinheiro pelo app aparecerão aqui</p>
                </TableCell>
              </TableRow>
            ) : settlements.map((s: any) => (
              <TableRow key={s.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                <TableCell className="pl-8 py-4 font-black text-xs uppercase italic text-slate-900 dark:text-white">
                  {s.edition?.name || '—'}
                </TableCell>
                <TableCell className="text-center font-black text-sm text-slate-700">{s.orders?.length || 0}</TableCell>
                <TableCell className="text-right font-black text-lg text-slate-900 dark:text-white">
                  {(s.totalAmount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`${STATUS_COLOR[s.status] || 'bg-slate-100 text-slate-500'} border-none text-[9px] font-black`}>
                    {STATUS_LABEL[s.status] || s.status}
                  </Badge>
                </TableCell>
                <TableCell className="pr-8">
                  {s.status === 'PENDING' && (
                    <Button size="sm" onClick={() => setSubmitModal(s)}
                      className="h-8 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[9px] tracking-widest gap-1.5">
                      <Send className="h-3 w-3" /> Informar Repasse
                    </Button>
                  )}
                  {s.status === 'SUBMITTED' && (
                    <span className="text-[10px] text-blue-600 font-black">Aguardando confirmação</span>
                  )}
                  {s.status === 'CONFIRMED' && s.confirmedAt && (
                    <span className="text-[10px] text-emerald-600 font-black">
                      ✓ Confirmado em {format(new Date(s.confirmedAt), "dd/MM HH:mm", { locale: ptBR })}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal informar repasse */}
      <Dialog open={!!submitModal} onOpenChange={(v) => !v && setSubmitModal(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-xl font-black uppercase italic">
              Informar <span className="text-emerald-600">Repasse</span>
            </DialogTitle>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Valor: {(submitModal?.totalAmount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </DialogHeader>
          <div className="p-8 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Como você repassou?</Label>
              <Select value={payMethod} onValueChange={(v) => setPayMethod(v as any)}>
                <SelectTrigger className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX" className="font-bold">📱 PIX — transferi para a conta da igreja</SelectItem>
                  <SelectItem value="CASH" className="font-bold">💵 Espécie — entreguei pessoalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                Ao confirmar, a tesoureira será notificada para validar o recebimento.
              </p>
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 flex flex-row gap-3">
            <Button variant="ghost" onClick={() => setSubmitModal(null)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] text-slate-400">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving}
              className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px]">
              {saving ? "Enviando..." : "Confirmar Repasse"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
