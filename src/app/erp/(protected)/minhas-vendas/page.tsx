'use client';

import { OrdersPaginateAction } from "@/actions/orders/paginate.action";
import { fetchApi, FetchCtx } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingBag, Search, ChevronLeft, ChevronRight, Eye, FileText, Edit2, Send, Download } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from 'swr';
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

type FilterTab = 'all' | 'paid' | 'pending' | 'abandoned';
type OriginFilter = 'all' | 'SITE' | 'APP' | 'PDV' | 'MANUAL';

const statusLabel: Record<string, string> = {
  DIGITATION: 'Digitação', PENDING_PAYMENT: 'Aguardando', PAID: 'Pago',
  CANCELLED: 'Cancelado', REJECTED: 'Rejeitado', DELIVERED: 'Entregue',
};
const statusColor: Record<string, string> = {
  DIGITATION: 'bg-slate-100 text-slate-600', PENDING_PAYMENT: 'bg-orange-100 text-orange-700',
  PAID: 'bg-emerald-100 text-emerald-700', CANCELLED: 'bg-red-100 text-red-600',
  REJECTED: 'bg-red-100 text-red-600', DELIVERED: 'bg-blue-100 text-blue-700',
};
const deliveryLabel: Record<string, string> = {
  PICKUP: 'Retirada', DELIVERY: 'Entrega', DONATE: 'Doação', UNDEFINED: '—', SCHEDULED: 'Agendado',
};
const paymentLabel: Record<string, string> = {
  PIX: 'PIX', CARD_CREDIT: 'Cartão de Crédito', CARD_DEBIT: 'Cartão de Débito',
  MONEY: 'Dinheiro', POS: 'Maquininha', UNDEFINED: '—',
};
const originLabel: Record<string, string> = { SITE: 'Site', APP: 'App', PDV: 'PDV', MANUAL: 'Manual' };

const THREE_DAYS_AGO = subDays(new Date(), 3);
function isAbandoned(o: any) { return o.paymentStatus === 'PENDING' && new Date(o.createdAt) < THREE_DAYS_AGO; }

function groupItems(items: any[]) {
  const map: Record<string, number> = {};
  for (const item of items ?? []) {
    const key = (item.removedIngredients ?? []).length > 0 ? `Sem ${item.removedIngredients.join(', ')}` : 'Dogão Completo';
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map).map(([name, qty]) => ({ name, qty }));
}

export default function MinhasVendasPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<FilterTab>('all');
  const [origin, setOrigin] = useState<OriginFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [receiptModal, setReceiptModal] = useState(false);
  const [modifyModal, setModifyModal] = useState(false);
  const [modifyStep, setModifyStep] = useState<'menu'|'type'|'schedule'>('menu');
  const [newDelivery, setNewDelivery] = useState('');
  const [newTime, setNewTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setPage(1); }, [search, tab, origin]);

  const { data: res, isLoading, mutate } = useSWR(
    mounted ? ["my-sales", page, search] : null,
    () => OrdersPaginateAction(page, search),
    { keepPreviousData: true }
  );

  const allOrders = res?.data?.data || [];
  const meta = res?.data?.meta;
  const totalPages = meta?.totalPages || 1;

  const filtered = allOrders.filter((o: any) => {
    if (origin !== 'all' && o.origin !== origin) return false;
    if (tab === 'paid') return o.paymentStatus === 'PAID';
    if (tab === 'pending') return o.paymentStatus === 'PENDING' && !isAbandoned(o);
    if (tab === 'abandoned') return isAbandoned(o);
    return true;
  });

  const dogs = allOrders.filter((o: any) => o.paymentStatus === 'PAID').reduce((a: number, o: any) => a + (o.items?.length || 0), 0);
  const pending = allOrders.filter((o: any) => o.paymentStatus === 'PENDING' && !isAbandoned(o)).length;
  const abandoned = allOrders.filter(isAbandoned).length;

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

  async function sendReceipt() {
    if (!selectedOrder) return;
    setSending(true);
    try {
      await fetchApi(FetchCtx.ERP, `/orders/${selectedOrder.id}/send-receipt`, { method: 'POST' });
      toast.success('Comprovante enviado por WhatsApp!');
      setReceiptModal(false);
    } catch (e: any) { toast.error(e.message); }
    setSending(false);
  }

  async function saveDeliveryType() {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      if (newDelivery === 'PICKUP') {
        await fetchApi(FetchCtx.ERP, '/orders/set-pickup', { method: 'POST', body: JSON.stringify({ orderId: selectedOrder.id }) });
      } else if (newDelivery === 'DELIVERY') {
        await fetchApi(FetchCtx.ERP, '/orders/set-delivery', { method: 'POST', body: JSON.stringify({ orderId: selectedOrder.id, scheduledTime: newTime || undefined }) });
      } else if (newDelivery === 'DONATE') {
        await fetchApi(FetchCtx.ERP, '/orders/set-donation', { method: 'POST', body: JSON.stringify({ orderId: selectedOrder.id, partnerId: 'IVC_INTERNAL' }) });
      }
      toast.success('Pedido atualizado!');
      setModifyModal(false);
      mutate();
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  }

  const TABS: { key: FilterTab; label: string; color: string }[] = [
    { key: 'all', label: 'Todos', color: 'bg-slate-900 text-white' },
    { key: 'paid', label: 'Pagos', color: 'bg-emerald-500 text-white' },
    { key: 'pending', label: 'Pendentes', color: 'bg-orange-500 text-white' },
    { key: 'abandoned', label: 'Abandonados', color: 'bg-red-500 text-white' },
  ];
  const ORIGINS: { key: OriginFilter; label: string }[] = [
    { key: 'all', label: 'Todos' }, { key: 'SITE', label: 'Site' },
    { key: 'APP', label: 'App' }, { key: 'PDV', label: 'PDV' }, { key: 'MANUAL', label: 'Manual' },
  ];

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="bg-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-600/20">
          <ShoppingBag className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Minhas <span className="text-orange-600">Vendas</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
            Pedidos vinculados ao seu usuário
          </p>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-orange-600 rounded-2xl cursor-pointer" onClick={() => setTab('paid')}>
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-100">Dogs Vendidos</p>
            <p className="text-3xl font-black text-white mt-1">{dogs}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl cursor-pointer" onClick={() => setTab('pending')}>
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendentes</p>
            <p className="text-3xl font-black text-orange-500 mt-1">{pending}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl cursor-pointer" onClick={() => setTab('abandoned')}>
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Abandonados</p>
            <p className="text-3xl font-black text-red-500 mt-1">{abandoned}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 h-8 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${tab === t.key ? t.color : 'text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          {ORIGINS.map((o) => (
            <button key={o.key} onClick={() => setOrigin(o.key)}
              className={`px-3 h-8 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${origin === o.key ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-10 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-xs" />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Origem</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Dogs</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data</TableHead>
              <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{[1,2,3,4,5,6,7,8].map((j) => <TableCell key={j}><div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" /></TableCell>)}</TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="h-48 text-center"><p className="font-bold text-slate-400 uppercase text-xs tracking-widest italic">Nenhuma venda encontrada</p></TableCell></TableRow>
            ) : filtered.map((o: any) => (
              <TableRow key={o.id} className={`border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50 ${isAbandoned(o) ? 'opacity-60' : ''}`}>
                <TableCell className="pl-8 py-4">
                  <p className="font-black text-xs uppercase italic text-slate-900 dark:text-white">{o.customerName}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{o.customerPhone}</p>
                </TableCell>
                <TableCell><Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none text-[8px] font-black">{originLabel[o.origin] || o.origin}</Badge></TableCell>
                <TableCell className="text-[11px] font-bold text-slate-500">{deliveryLabel[o.deliveryOption] || o.deliveryOption}</TableCell>
                <TableCell className="text-center font-black text-sm text-orange-600">{o.items?.length || 0}</TableCell>
                <TableCell className="text-right font-black text-sm text-slate-900 dark:text-white">{(o.totalValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`${isAbandoned(o) ? 'bg-red-100 text-red-600' : statusColor[o.status] || 'bg-slate-100 text-slate-500'} border-none text-[9px] font-black px-2`}>
                    {isAbandoned(o) ? 'Abandonado' : statusLabel[o.status] || o.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[10px] font-bold text-slate-400">{o.createdAt ? format(new Date(o.createdAt), "dd/MM/yy HH:mm", { locale: ptBR }) : "—"}</TableCell>
                <TableCell className="pr-8">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(o)}
                    className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Página {page} de {totalPages} • {meta?.total || 0} pedidos</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Detalhes ── */}
      <Dialog open={!!selectedOrder && !receiptModal && !modifyModal} onOpenChange={(v) => !v && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-lg font-black uppercase italic flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-orange-600" />
              {selectedOrder?.customerName}
            </DialogTitle>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              {selectedOrder?.customerPhone} · {selectedOrder?.createdAt ? format(new Date(selectedOrder.createdAt), "dd/MM/yy HH:mm", { locale: ptBR }) : ''}
            </p>
          </DialogHeader>
          {selectedOrder && (
            <div className="p-8 space-y-4">
              {/* Status */}
              <div className="flex justify-center">
                <Badge className={`${isAbandoned(selectedOrder) ? 'bg-red-100 text-red-600' : statusColor[selectedOrder.status] || 'bg-slate-100 text-slate-500'} border-none text-[10px] font-black px-4 py-1.5`}>
                  {isAbandoned(selectedOrder) ? 'Abandonado' : statusLabel[selectedOrder.status] || selectedOrder.status}
                </Badge>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Nº Pedido", value: `#${selectedOrder.id.slice(-8).toUpperCase()}` },
                  { label: "Tipo", value: deliveryLabel[selectedOrder.deliveryOption] || selectedOrder.deliveryOption },
                  { label: "Pagamento", value: paymentLabel[selectedOrder.paymentType] || selectedOrder.paymentType },
                  { label: "Origem", value: originLabel[selectedOrder.origin] || selectedOrder.origin },
                  { label: "Dogs", value: String(selectedOrder.items?.length || 0) },
                  { label: "Valor", value: (selectedOrder.totalValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="font-black text-sm text-slate-900 dark:text-white mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Itens */}
              {(selectedOrder.items?.length > 0) && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Itens</p>
                  {groupItems(selectedOrder.items).map(({ name, qty }) => (
                    <div key={name} className="flex justify-between">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{qty}x {name}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedOrder.observations && (
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-1">Observações</p>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">{selectedOrder.observations}</p>
                </div>
              )}

              {/* Ações */}
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => setReceiptModal(true)}
                  className="h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] gap-2">
                  <FileText className="h-4 w-4" /> Comprovante
                </Button>
                <Button variant="outline" onClick={() => { setModifyStep('menu'); setNewDelivery(selectedOrder.deliveryOption); setNewTime(selectedOrder.deliveryTime ?? ''); setModifyModal(true); }}
                  className="h-12 rounded-2xl font-black uppercase text-[10px] gap-2 border-slate-200">
                  <Edit2 className="h-4 w-4" /> Modificar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal Comprovante ── */}
      <Dialog open={receiptModal} onOpenChange={(v) => !v && setReceiptModal(false)}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black uppercase italic">Comprovante</DialogTitle>
          </DialogHeader>
          <div className="px-8 pb-8 space-y-3">
            <Button onClick={sendReceipt} disabled={sending}
              className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] gap-2">
              <Send className="h-4 w-4" /> {sending ? 'Enviando...' : 'Enviar 2ª via ao Cliente (WhatsApp)'}
            </Button>
            <a href={`${apiBase}/orders/${selectedOrder?.id}/receipt.pdf`} target="_blank" rel="noreferrer">
              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] gap-2 border-slate-200">
                <Download className="h-4 w-4" /> Baixar PDF para eu enviar
              </Button>
            </a>
            <Button variant="ghost" onClick={() => setReceiptModal(false)} className="w-full h-10 rounded-2xl font-black uppercase text-[10px] text-slate-400">Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal Modificar ── */}
      <Dialog open={modifyModal} onOpenChange={(v) => !v && setModifyModal(false)}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black uppercase italic">Modificar Pedido</DialogTitle>
          </DialogHeader>

          {modifyStep === 'menu' && (
            <div className="px-8 pb-8 space-y-3">
              <Button onClick={() => setModifyStep('type')}
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px]">
                🚚 Alterar Tipo de Pedido
              </Button>
              {selectedOrder?.deliveryOption === 'DELIVERY' && (
                <Button onClick={() => setModifyStep('schedule')} variant="outline"
                  className="w-full h-14 rounded-2xl font-black uppercase text-[10px] border-slate-200">
                  🕐 Mudar Horário da Entrega
                </Button>
              )}
              <Button variant="ghost" onClick={() => setModifyModal(false)} className="w-full h-10 rounded-2xl font-black uppercase text-[10px] text-slate-400">Cancelar</Button>
            </div>
          )}

          {modifyStep === 'type' && (
            <div className="px-8 pb-8 space-y-3">
              {(['PICKUP','DELIVERY','DONATE'] as const).map(opt => (
                <button key={opt} onClick={() => setNewDelivery(opt)}
                  className={`w-full p-4 rounded-2xl text-left border-2 transition-all ${newDelivery === opt ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                  <p className="font-black text-sm">{opt === 'PICKUP' ? '🏪 Retirada no Local' : opt === 'DELIVERY' ? '🛵 Entrega' : '🤝 Doação'}</p>
                </button>
              ))}
              {newDelivery === 'DELIVERY' && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Horário (opcional)</Label>
                  <Input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="Ex: 19:00"
                    className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold" />
                </div>
              )}
              <DialogFooter className="flex flex-row gap-3 pt-2">
                <Button variant="ghost" onClick={() => setModifyStep('menu')} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] text-slate-400">Voltar</Button>
                <Button onClick={saveDeliveryType} disabled={saving} className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px]">
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </div>
          )}

          {modifyStep === 'schedule' && (
            <div className="px-8 pb-8 space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Horário Agendado</Label>
                <Input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="Ex: 19:00"
                  className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold" />
              </div>
              <DialogFooter className="flex flex-row gap-3">
                <Button variant="ghost" onClick={() => setModifyStep('menu')} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] text-slate-400">Voltar</Button>
                <Button onClick={saveDeliveryType} disabled={saving} className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px]">
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

