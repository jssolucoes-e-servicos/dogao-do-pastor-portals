'use client';

import { ModulesListAllAction } from "@/actions/modules/list-all.action";
import { RolesListAllAction } from "@/actions/roles/list-all.action";
import { RoleSetPermissionAction } from "@/actions/roles/set-permission.action";
import { RoleByIdAction } from "@/actions/roles/find-by-id.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ModulePerms { access: boolean; create: boolean; update: boolean; delete: boolean; report: boolean; }
type PermField = keyof ModulePerms;

const FIELDS: PermField[] = ["access", "create", "update", "delete", "report"];
const LABELS: Record<PermField, string> = { access: "Acessar", create: "Criar", update: "Editar", delete: "Excluir", report: "Relatório" };
const defaultPerm = (p?: Partial<ModulePerms>): ModulePerms => ({
  access: false, create: false, update: false, delete: false, report: false, ...p,
});

export default function PermissoesPage() {
  const [mounted, setMounted] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [perms, setPerms] = useState<Record<string, ModulePerms>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    RolesListAllAction().then((r) => setRoles(r.data || []));
    ModulesListAllAction().then((r) => setModules(r.data || []));
  }, [mounted]);

  useEffect(() => {
    if (!selectedRole) return;
    RoleByIdAction(selectedRole).then((r) => {
      const map: Record<string, ModulePerms> = {};
      (r.data?.permissions || []).forEach((p: any) => {
        if (p.moduleId) map[p.moduleId] = { access: p.access, create: p.create, update: p.update, delete: p.delete, report: p.report };
      });
      setPerms(map);
    }).catch(() => setPerms({}));
  }, [selectedRole]);

  const toggle = (moduleId: string, field: PermField) => {
    setPerms((prev) => {
      const current = defaultPerm(prev[moduleId]);
      const newVal = !current[field];
      const updated = { ...current, [field]: newVal };
      // Se qualquer ação está ativa, access deve ser true
      if (field !== 'access' && newVal) updated.access = true;
      // Se access é desativado, desativa tudo
      if (field === 'access' && !newVal) {
        return { ...prev, [moduleId]: defaultPerm() };
      }
      return { ...prev, [moduleId]: updated };
    });
  };

  const toggleAll = (moduleId: string) => {
    setPerms((prev) => {
      const current = defaultPerm(prev[moduleId]);
      const allOn = FIELDS.every((f) => current[f]);
      return { ...prev, [moduleId]: allOn ? defaultPerm() : { access: true, create: true, update: true, delete: true, report: true } };
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return toast.error("Selecione um perfil");
    setSaving(true);
    try {
      await Promise.all(modules.map((mod) => RoleSetPermissionAction(selectedRole, mod.id, perms[mod.id] || defaultPerm())));
      toast.success("Permissões salvas");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-600/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Permissões por <span className="text-orange-600">Perfil</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Defina o que cada perfil pode acessar e fazer
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-64 h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-sm">
              <SelectValue placeholder="Selecionar perfil..." />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id} className="font-bold">{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={!selectedRole || saving}
            className="h-12 px-8 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[10px] tracking-widest gap-2">
            <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {!selectedRole ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
          <ShieldCheck className="h-16 w-16 text-slate-200 mb-4" />
          <p className="font-black text-slate-400 uppercase text-xs tracking-widest italic">Selecione um perfil para configurar as permissões</p>
        </div>
      ) : (
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400 w-44">Módulo</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-36">Slug</TableHead>
                  {FIELDS.map((f) => (
                    <TableHead key={f} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{LABELS[f]}</TableHead>
                  ))}
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Tudo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((mod) => {
                  const p = defaultPerm(perms[mod.id]);
                  const allOn = FIELDS.every((f) => p[f]);
                  return (
                    <TableRow key={mod.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                      <TableCell className="pl-8 py-4 font-black text-xs uppercase italic text-slate-900 dark:text-white">{mod.name}</TableCell>
                      <TableCell>
                        <code className="text-[10px] font-black bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 px-2 py-1 rounded-lg">{mod.slug}</code>
                      </TableCell>
                      {FIELDS.map((field) => (
                        <TableCell key={field} className="text-center">
                          <button onClick={() => toggle(mod.id, field)}
                            className={`w-8 h-8 rounded-xl font-black text-[10px] transition-all ${
                              p[field] ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                            {p[field] ? '✓' : '—'}
                          </button>
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <button onClick={() => toggleAll(mod.id)}
                          className={`px-3 h-8 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                            allOn ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                          {allOn ? 'Limpar' : 'Tudo'}
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
