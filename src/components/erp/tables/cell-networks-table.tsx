// src/components/erp/cell-networks/cell-networks-table/index.tsx
"use client"

import { CellsNetworksPaginateAction } from "@/actions/cells-networks/paginate.action";
import { CellNetworkEntity } from "@/common/entities";
import { IPaginatedData } from "@/common/interfaces";
import { TableHeaderCustom } from "@/components/erp/shared/table-header-custom";
import { TablePagination } from "@/components/erp/shared/table-pagination";
import { TableStates } from "@/components/erp/shared/table-states";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AlertCircle,
  Crown,
  Edit,
  ExternalLink,
  Eye,
  Layers
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

interface Props {
  initialData: IPaginatedData<CellNetworkEntity>;
}

export function CellsNetworksErpTable({ initialData }: Props) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState("");

  const { data: response, isLoading } = useSWR(
    [`cell-networks-list`, page, search], 
    () => CellsNetworksPaginateAction(page, search), 
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
        title="Redes de Células"
        description="Gestão das redes e supervisão ministerial"
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        //buttonLabel="Nova Rede"
        //buttonHref="/erp/redes-de-celulas/novo"
      />

      <div className="flex flex-col gap-2">
        <div className="rounded-md border relative bg-card shadow-sm overflow-hidden dark:border-slate-800">
          <TableStates isLoading={isLoading} error={fetchError} />

          <Table>
            <TableHeader className="bg-muted/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="py-3 px-4 font-bold text-xs uppercase text-foreground tracking-widest">Rede</TableHead>
                <TableHead className="py-3 font-bold text-xs uppercase text-foreground tracking-widest">Supervisor Responsável</TableHead>
                <TableHead className="py-3 font-bold text-xs uppercase text-foreground tracking-widest text-center">Células</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase text-foreground px-4 tracking-widest">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <AlertCircle className="h-10 w-10" />
                      <p>Nenhuma rede encontrada.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((network: CellNetworkEntity) => (
                  <TableRow key={network.id} className="hover:bg-muted/30 transition-colors border-b dark:border-slate-800/60">
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 dark:bg-orange-950/40 p-2 rounded-lg">
                          <Crown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="font-bold text-sm text-foreground uppercase tracking-tight">{network.name}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1 tracking-tighter">
                            Rede Ministerial
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {network.supervisor ? (
                        <Link 
                          href={`/erp/colaboradores/${network.supervisor.id}`}
                          className="group flex items-center gap-2 w-fit"
                        >
                          <div className="flex flex-col leading-tight">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-orange-600 transition-colors flex items-center gap-1">
                              {network.supervisor.name}
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">
                              @{network.supervisor.username}
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground italic tracking-tight">Sem supervisor vinculado</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/40">
                        <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-black text-blue-700 dark:text-blue-400">
                          {network.cells?.length || 0}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right px-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40" asChild>
                          <Link href={`/erp/redes-de-celulas/${network.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800" asChild>
                          <Link href={`/erp/redes-de-celulas/${network.id}/editar`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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