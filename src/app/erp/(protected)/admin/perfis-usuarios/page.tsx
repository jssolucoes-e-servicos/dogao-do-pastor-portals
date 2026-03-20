'use client';

import { ContributorsPaginateAction } from "@/actions/contributors/paginate.action";
import { ContributorLinkRoleAction } from "@/actions/contributors/link-role.action";
import { ContributorUnlinkRoleAction } from "@/actions/contributors/unlink-role.action";
import { ContributorSetPermissionAction } from "@/actions/contributors/set-permission.action";
import { RolesPaginateAction } from "@/actions/roles/paginate.action";
import { ModulesListAllAction } from "@/actions/modules/list-all.action";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ShieldCheck, UserPlus, Trash2, Fingerprint, Settings2, Search, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export default function BulkPerfisUsuariosPage() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoleToLink, setSelectedRoleToLink] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: usersRes, mutate: mutateUsers, isValidating: usersLoading } = useSWR(
    mounted ? [`contributors`, page, search] : null,
    () => ContributorsPaginateAction(page, search)
  );

  const { data: rolesRes } = useSWR(
    mounted ? [`roles-all`] : null,
    () => RolesPaginateAction(1, "") // Busca todos para lista rápida
  );

  const { data: modulesRes } = useSWR(
    mounted ? [`modules-all`] : null,
    () => ModulesListAllAction()
  );

  const allUsers = usersRes?.data?.data || [];
  const meta = usersRes?.data?.meta;
  const allRoles = rolesRes?.data?.data || [];
  const allModules = modulesRes?.data || [];

  const selectedUser = allUsers.find((u: any) => u.id === selectedUserId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchQuery);
    setPage(1);
  };

  const handleLinkRole = async () => {
    if (!selectedUser || !selectedRoleToLink) return;
    try {
      const res = await ContributorLinkRoleAction(selectedUser.id, selectedRoleToLink);
      if (res.success) {
        toast.success("Perfil vinculado");
        setSelectedRoleToLink("");
        mutateUsers();
      } else {
        toast.error(res.error || "Erro ao vincular");
      }
    } catch (err) {
      toast.error("Erro interno");
    }
  };

  const handleUnlinkRole = async (roleId: string) => {
    if (!selectedUser) return;
    try {
      const res = await ContributorUnlinkRoleAction(selectedUser.id, roleId);
      if (res.success) {
        toast.success("Perfil removido");
        mutateUsers();
      } else {
        toast.error(res.error || "Erro ao remover");
      }
    } catch (err) {
      toast.error("Erro interno");
    }
  };

  const handleTogglePermission = async (modId: string, field: string, value: boolean) => {
     if (!selectedUser) return;
     const currentPerm = selectedUser?.permissions?.find((p: any) => p.moduleId === modId) || {
        access: false, create: false, update: false, delete: false, report: false
     };

     const newPerms = { ...currentPerm, [field]: value };

     try {
        const res = await ContributorSetPermissionAction(selectedUser.id, modId, newPerms);
        if (res.success) {
           toast.success("Permissão atualizada");
           mutateUsers();
        } else {
           toast.error(res.error || "Erro ao salvar");
        }
     } catch (err) {
        toast.error("Erro interno");
     }
  };

  const handleToggleAll = async (modId: string, value: boolean) => {
    if (!selectedUser) return;
    const newPerms = {
      access: value,
      create: value,
      update: value,
      delete: value,
      report: value
    };

    try {
      const res = await ContributorSetPermissionAction(selectedUser.id, modId, newPerms);
      if (res.success) {
        toast.success("Permissões atualizadas");
        mutateUsers();
      } else {
        toast.error(res.error || "Erro ao salvar");
      }
    } catch (err) {
      toast.error("Erro interno");
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <Button variant="outline" size="icon" asChild className="rounded-2xl h-12 w-12 border-slate-200 dark:border-slate-800">
            <Link href={`/erp/configuracoes`}>
              <ArrowLeft className="h-4 w-4 text-slate-400" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Gestão de <span className="text-orange-600">Usuários</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Bulk Actions para Perfis & Permissões
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-800/50">
          <div>
            <CardTitle className="text-lg font-black uppercase text-slate-900 dark:text-white italic">
              Colaboradores ({meta?.total || 0})
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Gerencie acessos de todo o time de forma rápida
            </CardDescription>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Buscar usuário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-2xl border-none bg-slate-50 dark:bg-slate-950 font-bold text-[10px] uppercase tracking-widest px-6 shadow-none"
            />
            <Button
              type="submit"
              className="h-12 w-12 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg p-0"
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                 <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Usuário</TableHead>
                 <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Perfis Vinculados</TableHead>
                 <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Permissões Custom</TableHead>
                 <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading && allUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                    Carregando usuários...
                  </TableCell>
                </TableRow>
              ) : allUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : allUsers.map((user: any) => {
                const activeRoles = user.userRoles?.filter((ur: any) => ur.active) || [];
                const activePermsCount = user.permissions?.filter((p: any) => p.access || p.create || p.update || p.delete || p.report).length || 0;
                
                return (
                  <TableRow key={user.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50 cursor-pointer transition-colors" onClick={() => setSelectedUserId(user.id)}>
                     <TableCell className="pl-8 py-5">
                        <div className="flex flex-col">
                           <span className="font-black text-xs uppercase italic text-slate-900 dark:text-white">{user.name}</span>
                           <span className="text-[10px] font-bold text-slate-400">@{user.username} {user.phone ? `• ${user.phone}` : ''}</span>
                        </div>
                     </TableCell>
                     <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {activeRoles.length > 0 ? activeRoles.map((ur: any) => (
                            <span key={ur.id} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20">
                              {ur.role.name}
                            </span>
                          )) : (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sem Perfil</span>
                          )}
                        </div>
                     </TableCell>
                     <TableCell>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {activePermsCount > 0 ? `${activePermsCount} Regras Definidas` : 'Padrão'}
                        </span>
                     </TableCell>
                     <TableCell className="text-right pr-8">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); setSelectedUserId(user.id); }}
                          className="h-10 w-10 rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-600 dark:hover:text-white transition-all border border-orange-100 dark:border-orange-500/20 shadow-sm"
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                     </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between p-8 border-t border-slate-50 dark:border-slate-800/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Página {meta.page} de {meta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-2xl h-10 w-10 border-slate-200 dark:border-slate-800"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-2xl h-10 w-10 border-slate-200 dark:border-slate-800"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet Lateral de Gestão Rápida */}
      <Sheet open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <SheetContent side="right" className="w-[90vw] sm:max-w-[700px] p-0 border-l border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950 flex flex-col h-full overflow-hidden">
          {selectedUser && (
            <>
              <SheetHeader className="p-8 pb-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 flex-shrink-0">
                <SheetTitle className="text-2xl font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-2">
                  <span className="text-orange-600">Acessos</span> {selectedUser.name}
                </SheetTitle>
                <SheetDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Defina os perfis e overrides de permissão deste usuário de forma rápida.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
                
                {/* Gestão de Perfis */}
                <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Perfis Ativos
                  </h3>
                  <div className="flex gap-2">
                    <Select value={selectedRoleToLink} onValueChange={setSelectedRoleToLink}>
                      <SelectTrigger className="h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-[10px] uppercase tracking-widest px-6 flex-1">
                        <SelectValue placeholder="SELECIONE UM PERFIL PARA ADICIONAR" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl bg-white dark:bg-slate-950">
                        {allRoles
                          .filter((r: any) => !selectedUser.userRoles?.some((ur: any) => ur.roleId === r.id && ur.active))
                          .map((role: any) => (
                          <SelectItem key={role.id} value={role.id} className="font-bold text-[10px] uppercase tracking-widest py-3 hover:bg-slate-50 dark:hover:bg-slate-900 border-b border-slate-50 dark:border-slate-800 last:border-0 cursor-pointer">
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleLinkRole}
                      disabled={!selectedRoleToLink}
                      className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white dark:text-white hover:bg-emerald-500 dark:hover:bg-emerald-500 transition-all p-0 shadow-sm disabled:opacity-50"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    {selectedUser.userRoles?.filter((ur: any) => ur.active).map((ur: any) => (
                      <div key={ur.id} className="flex items-center justify-between p-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 group">
                        <span className="font-black text-[10px] uppercase italic text-slate-900 dark:text-white">{ur.role.name}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleUnlinkRole(ur.roleId)}
                          className="h-8 w-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    {(!selectedUser.userRoles || selectedUser.userRoles.filter((ur: any) => ur.active).length === 0) && (
                      <div className="col-span-full py-4 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 italic">Nenhum perfil vinculado</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gestão de Permissões */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                   <div className="p-6 pb-4 border-b border-slate-50 dark:border-slate-800/50">
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                       <Fingerprint className="h-4 w-4 text-orange-600" /> Permissões Customizadas (Overrides)
                     </h3>
                   </div>
                   
                   <div className="overflow-x-auto custom-scrollbar">
                     <Table>
                       <TableHeader>
                         <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                            <TableHead className="pl-6 text-[9px] font-black uppercase tracking-widest text-slate-400 min-w-[200px]">Módulo</TableHead>
                            <TableHead className="text-center text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap min-w-[100px]">Marcar Todas</TableHead>
                            <TableHead className="text-center text-[9px] font-black uppercase tracking-widest text-slate-400">Acesso</TableHead>
                            <TableHead className="text-center text-[9px] font-black uppercase tracking-widest text-slate-400">Criar</TableHead>
                            <TableHead className="text-center text-[9px] font-black uppercase tracking-widest text-slate-400">Editar</TableHead>
                            <TableHead className="text-center text-[9px] font-black uppercase tracking-widest text-slate-400">Excluir</TableHead>
                            <TableHead className="text-center pr-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Relatórios</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {allModules.map((mod: any) => {
                            const perm = selectedUser.permissions?.find((p: any) => p.moduleId === mod.id) || {
                              access: false, create: false, update: false, delete: false, report: false
                            };

                            const allChecked = perm.access && perm.create && perm.update && perm.delete && perm.report;

                            return (
                              <TableRow key={mod.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50 h-16">
                                 <TableCell className="pl-6 py-4">
                                    <div className="flex flex-col">
                                       <span className="font-black text-[11px] uppercase italic text-slate-900 dark:text-white leading-tight">{mod.name}</span>
                                       <span className="text-[9px] font-bold text-slate-400 truncate max-w-[180px]" title={mod.description}>{mod.description}</span>
                                    </div>
                                 </TableCell>
                                 <TableCell className="text-center">
                                    <Checkbox 
                                      checked={allChecked} 
                                      onCheckedChange={(val) => handleToggleAll(mod.id, !!val)}
                                      className="rounded-lg h-5 w-5 border-slate-200 dark:border-slate-700 data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-white data-[state=checked]:text-white dark:data-[state=checked]:text-slate-900 mx-auto"
                                    />
                                 </TableCell>
                                 <TableCell className="text-center">
                                    <Checkbox 
                                      checked={perm.access} 
                                      onCheckedChange={(val) => handleTogglePermission(mod.id, 'access', !!val)}
                                      className="rounded-lg h-4 w-4 border-slate-200 dark:border-slate-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none mx-auto"
                                    />
                                 </TableCell>
                                 <TableCell className="text-center">
                                    <Checkbox 
                                      checked={perm.create} 
                                      onCheckedChange={(val) => handleTogglePermission(mod.id, 'create', !!val)}
                                      className="rounded-lg h-4 w-4 border-slate-200 dark:border-slate-700 data-[state=checked]:bg-orange-600 data-[state=checked]:border-none mx-auto"
                                    />
                                 </TableCell>
                                 <TableCell className="text-center">
                                    <Checkbox 
                                      checked={perm.update} 
                                      onCheckedChange={(val) => handleTogglePermission(mod.id, 'update', !!val)}
                                      className="rounded-lg h-4 w-4 border-slate-200 dark:border-slate-700 data-[state=checked]:bg-orange-600 data-[state=checked]:border-none mx-auto"
                                    />
                                 </TableCell>
                                 <TableCell className="text-center">
                                    <Checkbox 
                                      checked={perm.delete} 
                                      onCheckedChange={(val) => handleTogglePermission(mod.id, 'delete', !!val)}
                                      className="rounded-lg h-4 w-4 border-slate-200 dark:border-slate-700 data-[state=checked]:bg-red-500 data-[state=checked]:border-none mx-auto"
                                    />
                                 </TableCell>
                                 <TableCell className="text-center pr-6">
                                    <Checkbox 
                                      checked={perm.report} 
                                      onCheckedChange={(val) => handleTogglePermission(mod.id, 'report', !!val)}
                                      className="rounded-lg h-4 w-4 border-slate-200 dark:border-slate-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-none mx-auto"
                                    />
                                 </TableCell>
                              </TableRow>
                            );
                         })}
                       </TableBody>
                     </Table>
                   </div>
                </div>
                
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}
