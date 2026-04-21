'use client';

import { useUser } from "@/hooks/use-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Edit2, ShoppingBag, TrendingUp, UserPlus, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { fetchApi, FetchCtx } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MinhaCelulaPage() {
  const [mounted, setMounted] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "" });
  const [memberForm, setMemberForm] = useState({ name: "", username: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const { user } = useUser();

  useEffect(() => { setMounted(true); }, []);

  // Busca cellId do backend se não estiver no cookie
  const [resolvedCellId, setResolvedCellId] = useState<string | null>(null);

  useEffect(() => {
    if (!mounted) return;
    if (user?.leaderCellId) {
      setResolvedCellId(user.leaderCellId);
      return;
    }
    // Fallback: busca do backend
    fetchApi(FetchCtx.ERP, '/contributors/me', { cache: 'no-store' })
      .then((me: any) => {
        const id = me?.cells?.[0]?.id ?? null;
        setResolvedCellId(id);
      })
      .catch(() => setResolvedCellId(null));
  }, [mounted, user?.leaderCellId]);

  const cellId = resolvedCellId;

  const { data: cellData, mutate: mutateCell } = useSWR(
    mounted && cellId ? ["my-cell", cellId] : null,
    () => fetchApi(FetchCtx.ERP, `/cells/show/${cellId}`, { cache: "no-store" })
  );

  const { data: ordersData } = useSWR(
    mounted && cellId ? ["cell-orders"] : null,
    () => fetchApi(FetchCtx.ERP, `/orders?perPage=500`, { cache: "no-store" })
  );

  const cell = cellData;
  const sellers = cell?.sellers || [];
  const members = cell?.contributors || [];
  const orders = ordersData?.data || [];
  const paidOrders = orders.filter((o: any) => o.paymentStatus === 'PAID');
  const pendingOrders = orders.filter((o: any) => o.paymentStatus === 'PENDING' || o.status === 'PENDING_PAYMENT');
  const totalDogs = paidOrders.reduce((acc: number, o: any) => acc + (o.items?.length || 0), 0);
  const totalRevenue = paidOrders.reduce((acc: number, o: any) => acc + (o.totalValue || 0), 0);

  // Ranking por vendedor
  const salesBySeller: Record<string, { name: string; tag: string; dogs: number; revenue: number }> = {};
  paidOrders.forEach((o: any) => {
    const tag = o.sellerTag || '—';
    const name = o.seller?.contributor?.name || o.sellerTag || '—';
    if (!salesBySeller[tag]) salesBySeller[tag] = { name, tag, dogs: 0, revenue: 0 };
    salesBySeller[tag].dogs += o.items?.length || 0;
    salesBySeller[tag].revenue += o.totalValue || 0;
  });
  const sellerRanking = Object.values(salesBySeller).sort((a, b) => b.dogs - a.dogs);

  const handleEditCell = async () => {
    if (!editForm.name || !cellId) return;
    setSaving(true);
    try {
      await fetchApi(FetchCtx.ERP, `/cells/${cellId}`, { method: 'PUT', body: JSON.stringify({ name: editForm.name }) });
      toast.success("Célula atualizada");
      setEditOpen(false);
      mutateCell();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleAddMember = async () => {
    if (!memberForm.name || !memberForm.username || !memberForm.phone) return toast.error("Preencha todos os campos");
    setSaving(true);
    try {
      await fetchApi(FetchCtx.ERP, '/contributors/invite-member', {
        method: 'POST',
        body: JSON.stringify({ ...memberForm, cellId }),
      });
      toast.success(`${memberForm.name} adicionado à célula com perfil Vendedor`);
      setMemberOpen(false);
      setMemberForm({ name: "", username: "", phone: "" });
      mutateCell();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              {cell?.name || <span className="opacity-30">Carregando...</span>}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              {cell?.network?.name || "—"} • Líder: {cell?.leader?.name || "—"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setEditForm({ name: cell?.name || "" }); setEditOpen(true); }}
            className="h-10 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 border-slate-200">
            <Edit2 className="h-3.5 w-3.5" /> Editar Célula
          </Button>
          <Button onClick={() => setSalesOpen(true)}
            className="h-10 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[10px] tracking-widest gap-2">
            <ShoppingBag className="h-3.5 w-3.5" /> Ver Vendas
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-blue-600 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Dogs Vendidos</p>
            <p className="text-3xl font-black text-white mt-1">{totalDogs}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendentes</p>
            <p className="text-3xl font-black text-orange-500 mt-1">{pendingOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vendedores</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{sellers.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendedores */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-6 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" /> Vendedores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">#</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tag</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Dogs</TableHead>
                  <TableHead className="pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellerRanking.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-400 text-xs italic font-bold">Sem vendas registradas</TableCell></TableRow>
                ) : sellerRanking.map((s, i) => (
                  <TableRow key={s.tag} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                    <TableCell className="pl-6 py-3">
                      <span className={`text-sm font-black ${i === 0 ? 'text-orange-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : 'text-slate-300'}`}>{i + 1}º</span>
                    </TableCell>
                    <TableCell className="font-black text-xs uppercase italic text-slate-900 dark:text-white">{s.name}</TableCell>
                    <TableCell><code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold">{s.tag}</code></TableCell>
                    <TableCell className="text-center font-black text-sm text-orange-600">{s.dogs}</TableCell>
                    <TableCell className="pr-6 text-right font-black text-xs text-slate-700 dark:text-slate-300">
                      {s.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Membros / Colaboradores */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-6 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" /> Colaboradores
            </CardTitle>
            <Button size="sm" onClick={() => setMemberOpen(true)}
              className="h-8 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[9px] tracking-widest gap-1.5">
              <UserPlus className="h-3 w-3" /> Novo
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Usuário</TableHead>
                  <TableHead className="pr-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Perfis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!members || members.length === 0) ? (
                  <TableRow><TableCell colSpan={3} className="h-24 text-center text-slate-400 text-xs italic font-bold">Nenhum colaborador</TableCell></TableRow>
                ) : members.map((m: any) => (
                  <TableRow key={m.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                    <TableCell className="pl-6 py-3 font-black text-xs uppercase italic text-slate-900 dark:text-white">{m.contributor?.name || m.name}</TableCell>
                    <TableCell className="text-[11px] font-bold text-slate-500">@{m.contributor?.username || m.username || "—"}</TableCell>
                    <TableCell className="pr-6">
                      <div className="flex flex-wrap gap-1">
                        {(m.contributor?.userRoles || m.userRoles || []).filter((ur: any) => ur.active).map((ur: any) => (
                          <Badge key={ur.id} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none text-[8px] font-black">
                            {ur.role?.name || "—"}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal Editar Célula */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-xl font-black uppercase italic">Editar <span className="text-blue-600">Célula</span></DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome da Célula</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ name: e.target.value })}
                className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold" />
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 flex flex-row gap-3">
            <Button variant="ghost" onClick={() => setEditOpen(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] text-slate-400">Cancelar</Button>
            <Button onClick={handleEditCell} disabled={saving} className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px]">
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Novo Colaborador */}
      <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-xl font-black uppercase italic">Novo <span className="text-blue-600">Colaborador</span></DialogTitle>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Entrará com perfil Vendedor • Senha: dogao@2026</p>
          </DialogHeader>
          <div className="p-8 space-y-4">
            {[
              { label: "Nome Completo", key: "name", placeholder: "Nome do colaborador" },
              { label: "Usuário (login)", key: "username", placeholder: "ex: joaosilva" },
              { label: "Telefone", key: "phone", placeholder: "(11) 99999-9999" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</Label>
                <Input value={(memberForm as any)[key]}
                  onChange={(e) => setMemberForm({ ...memberForm, [key]: key === 'username' ? e.target.value.toLowerCase().replace(/\s/g, '') : e.target.value })}
                  placeholder={placeholder}
                  className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold" />
              </div>
            ))}
          </div>
          <DialogFooter className="p-8 pt-0 flex flex-row gap-3">
            <Button variant="ghost" onClick={() => setMemberOpen(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] text-slate-400">Cancelar</Button>
            <Button onClick={handleAddMember} disabled={saving} className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px]">
              {saving ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Vendas da Célula */}
      <Dialog open={salesOpen} onOpenChange={setSalesOpen}>
        <DialogContent className="max-w-3xl rounded-[2rem] border-none bg-slate-50 dark:bg-slate-950 shadow-2xl p-0 overflow-hidden max-h-[80vh] flex flex-col">
          <DialogHeader className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl font-black uppercase italic flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-orange-600" /> Vendas da <span className="text-orange-600">Célula</span>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vendedor</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Dogs</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</TableHead>
                  <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidOrders.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400 text-xs italic font-bold">Nenhuma venda paga</TableCell></TableRow>
                ) : paidOrders.map((o: any) => (
                  <TableRow key={o.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                    <TableCell className="pl-8 py-3 font-black text-xs uppercase italic text-slate-900 dark:text-white">{o.customerName}</TableCell>
                    <TableCell className="text-[10px] font-bold text-slate-500">{o.sellerTag}</TableCell>
                    <TableCell className="text-center font-black text-sm text-orange-600">{o.items?.length || 0}</TableCell>
                    <TableCell className="text-right font-black text-xs text-slate-700 dark:text-slate-300">
                      {(o.totalValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="pr-8 text-[10px] font-bold text-slate-400">
                      {o.createdAt ? format(new Date(o.createdAt), "dd/MM HH:mm", { locale: ptBR }) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
