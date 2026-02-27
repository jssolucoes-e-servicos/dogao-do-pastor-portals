// src/components/erp/partners/partners-table/index.tsx
"use client"

import { ContributorsPaginateAction } from "@/actions/contributors/paginate.action";
import { CellEntity, CellNetworkEntity, ContributorEntity } from "@/common/entities";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { IPaginatedData } from "@/common/interfaces";
import { TablePagination } from "@/components/erp/shared/table-pagination";
import { TableStates } from "@/components/erp/shared/table-states";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Crown, Edit, ExternalLink, Eye, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { TableHeaderCustom } from "../shared/table-header-custom";

interface Props {
  initialData: IPaginatedData<ContributorEntity>;
}

export function ContributorsErpTable({ initialData }: Props) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState("");

  const { data: response, isLoading } = useSWR(
    [`contributors-list`, page, search], 
    () => ContributorsPaginateAction(page, search), 
    {
      fallbackData: { success: true, data: initialData },
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 15000,
    }
  );

  const displayData = response?.data?.data || [];
  const meta = response?.data?.meta;
  const fetchError = response?.success === false ? response.error : null;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-0">
      <TableHeaderCustom 
        title="Colaboradores"
        description="Gerencie os colaboradores e supervisores do sistema"
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        buttonLabel="Novo Colaborador"
        buttonHref="/erp/colaboradores/novo"
      />

      <div className="flex flex-col gap-2">
        <div className="rounded-md border relative bg-card shadow-sm overflow-hidden dark:border-slate-800">
          <TableStates isLoading={isLoading} error={fetchError} />

          <Table>
            <TableHeader className="bg-muted/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="py-3 px-4 font-bold text-xs uppercase text-foreground tracking-widest">Colaborador</TableHead>
                <TableHead className="py-3 font-bold text-xs uppercase text-foreground tracking-widest">Acesso</TableHead>
                <TableHead className="py-3 font-bold text-xs uppercase text-foreground tracking-widest">Funções / Vínculos</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase text-foreground px-4 tracking-widest">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <AlertCircle className="h-10 w-10" />
                      <p>Nenhum resultado encontrado para sua busca.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((contributor: ContributorEntity) => {
                  //const contributor.cells && contributor.cells.length > 0 = contributor.cells && contributor.cells.length > 0;
                  //const hasNetwork = contributor.cellNetworks && contributor.cellNetworks.length > 0;

                  return (
                    <TableRow key={contributor.id} className="hover:bg-muted/30 transition-colors border-b dark:border-slate-800/60">
                      <TableCell className="py-4 px-4">
                        <div className="flex flex-col leading-tight">
                          <span className="font-bold text-sm text-foreground">{contributor.name}</span>
                          <span className="text-[11px] text-muted-foreground font-medium uppercase mt-1">
                            {contributor.phone ? NumbersHelper.maskPhone(contributor.phone) : "SEM TELEFONE"}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-tight">@{contributor.username}</span>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                            <span className="text-[10px] text-green-600 dark:text-green-500 font-black uppercase tracking-tighter">Ativo</span>
                          </div>
                        </div> 
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-2 py-1">
                          {contributor.cellNetworks && 
                            contributor.cellNetworks.length > 0 && 
                            contributor.cellNetworks.map((net: CellNetworkEntity) => (
                            <Link 
                              key={net.id}
                              href={`/erp/redes-de-celulas/${net.id}`}
                              className="group flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20 w-fit px-2 py-1 rounded border border-orange-100 dark:border-orange-900/40 hover:border-orange-400 dark:hover:border-orange-600 transition-all"
                            >
                              <Crown className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-black text-orange-800 dark:text-orange-300 uppercase leading-none">{net.name}</span>
                                  <ExternalLink className="h-2 w-2 opacity-0 group-hover:opacity-100 text-orange-600 transition-opacity" />
                                </div>
                                <span className="text-[8px] text-orange-600 dark:text-orange-500 font-bold uppercase leading-none mt-0.5">Supervisor</span>
                              </div>
                            </Link>
                          ))}
                          
                          {contributor.cells && 
                            contributor.cells.length > 0 && 
                            contributor.cells.map((cell: CellEntity) => (
                            <Link 
                              key={cell.id}
                              href={`/erp/celulas/${cell.id}`}
                              className="group flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 w-fit px-2 py-1 rounded border border-blue-100 dark:border-blue-900/40 hover:border-blue-400 dark:hover:border-blue-600 transition-all"
                            >
                              <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase leading-none">{cell.name}</span>
                                  <ExternalLink className="h-2 w-2 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
                                </div>
                                <span className="text-[8px] text-blue-600 dark:text-blue-500 font-bold uppercase leading-none mt-0.5">Líder</span>
                              </div>
                            </Link>
                          ))}
                        </div> 
                      </TableCell>

                      <TableCell className="text-right px-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40" asChild title="Visualizar Detalhes">
                            <Link href={`/erp/colaboradores/${contributor.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800" asChild title="Editar Colaborador">
                            <Link href={`/erp/colaboradores/${contributor.id}/editar`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination 
          page={page}
          totalPages={meta?.totalPages || 0}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}