'use client';

import { ContributorsPaginateAction } from "@/actions/contributors/paginate.action";
import { useUser } from "@/hooks/use-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Plus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { fetchApi, FetchCtx } from "@/lib/api";

export default function MinhaCelulaColaboradoresPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", phone: "" });
  const { user } = useUser();

  useEffect(() => { setMounted(true); }, []);

  const cellId = user?.leaderCellId;

  const { data: res, mutate, isLoading } = useSWR(
    mounted ? ["cell-contributors", search] : null,
    () => ContributorsPaginateAction(1, search),
    { keepPreviousData: true }
  );

  // Filtra apenas colaboradores da célula do líder
  const allContributors = res?.data?.data || [];
  const contributors = cellId
    ? allContributors.filter((c: any) =>
        c.cells?.some((cell: any) => cell.id === cellId) ||
        c.cellsMember?.some((cm: any) => cm.cellId === cellId)
      )
    : allContributors;

  const handleCreate = async () => {
    if (!form.name || !form.username || !form.phone) return toast.error("Preencha todos os campos");
    if (!cellId) return toast.error("Célula não identificada");
    setSaving(true);
    try {
      // 1. Criar colaborador
      const contributor = await fetchApi(FetchCtx.ERP, '/contributors', {
        method: 'POST',
        body: JSON.stringify({ name: form.name, username: form.username, phone: form.phone }),
      });

      // 2. Buscar role "Vendedor" para vincular automaticamente
      const rolesData = await fetchApi(FetchCtx.ERP, '/roles?perPage=100', { cache: 'no-store' });
      const vendedorRole = (rolesData?.data || []).find((r: any) =>
        r.name.toLowerCase().includes('vendedor') || r.name.toLowerCase().includes('seller')
      );

      if (vendedorRole) {
        await fetchApi(FetchCtx.ERP, `/contributors/${contributor.id}/roles/${vendedorRole.id}`, { method: 'POST' });
      }

      toast.success(`Colaborador ${form.name} criado com perfil Vendedor`);
      setIsOpen(false);
      setForm({ name: "", username: "", phone: "" });
      mutate();
    } catch (e: any) {
      toast.error(e.message || "Erro ao criar colaborador");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Colaboradores da <span className="text-blue-600">Célula</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Membros vinculados à sua célula
            </p>
          </div>
        </div>
        <Button onClick={() => setIsOpen(true)}
          className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest gap-2">
          <UserPlus className="h-4 w-4" /> Novo Colaborador
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar colaborador..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Usuário</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telefone</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Perfis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1,2,3,4].map((j) => <TableCell key={j}><div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" /></TableCell>)}
                  </TableRow>
                ))
              ) : contributors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <p className="font-bold text-slate-400 uppercase text-xs tracking-widest italic">Nenhum colaborador encontrado</p>
                  </TableCell>
                </TableRow>
              ) : contributors.map((c: any) => (
                <TableRow key={c.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                  <TableCell className="pl-8 py-5 font-black text-xs uppercase italic text-slate-900 dark:text-white">{c.name}</TableCell>
                  <TableCell className="text-[11px] font-bold text-slate-500">@{c.username || "—"}</TableCell>
                  <TableCell className="text-[11px] font-bold text-slate-500">{c.phone || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(c.userRoles || []).filter((ur: any) => ur.active).map((ur: any) => (
                        <Badge key={ur.id} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none text-[9px] font-black">
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-2xl">
          <DialogHeader className="p-10 pb-0">
            <DialogTitle className="text-2xl font-black uppercase italic text-slate-900 dark:text-white">
              Novo <span className="text-blue-600">Colaborador</span>
            </DialogTitle>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Entrará automaticamente com perfil Vendedor
            </p>
          </DialogHeader>
          <div className="p-10 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome Completo</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome do colaborador"
                className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Usuário (login)</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                placeholder="ex: joaosilva"
                className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telefone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold text-sm" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold">Senha padrão: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">dogao@2026</code></p>
          </div>
          <DialogFooter className="p-10 pt-0 flex flex-row gap-3">
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="h-14 px-8 flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400">Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}
              className="h-14 px-8 flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest">
              {saving ? "Criando..." : "Criar Colaborador"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
