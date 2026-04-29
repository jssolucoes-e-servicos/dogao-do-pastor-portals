'use client';

import { CellsListAllAction } from "@/actions/cells/list-all.action";
import { ContributorsListAllAction } from "@/actions/contributors/list-all.action";
import { CreateSellerAction } from "@/actions/sellers/create.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Store, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function NovoVendedorPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [cells, setCells] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', cellId: '', contributorId: '', tag: '' });

  useEffect(() => {
    CellsListAllAction().then((r) => setCells(r.data || []));
    ContributorsListAllAction().then((r) => setContributors(r.data || []));
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.cellId || !form.contributorId || !form.tag) {
      return toast.error("Todos os campos são obrigatórios");
    }
    setSaving(true);
    const r = await CreateSellerAction({
      name: form.name,
      cellId: form.cellId,
      contributorId: form.contributorId,
      tag: form.tag,
    });
    if (r.success) {
      toast.success("Vendedor criado com sucesso");
      router.push('/erp/vendedores');
    } else {
      toast.error(r.error || "Erro ao criar vendedor");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/erp/vendedores">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 dark:bg-white p-3 rounded-2xl shadow-lg">
            <Store className="h-6 w-6 text-white dark:text-slate-900" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Novo <span className="text-orange-600">Vendedor</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Vincule um colaborador a uma célula
            </p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Dados do Vendedor</CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome de Exibição *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: João da Célula X"
                className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Colaborador *</Label>
              <Select value={form.contributorId} onValueChange={(v) => setForm({ ...form, contributorId: v })}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {contributors.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="font-bold">{c.name} (@{c.username})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Célula *</Label>
              <Select value={form.cellId} onValueChange={(v) => setForm({ ...form, cellId: v })}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {cells.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">TAG (Identificação Única) *</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value.toUpperCase().replace(/\s/g, '') })}
                  placeholder="EX: JOAO-01"
                  className="h-12 pl-10 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/erp/vendedores" className="flex-1">
              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                Cancelar
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-600/20"
            >
              {saving ? "Salvando..." : "Cadastrar Vendedor"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
