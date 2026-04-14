'use client';

import {
  AddStockMovementAction, GetStockBalanceAction,
  GetStockMovementsAction, GetStockProductsAction,
  CreateStockProductAction
} from "@/actions/stock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Archive, Plus, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const MOVEMENT_TYPES = [
  { value: 'PRODUCTION_OUT', label: 'Saída — Produção' },
  { value: 'SURPLUS_DONATE', label: 'Sobra — Doação para células' },
  { value: 'SURPLUS_SELL',   label: 'Sobra — Venda' },
  { value: 'SURPLUS_DISCARD',label: 'Sobra — Descarte' },
  { value: 'ADJUSTMENT',     label: 'Ajuste manual' },
];

const movTypeLabel: Record<string, string> = {
  PURCHASE_IN:     'Entrada (Compra)',
  PRODUCTION_OUT:  'Saída (Produção)',
  SURPLUS_DONATE:  'Doação',
  SURPLUS_SELL:    'Venda de Sobra',
  SURPLUS_DISCARD: 'Descarte',
  ADJUSTMENT:      'Ajuste',
};
const movTypeColor: Record<string, string> = {
  PURCHASE_IN:     'bg-emerald-100 text-emerald-700',
  PRODUCTION_OUT:  'bg-orange-100 text-orange-700',
  SURPLUS_DONATE:  'bg-blue-100 text-blue-700',
  SURPLUS_SELL:    'bg-violet-100 text-violet-700',
  SURPLUS_DISCARD: 'bg-red-100 text-red-600',
  ADJUSTMENT:      'bg-slate-100 text-slate-600',
};

export default function EstoquePage() {
  const [mounted, setMounted] = useState(false);
  const [movOpen, setMovOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [movForm, setMovForm] = useState({ productId: '', type: 'PRODUCTION_OUT', quantity: '', notes: '' });
  const [productForm, setProductForm] = useState({ name: '', unit: 'unidade', description: '' });

  useEffect(() => { setMounted(true); }, []);

  const { data: balanceRes, mutate: mutateBalance } = useSWR(mounted ? 'stock-balance' : null, () => GetStockBalanceAction());
  const { data: movRes, mutate: mutateMov } = useSWR(mounted ? 'stock-movements' : null, () => GetStockMovementsAction());
  const { data: productsRes, mutate: mutateProducts } = useSWR(mounted ? 'stock-products' : null, () => GetStockProductsAction());

  const balance = balanceRes?.data || [];
  const movements = movRes?.data || [];
  const products = productsRes?.data || [];

  const totalIn = balance.reduce((a: number, b: any) => a + b.in, 0);
  const totalOut = balance.reduce((a: number, b: any) => a + b.out, 0);

  const handleAddMovement = async () => {
    if (!movForm.productId || !movForm.quantity) return toast.error("Preencha produto e quantidade");
    setSaving(true);
    const r = await AddStockMovementAction({
      productId: movForm.productId,
      type: movForm.type,
      quantity: parseFloat(movForm.quantity),
      notes: movForm.notes || undefined,
    });
    if (r.success) {
      toast.success("Movimentação registrada");
      setMovOpen(false);
      setMovForm({ productId: '', type: 'PRODUCTION_OUT', quantity: '', notes: '' });
      mutateBalance(); mutateMov();
    } else toast.error(r.error || "Erro");
    setSaving(false);
  };

  const handleCreateProduct = async () => {
    if (!productForm.name || !productForm.unit) return toast.error("Nome e unidade são obrigatórios");
    setSaving(true);
    const r = await CreateStockProductAction(productForm);
    if (r.success) {
      toast.success("Produto criado");
      setProductOpen(false);
      setProductForm({ name: '', unit: 'unidade', description: '' });
      mutateProducts();
    } else toast.error(r.error || "Erro");
    setSaving(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-600/20">
            <Archive className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Estoque
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Controle de insumos e movimentações
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setProductOpen(true)}
            className="h-10 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 border-slate-200">
            <Plus className="h-3.5 w-3.5" /> Produto
          </Button>
          <Button onClick={() => setMovOpen(true)}
            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest gap-2">
            <TrendingDown className="h-3.5 w-3.5" /> Registrar Movimentação
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-emerald-600 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Total Entradas</p>
            <p className="text-3xl font-black text-white mt-1">{totalIn.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Saídas</p>
            <p className="text-3xl font-black text-orange-500 mt-1">{totalOut.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Produtos</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{products.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="balance">
        <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 h-auto">
          <TabsTrigger value="balance" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">Saldo Atual</TabsTrigger>
          <TabsTrigger value="movements" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">Movimentações</TabsTrigger>
          <TabsTrigger value="products" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="mt-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Produto</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unidade</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Entradas</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Saídas</TableHead>
                  <TableHead className="pr-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balance.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400 text-xs italic font-bold">Nenhuma movimentação registrada</TableCell></TableRow>
                ) : balance.map((b: any) => (
                  <TableRow key={b.product.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                    <TableCell className="pl-8 py-4 font-black text-xs uppercase italic text-slate-900 dark:text-white">{b.product.name}</TableCell>
                    <TableCell className="text-[11px] font-bold text-slate-500">{b.product.unit}</TableCell>
                    <TableCell className="text-center font-black text-sm text-emerald-600">{b.in.toFixed(1)}</TableCell>
                    <TableCell className="text-center font-black text-sm text-orange-500">{b.out.toFixed(1)}</TableCell>
                    <TableCell className="pr-8 text-center">
                      <span className={`font-black text-sm ${b.balance > 0 ? 'text-emerald-600' : b.balance < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        {b.balance.toFixed(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="movements" className="mt-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Produto</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Qtd</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Obs</TableHead>
                  <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400 text-xs italic font-bold">Nenhuma movimentação</TableCell></TableRow>
                ) : movements.map((m: any) => (
                  <TableRow key={m.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                    <TableCell className="pl-8 py-3 font-black text-xs uppercase italic text-slate-900 dark:text-white">{m.product?.name}</TableCell>
                    <TableCell>
                      <Badge className={`${movTypeColor[m.type] || 'bg-slate-100 text-slate-500'} border-none text-[9px] font-black`}>
                        {movTypeLabel[m.type] || m.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-black text-sm text-slate-700 dark:text-slate-300">{m.quantity}</TableCell>
                    <TableCell className="text-[11px] font-bold text-slate-500 max-w-[200px] truncate">{m.notes || "—"}</TableCell>
                    <TableCell className="pr-8 text-[10px] font-bold text-slate-400">
                      {m.createdAt ? format(new Date(m.createdAt), "dd/MM/yy HH:mm", { locale: ptBR }) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unidade</TableHead>
                  <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p: any) => (
                  <TableRow key={p.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                    <TableCell className="pl-8 py-3 font-black text-xs uppercase italic text-slate-900 dark:text-white">{p.name}</TableCell>
                    <TableCell className="text-[11px] font-bold text-slate-500">{p.unit}</TableCell>
                    <TableCell className="pr-8 text-[11px] font-bold text-slate-400">{p.description || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Movimentação */}
      <Dialog open={movOpen} onOpenChange={setMovOpen}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-xl font-black uppercase italic">Nova <span className="text-emerald-600">Movimentação</span></DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Produto</Label>
              <Select value={movForm.productId} onValueChange={(v) => setMovForm({ ...movForm, productId: v })}>
                <SelectTrigger className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold">
                  <SelectValue placeholder="Selecionar produto..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p: any) => <SelectItem key={p.id} value={p.id} className="font-bold">{p.name} ({p.unit})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</Label>
              <Select value={movForm.type} onValueChange={(v) => setMovForm({ ...movForm, type: v })}>
                <SelectTrigger className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOVEMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value} className="font-bold">{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantidade</Label>
              <Input type="number" value={movForm.quantity} onChange={(e) => setMovForm({ ...movForm, quantity: e.target.value })}
                placeholder="0" className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Observação (opcional)</Label>
              <Input value={movForm.notes} onChange={(e) => setMovForm({ ...movForm, notes: e.target.value })}
                placeholder="Ex: Doado para célula Alfa" className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold" />
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 flex flex-row gap-3">
            <Button variant="ghost" onClick={() => setMovOpen(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] text-slate-400">Cancelar</Button>
            <Button onClick={handleAddMovement} disabled={saving} className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px]">
              {saving ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Novo Produto */}
      <Dialog open={productOpen} onOpenChange={setProductOpen}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-xl font-black uppercase italic">Novo <span className="text-emerald-600">Produto</span></DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</Label>
              <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Ex: Salsicha" className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unidade</Label>
              <Select value={productForm.unit} onValueChange={(v) => setProductForm({ ...productForm, unit: v })}>
                <SelectTrigger className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['kg', 'unidade', 'pacote', 'caixa', 'litro', 'g'].map((u) => (
                    <SelectItem key={u} value={u} className="font-bold">{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição (opcional)</Label>
              <Input value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Descrição do produto" className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold" />
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 flex flex-row gap-3">
            <Button variant="ghost" onClick={() => setProductOpen(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] text-slate-400">Cancelar</Button>
            <Button onClick={handleCreateProduct} disabled={saving} className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px]">
              {saving ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
