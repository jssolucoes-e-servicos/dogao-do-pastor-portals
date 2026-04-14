'use client';

import { ContributorsPaginateAction } from "@/actions/contributors/paginate.action";
import { ContributorLinkRoleAction } from "@/actions/contributors/link-role.action";
import { ContributorUnlinkRoleAction } from "@/actions/contributors/unlink-role.action";
import { RolesListAllAction } from "@/actions/roles/list-all.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Aumenta perPage para 50 na action
async function fetchContributors(page: number, search: string) {
  const res = await ContributorsPaginateAction(page, search);
  return res;
}

export default function UsuariosPermissoesPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roles, setRoles] = useState<any[]>([]);
  const [addingRole, setAddingRole] = useState<Record<string, string>>({});

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return;
    RolesListAllAction().then((r) => setRoles(r.data || []));
  }, [mounted]);

  // Reset page on search change
  useEffect(() => { setPage(1); }, [search]);

  const { data: res, mutate, isLoading } = useSWR(
    mounted ? ["contributors-perms", page, search] : null,
    () => fetchContributors(page, search),
    { keepPreviousData: true }
  );

  const contributors = res?.data?.data || [];
  const meta = res?.data?.meta;
  const totalPages = meta?.totalPages || 1;

  const handleLink = async (contributorId: string) => {
    const roleId = addingRole[contributorId];
    if (!roleId) return;
    const r = await ContributorLinkRoleAction(contributorId, roleId);
    if (r.success) {
      toast.success("Perfil vinculado");
      mutate();
      setAddingRole((p) => ({ ...p, [contributorId]: "" }));
    } else toast.error(r.error || "Erro");
  };

  const handleUnlink = async (contributorId: string, roleId: string) => {
    const r = await ContributorUnlinkRoleAction(contributorId, roleId);
    if (r.success) { toast.success("Perfil removido"); mutate(); }
    else toast.error(r.error || "Erro");
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Perfis por <span className="text-blue-600">Usuário</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
            Vincule perfis de acesso aos colaboradores
          </p>
        </div>
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
                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Colaborador</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Perfis Ativos</TableHead>
                <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Adicionar Perfil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1,2,3].map((j) => <TableCell key={j}><div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" /></TableCell>)}
                  </TableRow>
                ))
              ) : contributors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center">
                    <p className="font-bold text-slate-400 uppercase text-xs tracking-widest italic">Nenhum colaborador encontrado</p>
                  </TableCell>
                </TableRow>
              ) : contributors.map((c: any) => (
                <TableRow key={c.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                  <TableCell className="pl-8 py-5">
                    <p className="font-black text-xs uppercase italic text-slate-900 dark:text-white">{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">@{c.username || "—"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {(c.userRoles || []).filter((ur: any) => ur.active).map((ur: any) => (
                        <Badge key={ur.id} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-none text-[9px] font-black px-2 gap-1 pr-1">
                          {ur.role?.name || ur.roleId}
                          <button onClick={() => handleUnlink(c.id, ur.roleId)} className="hover:text-red-400 transition-colors ml-0.5">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ))}
                      {(!c.userRoles || c.userRoles.filter((ur: any) => ur.active).length === 0) && (
                        <span className="text-[10px] text-slate-400 italic font-bold">Sem perfis</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="pr-8">
                    <div className="flex items-center gap-2">
                      <Select value={addingRole[c.id] || ""} onValueChange={(v) => setAddingRole((p) => ({ ...p, [c.id]: v }))}>
                        <SelectTrigger className="w-44 h-9 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs">
                          <SelectValue placeholder="Selecionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.id} className="font-bold text-xs">{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="icon" onClick={() => handleLink(c.id)} disabled={!addingRole[c.id]}
                        className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-8 py-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Página {page} de {totalPages} • {meta?.total || 0} colaboradores
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
                  if (p > totalPages) return null;
                  return (
                    <Button key={p} variant={p === page ? "default" : "outline"} size="icon"
                      onClick={() => setPage(p)}
                      className={`h-9 w-9 rounded-xl font-black text-xs ${p === page ? 'bg-blue-600 hover:bg-blue-700 text-white border-none' : 'border-slate-200 dark:border-slate-800'}`}>
                      {p}
                    </Button>
                  );
                })}
                <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
