'use client';

import { CreateContributorAction } from "@/actions/contributors/create.action";
import { RolesListAllAction } from "@/actions/roles/list-all.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function NovoColaboradorPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', username: '', phone: '', roleId: '' });

  useEffect(() => {
    RolesListAllAction().then((r) => setRoles(r.data || []));
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.username || !form.phone) {
      return toast.error("Nome, usuário e telefone são obrigatórios");
    }
    setSaving(true);
    const r = await CreateContributorAction({
      name: form.name,
      username: form.username,
      phone: form.phone.replace(/\D/g, ''),
      roleId: form.roleId || undefined,
    });
    if (r.success) {
      toast.success("Colaborador criado com sucesso");
      router.push('/erp/colaboradores');
    } else {
      toast.error(r.error || "Erro ao criar colaborador");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/erp/colaboradores">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 dark:bg-white p-3 rounded-2xl shadow-lg">
            <UserPlus className="h-6 w-6 text-white dark:text-slate-900" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Novo <span className="text-orange-600">Colaborador</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Senha padrão: dogao@2026
            </p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Dados do Colaborador</CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome Completo *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome do colaborador"
                className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Usuário (login) *</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                placeholder="ex: joaosilva"
                className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telefone *</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Perfil de Acesso</Label>
              <Select value={form.roleId} onValueChange={(v) => setForm({ ...form, roleId: v })}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
                  <SelectValue placeholder="Selecionar perfil..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="font-bold text-slate-400">Sem perfil</SelectItem>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id} className="font-bold">{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
              A senha padrão é <code className="bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 rounded font-mono">dogao@2026</code>. 
              O colaborador pode alterar no primeiro acesso.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/erp/colaboradores" className="flex-1">
              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                Cancelar
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-600/20"
            >
              {saving ? "Criando..." : "Criar Colaborador"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
