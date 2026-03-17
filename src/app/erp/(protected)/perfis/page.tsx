'use client';

import { RoleCreateAction } from "@/actions/roles/create.action";
import { RoleDeleteAction } from "@/actions/roles/delete.action";
import { RolesPaginateAction } from "@/actions/roles/paginate.action";
import { RoleUpdateAction } from "@/actions/roles/update.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Plus, ShieldCheck, Trash2, Search, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export default function PerfisPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: response, mutate, isLoading } = useSWR(
    mounted ? [`roles-list`, page, search] : null,
    () => RolesPaginateAction(page, search)
  );

  const roles = response?.data?.data || [];

  const handleOpenModal = (role: any = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name, description: role.description || "" });
    } else {
      setEditingRole(null);
      setFormData({ name: "", description: "" });
    }
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error("Nome é obrigatório");

    try {
      let res;
      if (editingRole) {
        res = await RoleUpdateAction(editingRole.id, formData);
      } else {
        res = await RoleCreateAction(formData);
      }

      if (res.success) {
        toast.success(editingRole ? "Perfil atualizado" : "Perfil criado");
        setIsOpen(false);
        mutate();
      } else {
        toast.error(res.error || "Erro ao salvar");
      }
    } catch (err) {
      toast.error("Falha na comunicação");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja desativar este perfil?")) return;

    try {
      const res = await RoleDeleteAction(id);
      if (res.success) {
        toast.success("Perfil desativado");
        mutate();
      } else {
        toast.error(res.error || "Erro ao remover");
      }
    } catch (err) {
      toast.error("Falha na comunicação");
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-900/10 dark:bg-white text-white dark:text-slate-900">
             <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Gestão de <span className="text-orange-600">Perfis</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Papéis do Sistema • Controle de Acesso
            </p>
          </div>
        </div>

        <Button 
          onClick={() => handleOpenModal()} 
          className="h-12 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-slate-900/10"
        >
          <Plus className="h-4 w-4" /> Novo Perfil
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nome..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome do Perfil</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-8 py-6"><div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" /></TableCell>
                    <TableCell><div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full mx-auto" /></TableCell>
                    <TableCell className="pr-8"><div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <p className="font-bold text-slate-400 uppercase text-xs tracking-widest italic">Nenhum perfil encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50 group transition-colors">
                    <TableCell className="pl-8 py-6">
                       <span className="font-black text-xs uppercase italic text-slate-900 dark:text-white">{role.name}</span>
                    </TableCell>
                    <TableCell>
                       <span className="text-[11px] font-bold text-slate-500 line-clamp-1">{role.description || "---"}</span>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className={`${role.active ? 'bg-emerald-500' : 'bg-slate-300'} text-white border-none text-[9px] font-black px-3`}>
                          {role.active ? "ATIVO" : "INATIVO"}
                       </Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right space-x-2">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleOpenModal(role)}
                         className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm"
                       >
                         <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleDelete(role.id)}
                         className="h-9 w-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 text-red-400"
                       >
                         <Trash2 className="h-3.5 w-3.5" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] border-none p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-2xl">
          <DialogHeader className="p-10 pb-0 flex-row gap-6 items-center">
             <div className="bg-orange-100 dark:bg-orange-950 p-4 rounded-3xl">
                <ShieldAlert className="h-8 w-8 text-orange-600" />
             </div>
             <div>
                <DialogTitle className="text-2xl font-black uppercase text-slate-900 dark:text-white italic">
                  {editingRole ? "Editar" : "Novo"} <span className="text-orange-600">Perfil</span>
                </DialogTitle>
                <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                   Defina o nome e propósito do nível de acesso
                </DialogDescription>
             </div>
          </DialogHeader>
          
          <div className="p-10 space-y-6">
             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome do Papel</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  placeholder="EX: FINANCEIRO, EXPEDIÇÃO"
                  className="h-14 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-black uppercase text-sm px-6"
                />
             </div>
             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descrição</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva as responsabilidades deste perfil..."
                  className="min-h-[120px] rounded-3xl border-none shadow-sm bg-white dark:bg-slate-900 font-bold text-xs p-6 resize-none"
                />
             </div>
          </div>

          <DialogFooter className="p-10 pt-0 flex flex-row gap-3">
             <Button variant="ghost" onClick={() => setIsOpen(false)} className="h-14 px-8 flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400">Cancelar</Button>
             <Button onClick={handleSave} className="h-14 px-8 flex-1 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-600/20">
                Salvar Configurações
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
