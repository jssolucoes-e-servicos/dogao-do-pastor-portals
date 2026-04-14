'use client';

import { ModuleCreateAction } from "@/actions/modules/create.action";
import { ModulesPaginateAction } from "@/actions/modules/paginate.action";
import { ModuleUpdateAction } from "@/actions/modules/update.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Layers, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export default function ModulosPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", ctrl: "", page: "" });

  useEffect(() => { setMounted(true); }, []);

  const { data: res, mutate, isLoading } = useSWR(
    mounted ? ["modules", search] : null,
    () => ModulesPaginateAction(1, search)
  );
  const modules = res?.data?.data || [];

  const openModal = (mod: any = null) => {
    setEditing(mod);
    setForm(mod
      ? { name: mod.name, slug: mod.slug, description: mod.description || "", ctrl: mod.ctrl || "", page: mod.page || "" }
      : { name: "", slug: "", description: "", ctrl: "", page: "" }
    );
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) return toast.error("Nome e slug são obrigatórios");
    const r = editing
      ? await ModuleUpdateAction(editing.id, { name: form.name, description: form.description, ctrl: form.ctrl, page: form.page })
      : await ModuleCreateAction(form);
    if (r.success) { toast.success("Salvo"); setIsOpen(false); mutate(); }
    else toast.error(r.error || "Erro");
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-violet-600 p-3 rounded-2xl shadow-lg shadow-violet-600/20">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Módulos do <span className="text-violet-600">Sistema</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Telas e funcionalidades • Slugs de acesso
            </p>
          </div>
        </div>
        <Button onClick={() => openModal()} className="h-12 px-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black uppercase text-[10px] tracking-widest gap-2">
          <Plus className="h-4 w-4" /> Novo Módulo
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar módulo..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Slug</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rota</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : modules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <p className="font-bold text-slate-400 uppercase text-xs tracking-widest italic">Nenhum módulo cadastrado</p>
                  </TableCell>
                </TableRow>
              ) : modules.map((mod: any) => (
                <TableRow key={mod.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                  <TableCell className="pl-8 py-5 font-black text-xs uppercase italic text-slate-900 dark:text-white">{mod.name}</TableCell>
                  <TableCell>
                    <code className="text-[10px] font-black bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 px-2 py-1 rounded-lg">
                      {mod.slug}
                    </code>
                  </TableCell>
                  <TableCell className="text-[11px] font-bold text-slate-500">{mod.page || "—"}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={`${mod.active ? 'bg-emerald-500' : 'bg-slate-300'} text-white border-none text-[9px] font-black px-3`}>
                      {mod.active ? "ATIVO" : "INATIVO"}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openModal(mod)} className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-slate-900">
                      <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] border-none p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-2xl">
          <DialogHeader className="p-10 pb-0">
            <DialogTitle className="text-2xl font-black uppercase italic text-slate-900 dark:text-white">
              {editing ? "Editar" : "Novo"} <span className="text-violet-600">Módulo</span>
            </DialogTitle>
          </DialogHeader>
          <div className="p-10 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: PDV" className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Slug {editing && <span className="text-orange-500">(imutável)</span>}
                </Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  disabled={!!editing} placeholder="erp.pdv"
                  className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-mono text-sm disabled:opacity-50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descreva o módulo..." className="rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold text-xs resize-none min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ctrl (identificador)</Label>
                <Input value={form.ctrl} onChange={(e) => setForm({ ...form, ctrl: e.target.value })}
                  placeholder="pdv" className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rota (URL)</Label>
                <Input value={form.page} onChange={(e) => setForm({ ...form, page: e.target.value })}
                  placeholder="/erp/pdv" className="h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-mono text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter className="p-10 pt-0 flex flex-row gap-3">
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="h-14 px-8 flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400">Cancelar</Button>
            <Button onClick={handleSave} className="h-14 px-8 flex-1 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black uppercase text-[10px] tracking-widest">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
