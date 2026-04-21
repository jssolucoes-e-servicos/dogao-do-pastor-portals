'use client';

import {
  ConfirmSettlementPaymentAction,
  GetAllSettlementsAction,
  GetPendingPaymentsAction,
  GetSettlementSummaryAction,
  RegisterDirectSettlementAction,
  SyncCashOrdersAction,
} from '@/actions/cash-settlement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, DollarSign, AlertCircle, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RequirePermission } from '@/components/erp/layout/require-permission';

type Settlement = {
  id: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  contributor?: { id: string; name: string; username: string; phone?: string };
  edition?: { name: string; code: string };
  orders?: { id: string }[];
  payments?: Payment[];
};

type Payment = {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  receiptUrl?: string;
  submittedAt: string;
  confirmedAt?: string;
  notes?: string;
};

type Summary = {
  totalDue: number;
  totalPaid: number;
  pending: number;
  submitted: number;
  confirmed: number;
};

const METHOD_LABEL: Record<string, string> = {
  PIX_IVC: 'PIX IVC', CASH: 'Espécie', PIX_QRCODE: 'PIX QR Code',
};

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ── Card de repasse aguardando confirmação ────────────────────────────────────
function PendingPaymentCard({ payment, onConfirm }: { payment: any; onConfirm: (p: any) => void }) {
  const s = payment.settlement;
  const balance = s.totalAmount - s.paidAmount;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 border-l-4 border-blue-500">
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm uppercase italic text-slate-900 dark:text-white truncate">
          {s.contributor?.name}
        </p>
        <p className="text-[10px] text-slate-400 font-bold">
          @{s.contributor?.username} · {s.edition?.name}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge className="bg-blue-100 text-blue-700 border-none text-[9px] font-black">
            {METHOD_LABEL[payment.paymentMethod] ?? payment.paymentMethod}
          </Badge>
          <span className="text-[10px] text-slate-400 font-bold">
            {format(new Date(payment.submittedAt), "dd/MM HH:mm", { locale: ptBR })}
          </span>
          {payment.receiptUrl && (
            <a href={payment.receiptUrl} target="_blank" rel="noreferrer"
              className="text-[9px] font-black text-blue-600 hover:underline flex items-center gap-0.5">
              <ExternalLink className="h-2.5 w-2.5" /> Comprovante
            </a>
          )}
        </div>
        <p className="text-[10px] text-slate-400 font-bold mt-1">
          Saldo devedor: {fmt(balance)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-black text-xl text-blue-600">{fmt(payment.amount)}</p>
        <Button size="sm" onClick={() => onConfirm(payment)}
          className="mt-2 h-8 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] tracking-widest gap-1">
          <CheckCircle2 className="h-3 w-3" /> Confirmar
        </Button>
      </div>
    </div>
  );
}

// ── Card de saldo pendente (sem repasse ainda) ────────────────────────────────
function PendingBalanceCard({ s, onRegister }: { s: Settlement; onRegister: (s: Settlement) => void }) {
  const balance = s.totalAmount - s.paidAmount;
  if (balance <= 0.001) return null;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm uppercase italic text-slate-900 dark:text-white truncate">
          {s.contributor?.name}
        </p>
        <p className="text-[10px] text-slate-400 font-bold">
          @{s.contributor?.username} · {s.edition?.name}
        </p>
        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
          {s.orders?.length ?? 0} venda(s) · Total: {fmt(s.totalAmount)} · Pago: {fmt(s.paidAmount)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-black text-xl text-orange-500">{fmt(balance)}</p>
        <Button size="sm" onClick={() => onRegister(s)}
          className="mt-2 h-8 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[9px] tracking-widest">
          Registrar Pagamento
        </Button>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
function AcertosFinanceiroPage() {
  const [mounted, setMounted] = useState(false);
  const [registerModal, setRegisterModal] = useState<Settlement | null>(null);
  const [confirmModal, setConfirmModal] = useState<any>(null);
  const [regAmount, setRegAmount] = useState('');
  const [regMethod, setRegMethod] = useState<'CASH' | 'PIX_IVC'>('CASH');
  const [regNotes, setRegNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { data: settlementsRes, mutate: mutateSettlements } = useSWR(
    mounted ? 'settlements-all' : null,
    () => GetAllSettlementsAction(),
    { refreshInterval: 20000 },
  );
  const { data: pendingPaymentsRes, mutate: mutatePending } = useSWR(
    mounted ? 'pending-payments' : null,
    () => GetPendingPaymentsAction(),
    { refreshInterval: 15000 },
  );
  const { data: summaryRes, mutate: mutateSummary } = useSWR(
    mounted ? 'settlement-summary' : null,
    () => GetSettlementSummaryAction(),
    { refreshInterval: 20000 },
  );

  const settlements: Settlement[] = settlementsRes?.data ?? [];
  const pendingPayments: any[] = pendingPaymentsRes?.data ?? [];
  const summary: Summary | null = summaryRes?.data ?? null;

  // Settlements com saldo devedor (sem repasse pendente)
  const pendingBalances = settlements.filter(s => {
    const balance = s.totalAmount - s.paidAmount;
    const hasPendingPayment = pendingPayments.some(p => p.settlement?.id === s.id);
    return balance > 0.001 && !hasPendingPayment;
  });

  const mutateAll = () => { mutateSettlements(); mutatePending(); mutateSummary(); };

  const openRegister = (s: Settlement) => {
    const balance = s.totalAmount - s.paidAmount;
    setRegAmount(balance.toFixed(2).replace('.', ','));
    setRegMethod('CASH');
    setRegNotes('');
    setRegisterModal(s);
  };

  const handleRegister = async () => {
    if (!registerModal) return;
    const val = parseFloat(regAmount.replace(',', '.'));
    if (!val || val <= 0) { toast.error('Informe um valor válido'); return; }
    setSaving(true);
    const r = await RegisterDirectSettlementAction({
      contributorId: registerModal.contributor!.id,
      amount: val,
      paymentMethod: regMethod,
      notes: regNotes || undefined,
    });
    if (r.success) {
      toast.success('Pagamento registrado');
      setRegisterModal(null);
      mutateAll();
    } else toast.error(r.error ?? 'Erro');
    setSaving(false);
  };

  const handleConfirm = async () => {
    if (!confirmModal) return;
    setSaving(true);
    const r = await ConfirmSettlementPaymentAction(confirmModal.id);
    if (r.success) {
      toast.success(`Repasse de ${confirmModal.settlement?.contributor?.name} confirmado`);
      setConfirmModal(null);
      mutateAll();
    } else toast.error(r.error ?? 'Erro');
    setSaving(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    const r = await SyncCashOrdersAction();
    if (r.success) {
      toast.success(`Sincronizado: ${r.data?.synced ?? 0} venda(s) adicionada(s)`);
      mutateAll();
    } else toast.error(r.error ?? 'Erro');
    setSyncing(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-600/20">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Acertos <span className="text-emerald-600">Financeiros</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Repasses de vendas em dinheiro
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleSync} disabled={syncing}
          className="h-10 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 border-slate-200">
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar Vendas'}
        </Button>
      </div>

      {/* Resumo */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Devido', value: summary.totalDue, color: 'text-slate-700 dark:text-white' },
            { label: 'A Repassar', value: summary.pending, color: 'text-orange-500' },
            { label: 'Aguardando', value: summary.submitted, color: 'text-blue-600' },
            { label: 'Confirmados', value: summary.confirmed, color: 'text-emerald-600' },
          ].map((item) => (
            <Card key={item.label} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
              <CardContent className="p-5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                <p className={`text-xl font-black mt-1 ${item.color}`}>{fmt(item.value ?? 0)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Repasses aguardando confirmação */}
      {pendingPayments.length > 0 && (
        <Card className="border-none shadow-sm bg-blue-50 dark:bg-blue-950/20 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Clock className="h-4 w-4" /> Aguardando Confirmação ({pendingPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            {pendingPayments.map((p) => (
              <PendingPaymentCard key={p.id} payment={p} onConfirm={setConfirmModal} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Saldo pendente (sem repasse) */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" /> Saldo Pendente ({pendingBalances.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-3">
          {pendingBalances.length === 0 ? (
            <p className="text-center text-slate-400 text-xs italic font-bold py-8">Nenhum saldo pendente</p>
          ) : pendingBalances.map((s) => (
            <PendingBalanceCard key={s.id} s={s} onRegister={openRegister} />
          ))}
        </CardContent>
      </Card>

      {/* Modal registrar pagamento direto */}
      <Dialog open={!!registerModal} onOpenChange={(v) => !v && setRegisterModal(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black uppercase italic">
              Registrar <span className="text-emerald-600">Pagamento</span>
            </DialogTitle>
            {registerModal && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                {registerModal.contributor?.name} · Saldo: {fmt(registerModal.totalAmount - registerModal.paidAmount)}
              </p>
            )}
          </DialogHeader>
          <div className="px-8 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valor Recebido</Label>
              <Input value={regAmount} onChange={(e) => setRegAmount(e.target.value)}
                className="h-14 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-black text-xl text-center" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Forma</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'CASH' as const, label: '💵 Espécie' },
                  { value: 'PIX_IVC' as const, label: '📱 PIX IVC' },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => setRegMethod(opt.value)}
                    className={`p-3 rounded-2xl text-left transition-all border-2 ${regMethod === opt.value ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                    <p className="font-black text-sm">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Observação</Label>
              <Input value={regNotes} onChange={(e) => setRegNotes(e.target.value)}
                placeholder="Opcional" className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold" />
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 flex flex-row gap-3">
            <Button variant="ghost" onClick={() => setRegisterModal(null)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] text-slate-400">Cancelar</Button>
            <Button onClick={handleRegister} disabled={saving}
              className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px]">
              {saving ? 'Registrando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmar repasse */}
      <Dialog open={!!confirmModal} onOpenChange={(v) => !v && setConfirmModal(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black uppercase italic flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Confirmar <span className="text-emerald-600">Recebimento</span>
            </DialogTitle>
          </DialogHeader>
          {confirmModal && (
            <div className="px-8 pb-4 space-y-3">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vendedor</span>
                  <span className="font-black text-sm">{confirmModal.settlement?.contributor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</span>
                  <span className="font-black text-xl text-emerald-600">{fmt(confirmModal.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Forma</span>
                  <span className="font-black text-sm">{METHOD_LABEL[confirmModal.paymentMethod] ?? confirmModal.paymentMethod}</span>
                </div>
                {confirmModal.notes && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-600">{confirmModal.notes}</p>
                  </div>
                )}
                {confirmModal.receiptUrl && (
                  <a href={confirmModal.receiptUrl} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-1 text-[10px] font-black text-blue-600 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800">
                    <ExternalLink className="h-3 w-3" /> Ver Comprovante
                  </a>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-bold text-center">
                Confirme que o valor foi recebido. Esta ação não pode ser desfeita.
              </p>
            </div>
          )}
          <DialogFooter className="p-8 pt-0 flex flex-row gap-3">
            <Button variant="ghost" onClick={() => setConfirmModal(null)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] text-slate-400">Cancelar</Button>
            <Button onClick={handleConfirm} disabled={saving}
              className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] gap-2">
              <CheckCircle2 className="h-4 w-4" /> {saving ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AcertosFinanceiroPageProtected() {
  return (
    <RequirePermission slug="erp.finance">
      <AcertosFinanceiroPage />
    </RequirePermission>
  );
}
