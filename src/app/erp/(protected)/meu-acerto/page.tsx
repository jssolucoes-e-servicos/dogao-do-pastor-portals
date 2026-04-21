'use client';

import {
  GeneratePixQrCodeAction,
  GetMyCashSettlementsAction,
  SubmitCashAction,
  SubmitPixIvcAction,
} from '@/actions/cash-settlement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, QrCode, Send, Banknote, RefreshCw, Copy, Check, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Payment = {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  receiptUrl?: string;
  submittedAt: string;
  confirmedAt?: string;
};

type Settlement = {
  id: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  edition?: { name: string; code: string };
  orders?: { id: string }[];
  payments?: Payment[];
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'Aguardando Confirmação',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
};
const PAYMENT_STATUS_COLOR: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-600',
};
const METHOD_LABEL: Record<string, string> = {
  PIX_QRCODE: 'PIX QR Code', PIX_IVC: 'PIX IVC', CASH: 'Tesouraria',
};

type ModalType = 'choose' | 'pix_qr' | 'pix_ivc' | 'cash_confirm' | null;

export default function MeuAcertoPage() {
  const [mounted, setMounted] = useState(false);
  const [modal, setModal] = useState<{ type: ModalType; settlement: Settlement } | null>(null);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [pixData, setPixData] = useState<{ qrCodeBase64?: string; pixCopyPaste?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const { data: res, mutate, isLoading } = useSWR(
    mounted ? 'my-settlements' : null,
    () => GetMyCashSettlementsAction(),
    { refreshInterval: 15000 },
  );

  const settlements: Settlement[] = res?.data ?? [];

  // Saldo total devedor (totalAmount - paidAmount de todos os settlements)
  const totalPending = settlements.reduce((a, s) => a + Math.max(0, s.totalAmount - s.paidAmount), 0);
  const totalConfirmed = settlements.reduce((a, s) => a + s.paidAmount, 0);

  const openModal = (settlement: Settlement) => {
    const balance = settlement.totalAmount - settlement.paidAmount;
    setAmount(balance.toFixed(2).replace('.', ','));
    setModal({ type: 'choose', settlement });
    setPixData(null);
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handlePixQrCode = async () => {
    if (!modal) return;
    const val = parseFloat(amount.replace(',', '.'));
    if (!val || val <= 0) { toast.error('Informe um valor válido'); return; }
    setSaving(true);
    const r = await GeneratePixQrCodeAction(modal.settlement.id, val);
    if (r.success && r.data) {
      setPixData({ qrCodeBase64: r.data.qrCodeBase64, pixCopyPaste: r.data.pixCopyPaste });
      setModal({ type: 'pix_qr', settlement: modal.settlement });
      mutate();
    } else toast.error(r.error ?? 'Erro ao gerar PIX');
    setSaving(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePixIvc = async () => {
    if (!modal) return;
    const val = parseFloat(amount.replace(',', '.'));
    if (!val || val <= 0) { toast.error('Informe um valor válido'); return; }
    setSaving(true);
    const formData = new FormData();
    formData.append('settlementId', modal.settlement.id);
    formData.append('amount', String(val));
    formData.append('receiptDate', new Date().toISOString());
    if (receiptFile) formData.append('receipt', receiptFile);
    const r = await SubmitPixIvcAction(formData);
    if (r.success) {
      toast.success('Comprovante enviado! Aguarde a confirmação da tesoureira.');
      setModal(null);
      mutate();
    } else toast.error(r.error ?? 'Erro');
    setSaving(false);
  };

  const handleCash = async () => {
    if (!modal) return;
    const val = parseFloat(amount.replace(',', '.'));
    if (!val || val <= 0) { toast.error('Informe um valor válido'); return; }
    setSaving(true);
    const r = await SubmitCashAction(modal.settlement.id, val);
    if (r.success) {
      toast.success('Repasse informado! Aguarde a confirmação da tesoureira.');
      setModal(null);
      mutate();
    } else toast.error(r.error ?? 'Erro');
    setSaving(false);
  };

  const handleCopy = () => {
    if (pixData?.pixCopyPaste) {
      navigator.clipboard.writeText(pixData.pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            Saldo de vendas em dinheiro
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-orange-600 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-100">Saldo a Repassar</p>
            <p className="text-3xl font-black text-white mt-1">
              {totalPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Confirmado</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">
              {totalConfirmed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de settlements */}
      {settlements.map((s) => {
        const balance = s.totalAmount - s.paidAmount;
        return (
          <div key={s.id} className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm">
            {/* Header do settlement */}
            <div className="p-6 pb-3 flex items-center justify-between">
              <div>
                <p className="font-black text-sm uppercase italic">{s.edition?.name ?? '—'}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  {s.orders?.length ?? 0} venda(s) · Total: {(s.totalAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · Pago: {(s.paidAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              {balance > 0.001 && (
                <Button size="sm" onClick={() => openModal(s)}
                  className="h-8 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[9px] tracking-widest gap-1.5">
                  <Send className="h-3 w-3" /> Repassar {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Button>
              )}
            </div>

            {/* Histórico de repasses */}
            {(s.payments ?? []).length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Forma</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</TableHead>
                    <TableHead className="pr-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(s.payments ?? []).map((p) => (
                    <TableRow key={p.id} className="border-slate-50 dark:border-slate-800">
                      <TableCell className="pl-6 py-3 text-[11px] font-bold text-slate-500">
                        {format(new Date(p.submittedAt), 'dd/MM HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-[11px] font-bold text-slate-500">
                        {METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}
                      </TableCell>
                      <TableCell className="text-right font-black text-sm text-slate-900 dark:text-white">
                        {p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell className="pr-6 text-center">
                        <Badge className={`${PAYMENT_STATUS_COLOR[p.status] ?? 'bg-slate-100 text-slate-500'} border-none text-[9px] font-black`}>
                          {PAYMENT_STATUS_LABEL[p.status] ?? p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        );
      })}

      {!isLoading && settlements.length === 0 && (
        <div className="text-center py-16">
          <p className="font-bold text-slate-400 uppercase text-xs tracking-widest italic">Nenhum acerto encontrado</p>
          <p className="text-[10px] text-slate-300 mt-2">Vendas em dinheiro pelo app aparecerão aqui</p>
        </div>
      )}

      {/* Modal escolha de método */}
      <Dialog open={modal?.type === 'choose'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black uppercase italic">
              Como vai <span className="text-emerald-600">repassar?</span>
            </DialogTitle>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Saldo: {((modal?.settlement?.totalAmount ?? 0) - (modal?.settlement?.paidAmount ?? 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </DialogHeader>
          <div className="px-8 pb-4 space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valor a repassar</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00"
              className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold text-lg text-center" />
          </div>
          <div className="px-8 pb-8 space-y-3">
            <Button onClick={handlePixQrCode} disabled={saving}
              className="w-full h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black uppercase text-[10px] tracking-widest gap-2">
              <QrCode className="h-4 w-4" /> PIX QR Code (Mercado Pago)
            </Button>
            <Button onClick={() => modal && setModal({ type: 'pix_ivc', settlement: modal.settlement })} variant="outline"
              className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 border-slate-200">
              <Send className="h-4 w-4" /> PIX para conta da IVC
            </Button>
            <Button onClick={() => modal && setModal({ type: 'cash_confirm', settlement: modal.settlement })} variant="outline"
              className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 border-slate-200">
              <Banknote className="h-4 w-4" /> Entregar na Tesouraria
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal PIX QR Code */}
      <Dialog open={modal?.type === 'pix_qr'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4 text-center">
            <DialogTitle className="text-xl font-black uppercase italic">
              <span className="text-violet-600">PIX QR Code</span>
            </DialogTitle>
          </DialogHeader>
          <div className="px-8 pb-8 flex flex-col items-center gap-4">
            {pixData?.qrCodeBase64 ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <Image src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code PIX" width={200} height={200} />
              </div>
            ) : (
              <div className="w-[200px] h-[200px] bg-white rounded-2xl flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
              </div>
            )}
            {pixData?.pixCopyPaste && (
              <button onClick={handleCopy} className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 text-left shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Copia e Cola</p>
                <p className="text-[10px] font-mono text-slate-600 break-all line-clamp-2">{pixData.pixCopyPaste}</p>
                <div className="flex items-center gap-1 mt-2 text-violet-600">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span className="text-[9px] font-black uppercase">{copied ? 'Copiado!' : 'Clique para copiar'}</span>
                </div>
              </button>
            )}
            <div className="flex items-center gap-2 text-slate-400">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span className="text-[10px] font-bold">Aguardando confirmação do pagamento...</span>
            </div>
            <Button variant="ghost" onClick={() => setModal(null)} className="w-full h-10 rounded-2xl font-black uppercase text-[10px] text-slate-400">Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal PIX IVC */}
      <Dialog open={modal?.type === 'pix_ivc'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black uppercase italic">PIX para <span className="text-blue-600">IVC</span></DialogTitle>
          </DialogHeader>
          <div className="px-8 pb-4 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Chave PIX da Igreja</p>
              <p className="font-black text-sm text-blue-800 dark:text-blue-300">igrejavivaemcelulas@gmail.com</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valor enviado</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00"
                className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold text-lg text-center" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comprovante</Label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              {receiptPreview ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <Image src={receiptPreview} alt="Comprovante" width={400} height={200} className="w-full h-32 object-cover" />
                  <button onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-2 hover:border-blue-400 transition-colors">
                  <Upload className="h-6 w-6 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Anexar comprovante</span>
                </button>
              )}
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 flex flex-row gap-3">
            <Button variant="ghost" onClick={() => modal && setModal({ type: 'choose', settlement: modal.settlement })}
              className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] text-slate-400">Voltar</Button>
            <Button onClick={handlePixIvc} disabled={saving}
              className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px]">
              {saving ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Espécie */}
      <Dialog open={modal?.type === 'cash_confirm'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black uppercase italic">Confirmar <span className="text-emerald-600">Repasse</span></DialogTitle>
          </DialogHeader>
          <div className="px-8 pb-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</span>
                <span className="font-black text-lg text-emerald-600">
                  {(parseFloat(amount.replace(',', '.')) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Forma</span>
                <span className="font-black text-sm">💵 Espécie</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-bold text-center">
              Ficará pendente até a tesoureira confirmar o recebimento.
            </p>
          </div>
          <DialogFooter className="p-8 pt-0 flex flex-row gap-3">
            <Button variant="ghost" onClick={() => modal && setModal({ type: 'choose', settlement: modal.settlement })}
              className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] text-slate-400">Voltar</Button>
            <Button onClick={handleCash} disabled={saving}
              className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px]">
              {saving ? 'Enviando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
