'use client';

import { RoleSetPermissionAction } from "@/actions/roles/set-permission.action";
import { ModulesListAllAction } from "@/actions/modules/list-all.action";
import { RolesPaginateAction } from "@/actions/roles/paginate.action";
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
import { ArrowLeft, ShieldCheck, Fingerprint } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export default function PerfisPermissoesPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: rolesRes } = useSWR(
    mounted ? [`roles-all`] : null,
    () => RolesPaginateAction(1, "") // Buscar lista de perfis
  );

  const { data: modulesRes } = useSWR(
    mounted ? [`modules-all`] : null,
    () => ModulesListAllAction()
  );

  const allRoles = rolesRes?.data?.data || [];
  const allModules = modulesRes?.data || [];

  // Pega o perfil selecionado
  const selectedRole = allRoles.find((r: any) => r.id === selectedRoleId);

  // Força re-render caso precisemos refazer request mas como swr gerencia cache...
  const handleTogglePermission = async (modId: string, field: string, value: boolean) => {
     if (!selectedRole) return;

     // Encontrar permissão atual ou criar template
     const currentPerm = selectedRole?.permissions?.find((p: any) => p.moduleId === modId) || {
        access: false, create: false, update: false, delete: false, report: false
     };

     const newPerms = {
        ...currentPerm,
        [field]: value
     };

     try {
        const res = await RoleSetPermissionAction(selectedRoleId, modId, newPerms);
        if (res.success) {
           toast.success("Permissão atualizada");
           
           // Evitar tela piscando atualizando state local antes do SWR refatch real
           const roleIndex = allRoles.findIndex((r: any) => r.id === selectedRoleId);
           if (roleIndex !== -1) {
              const permIndex = allRoles[roleIndex].permissions?.findIndex((p: any) => p.moduleId === modId);
              if (permIndex !== undefined && permIndex !== -1) {
                  allRoles[roleIndex].permissions[permIndex] = newPerms as any;
              } else {
                  if (!allRoles[roleIndex].permissions) allRoles[roleIndex].permissions = [];
                  allRoles[roleIndex].permissions.push({ moduleId: modId, ...newPerms } as any);
              }
           }
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
              Gestão de <span className="text-orange-600">Acessos</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Permissões Padrão dos Perfis (Roles)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-8">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" /> Selecionar Perfil
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Escolha o papel para ver e editar permissões
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="h-12 rounded-2xl border-none bg-slate-50 dark:bg-slate-950 font-bold text-[10px] uppercase tracking-widest px-6 w-full">
                  <SelectValue placeholder="SELECIONE UM PERFIL" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl bg-white dark:bg-slate-950">
                  {allRoles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id} className="font-bold text-[10px] uppercase tracking-widest py-3">
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-8 space-y-8">
           <Card className={`border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden transition-opacity duration-300 ${!selectedRoleId ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader className="p-8 pb-4">
               <CardTitle className="text-lg font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-orange-600" /> Regras do Perfil
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Defina as autorizações padrão em cada módulo do ERP
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4">
               <Table>
                 <TableHeader>
                   <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                      <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Módulo</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Marcar Todas</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Acesso</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Criar</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Editar</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Excluir</TableHead>
                      <TableHead className="text-center pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Relatórios</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {allModules.map((mod: any) => {
                      const perm = selectedRole?.permissions?.find((p: any) => p.moduleId === mod.id) || {
                        access: false, create: false, update: false, delete: false, report: false
                      };

                      const allChecked = perm.access && perm.create && perm.update && perm.delete && perm.report;

                      const handleToggleAll = async (value: boolean) => {
                          if (!selectedRole) return;
                          const newPerms = {
                            access: value,
                            create: value,
                            update: value,
                            delete: value,
                            report: value
                          };

                          try {
                            const res = await RoleSetPermissionAction(selectedRoleId, mod.id, newPerms);
                            if (res.success) {
                              toast.success("Permissões atualizadas");
                              const roleIndex = allRoles.findIndex((r: any) => r.id === selectedRoleId);
                              if (roleIndex !== -1) {
                                  const permIndex = allRoles[roleIndex].permissions?.findIndex((p: any) => p.moduleId === mod.id);
                                  if (permIndex !== undefined && permIndex !== -1) {
                                      allRoles[roleIndex].permissions[permIndex] = newPerms as any;
                                  } else {
                                      if (!allRoles[roleIndex].permissions) allRoles[roleIndex].permissions = [];
                                      allRoles[roleIndex].permissions.push({ moduleId: mod.id, ...newPerms } as any);
                                  }
                              }
                            } else {
                              toast.error(res.error || "Erro ao salvar permissões");
                            }
                          } catch (err) {
                            toast.error("Erro interno");
                          }
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
                              <div className="flex flex-col items-center justify-center gap-1">
                                <Checkbox 
                                  checked={allChecked} 
                                  onCheckedChange={(val) => handleToggleAll(!!val)}
                                  className="rounded-lg h-5 w-5 border-slate-200 dark:border-slate-800 data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-white data-[state=checked]:text-white dark:data-[state=checked]:text-slate-900 border-2 shadow-sm"
                                />
                                <span className="text-[8px] font-bold uppercase text-slate-400">Tudo</span>
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
