'use client';

import {
  CreatePurchaseOrderAction, GetConsumptionReportAction,
  GetPurchaseOrdersAction, MarkPurchaseDeliveredAction
} from "@/actions/purchasing";
import { GetStockProductsAction } from "@/actions/stock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderItem { productId: string; productName: string; quantity: string; unitPrice: string; }

export default function ComprasPage() {
  const [mounted, setMounted] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ supplierName: '', notes: '', orderedAt: '' });
  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItem, setNewItem] = useState({ productId: '', quantity: '', unitPrice: '' });

  useEffect(() => { setMounted(true); }, []);

  const { data: ordersRes, mutate } = useSWR(mounted ? 'purchase-orders' : null, () => GetPurchaseOrdersAction());
  const { data: reportRes } = useSWR(mounted ? 'consumption-report' : null, () => GetConsumptionReportAction());
  const { data: productsRes } = useSWR(mounted ? 'stock-products-purchasing' : null, () => GetStockProductsAction());

  const orders = ordersRes?.data || [];
  const report = reportRes?.data || [];
  const products = productsRes?.data || [];

  const totalSpent = orders.reduce((a: number, o: any) => a + (o.totalValue || 0), 0);
  const pending = orders.filter((o: any) => !o.deliveredAt).length;

  const addItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.unitPrice) return toast.error("Preencha produto, quantidade e preço");
    const product = products.find((p: any) => p.id === newItem.productId);
    setItems([...items, { ...newItem, productName: product?.name || '' }]);
    setNewItem({ productId: '', quantity: '', unitPrice: '' });
  };

  const handleCreate = async () => {
    if (items.length === 0) return toast.error("Adicione pelo menos um item");
    setSaving(true);
    const r = await CreatePurchaseOrderAction({
      supplierName: form.supplierName || undefined,
      notes: form.notes || undefined,
      orderedAt: form.orderedAt || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: parseFloat(i.quantity),
        unitPrice: parseFloat(i.unitPrice),
      })),
    });
    if (r.success) {
      toast.success("Pedido de compra criado");
      setOrderOpen(false);
      setForm({ supplierName: '', notes: '', orderedAt: '' });
      setItems([]);
      mutate();
    } else toast.error(r.error || "Erro");
    setSaving(false);
  };

  const handleDeliver = async (id: string) => {
    const r = await MarkPurchaseDeliveredAction(id);
    if (r.success) { toast.success("Marcado como entregue"); mutate(); }
    else toast.error(r.error || "Erro");
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-violet-600 p-3 rounded-2xl shadow-lg shadow-violet-600/20">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Compras
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Pedidos de compra e análise de consumo
            </p>
          </div>
        </div>
        <Button onClick={() => setOrderOpen(true)}
          className="h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black uppercase text-[10px] tracking-widest gap-2">
          <Plus className="h-3.5 w-3.5" /> Novo Pedido
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-violet-600 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-100">Total Gasto</p>
            <p className="text-2xl font-black text-white mt-1">
              {totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pedidos</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aguardando Entrega</p>
            <p className="text-3xl font-black text-orange-500 mt-1">{pending}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 h-auto">
          <TabsTrigger value="orders" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">Pedidos</TabsTrigger>
          <TabsTrigger value="report" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">Análise de Consumo</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Fornecedor</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Edição</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Itens</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Total</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                  <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-slate-400 text-xs italic font-bold">Nenhum pedido de compra</TableCell></TableRow>
                ) : orders.map((o: any) => (
                  <TableRow key={o.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                    <TableCell className="pl-8 py-4 font-black text-xs uppercase italic text-slate-900 dark:text-white">
                      {o.supplierName || "—"}
                      {o.notes && <p className="text-[10px] text-slate-400 font-bold normal-case not-italic">{o.notes}</p>}
                    </TableCell>
                    <TableCell className="text-[11px] font-bold text-slate-500">{o.edition?.name || "—"}</TableCell>
                    <TableCell className="text-center font-black text-sm text-violet-600">{o.items?.length || 0}</TableCell>
                    <TableCell className="text-right font-black text-sm text-slate-900 dark:text-white">
                      {(o.totalValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-center">
                      {o.deliveredAt ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-black">Entregue</Badge>
                      ) : (
                        <Button size="sm" onClick={() => handleDeliver(o.id)}
                          className="h-7 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[8px] tracking-widest gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Confirmar
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="pr-8 text-[10px] font-bold text-slate-400">
                      {o.orderedAt ? format(new Date(o.orderedAt), "dd/MM/yy", { locale: ptBR }) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="report" className="mt-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Produto</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Comprado</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Usado</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Sobra</TableHead>
                  <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Custo Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400 text-xs italic font-bold">Nenhum dado de consumo</TableCell></TableRow>
                ) : report.map((r: any) => (
                  <TableRow key={r.product?.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                    <TableCell className="pl-8 py-4 font-black text-xs uppercase italic text-slate-900 dark:text-white">
                      {r.product?.name} <span className="text-slate-400 font-bold normal-case not-italic">({r.product?.unit})</span>
                    </TableCell>
                    <TableCell className="text-center font-black text-sm text-emerald-600">{r.purchased?.toFixed(1)}</TableCell>
                    <TableCell className="text-center font-black text-sm text-orange-500">{r.used?.toFixed(1)}</TableCell>
                    <TableCell className="text-center">
                      <span className={`font-black text-sm ${r.surplus > 0 ? 'text-blue-600' : r.surplus < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        {r.surplus?.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="pr-8 text-right font-black text-sm text-slate-700 dark:text-slate-300">
                      {(r.totalCost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Novo Pedido */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl font-black uppercase italic">Novo <span className="text-violet-600">Pedido de Compra</span></DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fornecedor</Label>
                <Input value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                  placeholder="Nome do fornecedor" className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data do Pedido</Label>
                <Input type="date" value={form.orderedAt} onChange={(e) => setForm({ ...form, orderedAt: e.target.value })}
                  className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Observações</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex: Compra para 2 edições" className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold" />
            </div>

            {/* Adicionar item */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adicionar Item</p>
              <div className="grid grid-cols-3 gap-3">
                <Select value={newItem.productId} onValueChange={(v) => setNewItem({ ...newItem, productId: v })}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs">
                    <SelectValue placeholder="Produto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p: any) => <SelectItem key={p.id} value={p.id} className="font-bold text-xs">{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  placeholder="Qtd" className="h-10 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs" />
                <div className="flex gap-2">
                  <Input type="number" value={newItem.unitPrice} onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                    placeholder="R$ unit." className="h-10 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs flex-1" />
                  <Button size="icon" onClick={addItem} className="h-10 w-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de itens */}
            {items.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Itens do Pedido</p>
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl px-4 py-3">
                    <div>
                      <p className="font-black text-xs uppercase italic text-slate-900 dark:text-white">{item.productName}</p>
                      <p className="text-[10px] font-bold text-slate-400">
                        {item.quantity} × {parseFloat(item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} =
                        {' '}{(parseFloat(item.quantity) * parseFloat(item.unitPrice)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}
                      className="h-8 w-8 rounded-xl hover:bg-red-50 text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <div className="text-right font-black text-sm text-violet-600 pr-2">
                  Total: {items.reduce((a, i) => a + parseFloat(i.quantity) * parseFloat(i.unitPrice), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="p-8 pt-0 flex flex-row gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setOrderOpen(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] text-slate-400">Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving || items.length === 0}
              className="flex-1 h-12 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black uppercase text-[10px]">
              {saving ? "Criando..." : "Criar Pedido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
