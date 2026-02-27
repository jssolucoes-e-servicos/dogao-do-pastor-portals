// src/components/erp/tables/cells-table.tsx
"use client"

import { CellsPaginateAction } from "@/actions/cells/paginate.action";
import { CellEntity } from "@/common/entities";
import { IPaginatedData } from "@/common/interfaces";
import { TablePagination } from "@/components/erp/shared/table-pagination";
import { TableStates } from "@/components/erp/shared/table-states";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  AlertCircle,
  Crown,
  Edit, Eye,
  MapPin,
  Users
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { TableHeaderCustom } from "../shared/table-header-custom";

interface Props {
  initialData: IPaginatedData<CellEntity>;
}

export function CellsErpTable({ initialData }: Props) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState("");

  const { data: response, isLoading } = useSWR(
    [`cells-list`, page, search], 
    () => CellsPaginateAction(page, search), 
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
        title="Células"
        description="Gestão das células e lideranças de base"
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        //buttonLabel="Nova Célula"
        //buttonHref="/erp/celulas/novo"
      />

      <div className="flex flex-col gap-2">
        <div className="rounded-md border relative bg-card shadow-sm overflow-hidden dark:border-slate-800">
          <TableStates isLoading={isLoading} error={fetchError} />

          <Table>
            <TableHeader className="bg-muted/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="py-3 px-4 font-bold text-xs uppercase text-foreground tracking-widest">Célula</TableHead>
                <TableHead className="py-3 font-bold text-xs uppercase text-foreground tracking-widest">Rede Ministerial</TableHead>
                <TableHead className="py-3 font-bold text-xs uppercase text-foreground tracking-widest">Liderança</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase text-foreground px-4 tracking-widest">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <AlertCircle className="h-10 w-10" />
                      <p>Nenhuma célula encontrada.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((cell: CellEntity) => (
                  <TableRow key={cell.id} className="hover:bg-muted/30 transition-colors border-b dark:border-slate-800/60">
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-950/40 p-2 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="font-bold text-sm text-foreground uppercase tracking-tight">{cell.name}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1 flex items-center gap-1">
                            <MapPin className="h-2 w-2" /> Célula Ativa
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {cell.network ? (
                        <Link 
                          href={`/erp/redes-de-celulas/${cell.network.id}`}
                          className="group flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded border border-orange-100 dark:border-orange-900/40 hover:border-orange-400 transition-all w-fit"
                        >
                          <Crown className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                          <span className="text-[10px] font-black text-orange-800 dark:text-orange-300 uppercase leading-none">
                            {cell.network.name}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic uppercase">Sem Rede</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {cell.leader ?  (
                            <Link 
                              href={`/erp/colaboradores/${cell.leader.id}`}
                              className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors uppercase tracking-tighter"
                            >
                              {cell.leader.name.split(' ')[0]}
                            </Link>
                          
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic uppercase">Sem Líder</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right px-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40" asChild>
                          <Link href={`/erp/celulas/${cell.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800" asChild>
                          <Link href={`/erp/celulas/${cell.id}/editar`}><Edit className="h-4 w-4" /></Link>
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