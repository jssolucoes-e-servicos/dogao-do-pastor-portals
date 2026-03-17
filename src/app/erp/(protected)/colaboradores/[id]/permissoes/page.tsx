'use client';

import { ContributorsByIdAction } from "@/actions/contributors/find-by-id.action";
import { ContributorLinkRoleAction } from "@/actions/contributors/link-role.action";
import { ContributorSetPermissionAction } from "@/actions/contributors/set-permission.action";
import { ContributorUnlinkRoleAction } from "@/actions/contributors/unlink-role.action";
import { ModulesListAllAction } from "@/actions/modules/list-all.action";
import { RolesPaginateAction } from "@/actions/roles/paginate.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ArrowLeft, ShieldCheck, ShieldAlert, UserPlus, Trash2, Save, Fingerprint } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export default function ColaboradorPermissoesPage() {
  const { id } = useParams() as { id: string };
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: contributorRes, mutate: mutateContributor } = useSWR(
    mounted ? [`contributor`, id] : null,
    () => ContributorsByIdAction(id)
  );

  const { data: rolesRes } = useSWR(
    mounted ? [`roles-all`] : null,
    () => RolesPaginateAction(1, "") // No search, page 1 (up to 10 for now)
  );

  const { data: modulesRes } = useSWR(
    mounted ? [`modules-all`] : null,
    () => ModulesListAllAction()
  );

  const contributor = contributorRes?.data;
  const allRoles = rolesRes?.data?.data || [];
  const allModules = modulesRes?.data || [];

  const handleLinkRole = async () => {
    if (!selectedRole) return;
    try {
      const res = await ContributorLinkRoleAction(id, selectedRole);
      if (res.success) {
        toast.success("Perfil vinculado");
        mutateContributor();
      } else {
        toast.error(res.error || "Erro ao vincular");
      }
    } catch (err) {
      toast.error("Erro interno");
    }
  };

  const handleUnlinkRole = async (roleId: string) => {
    try {
      const res = await ContributorUnlinkRoleAction(id, roleId);
      if (res.success) {
        toast.success("Perfil removido");
        mutateContributor();
      } else {
        toast.error(res.error || "Erro ao remover");
      }
    } catch (err) {
      toast.error("Erro interno");
    }
  };

  const handleTogglePermission = async (modId: string, field: string, value: boolean) => {
     // Encontrar permissão atual ou criar template
     const currentPerm = contributor?.permissions?.find((p: any) => p.moduleId === modId) || {
        access: false, create: false, update: false, delete: false, report: false
     };

     const newPerms = {
        ...currentPerm,
        [field]: value
     };

     try {
        const res = await ContributorSetPermissionAction(id, modId, newPerms);
        if (res.success) {
           toast.success("Permissão atualizada");
           mutateContributor();
        } else {
           toast.error(res.error || "Erro ao salvar");
        }
     } catch (err) {
        toast.error("Erro interno");
     }
  };

  if (!mounted || !contributor) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <Button variant="outline" size="icon" asChild className="rounded-2xl h-12 w-12 border-slate-200 dark:border-slate-800">
            <Link href={`/erp/colaboradores/${id}`}>
              <ArrowLeft className="h-4 w-4 text-slate-400" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Permissões de <span className="text-orange-600">{contributor.name}</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Customização de Acesso • Individual & Perfis
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Lado Esquerdo: Perfis Vinculados */}
        <div className="xl:col-span-4 space-y-8">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" /> Perfis Ativos
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Determine os papéis do colaborador
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="flex gap-2">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="h-12 rounded-2xl border-none bg-slate-50 dark:bg-slate-950 font-bold text-[10px] uppercase tracking-widest px-6 flex-1">
                    <SelectValue placeholder="SELECIONE UM PERFIL" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-white dark:bg-slate-950">
                    {allRoles
                      .filter(r => !contributor.userRoles?.some((ur: any) => ur.roleId === r.id))
                      .map(role => (
                      <SelectItem key={role.id} value={role.id} className="font-bold text-[10px] uppercase tracking-widest py-3">
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleLinkRole}
                  disabled={!selectedRole}
                  className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all p-0 shadow-lg shadow-slate-900/10"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {contributor.userRoles?.filter((ur: any) => ur.active).map((ur: any) => (
                  <div key={ur.id} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 group">
                    <div className="flex flex-col">
                      <span className="font-black text-[11px] uppercase italic text-slate-900 dark:text-white">{ur.role.name}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Atribuído em {new Date(ur.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleUnlinkRole(ur.roleId)}
                      className="h-9 w-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 text-red-400 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                {(!contributor.userRoles || contributor.userRoles.filter((ur: any) => ur.active).length === 0) && (
                   <div className="py-12 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 italic">Nenhum perfil vinculado</p>
                   </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Permissões Individuais (Overrides) */}
        <div className="xl:col-span-8 space-y-8">
           <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
               <CardTitle className="text-lg font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-orange-600" /> Permissões Customizadas
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Overrides individuais ignoram as regras padrão do perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4">
               <Table>
                 <TableHeader>
                   <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                      <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Módulo</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Acesso</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Criar</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Editar</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Excluir</TableHead>
                      <TableHead className="text-center pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Relatórios</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {allModules.map((mod) => {
                      const perm = contributor.permissions?.find((p: any) => p.moduleId === mod.id) || {
                        access: false, create: false, update: false, delete: false, report: false
                      };
                      return (
                        <TableRow key={mod.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50 group transition-colors">
                           <TableCell className="pl-8 py-6">
                              <div className="flex flex-col">
                                 <span className="font-black text-xs uppercase italic text-slate-900 dark:text-white">{mod.name}</span>
                                 <span className="text-[10px] font-bold text-slate-400">{mod.description}</span>
                              </div>
                           </TableCell>
                           <TableCell className="text-center">
                              <Checkbox 
                                checked={perm.access} 
                                onCheckedChange={(val) => handleTogglePermission(mod.id, 'access', !!val)}
                                className="rounded-lg h-5 w-5 border-slate-200 dark:border-slate-800 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none shadow-sm"
                              />
                           </TableCell>
                           <TableCell className="text-center">
                              <Checkbox 
                                checked={perm.create} 
                                onCheckedChange={(val) => handleTogglePermission(mod.id, 'create', !!val)}
                                className="rounded-lg h-5 w-5 border-slate-200 dark:border-slate-800 data-[state=checked]:bg-orange-600 data-[state=checked]:border-none shadow-sm"
                              />
                           </TableCell>
                           <TableCell className="text-center">
                              <Checkbox 
                                checked={perm.update} 
                                onCheckedChange={(val) => handleTogglePermission(mod.id, 'update', !!val)}
                                className="rounded-lg h-5 w-5 border-slate-200 dark:border-slate-800 data-[state=checked]:bg-orange-600 data-[state=checked]:border-none shadow-sm"
                              />
                           </TableCell>
                           <TableCell className="text-center">
                              <Checkbox 
                                checked={perm.delete} 
                                onCheckedChange={(val) => handleTogglePermission(mod.id, 'delete', !!val)}
                                className="rounded-lg h-5 w-5 border-slate-200 dark:border-slate-800 data-[state=checked]:bg-red-500 data-[state=checked]:border-none shadow-sm"
                              />
                           </TableCell>
                           <TableCell className="text-center pr-8">
                              <Checkbox 
                                checked={perm.report} 
                                onCheckedChange={(val) => handleTogglePermission(mod.id, 'report', !!val)}
                                className="rounded-lg h-5 w-5 border-slate-200 dark:border-slate-800 data-[state=checked]:bg-blue-500 data-[state=checked]:border-none shadow-sm"
                              />
                           </TableCell>
                        </TableRow>
                      );
                   })}
                 </TableBody>
               </Table>
            </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
