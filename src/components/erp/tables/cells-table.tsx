// src/components/erp/tables/cells-table.tsx
"use client"

import { CellsPaginateAction } from "@/actions/cells/paginate.action";
import { CellEntity } from "@/common/entities";
import { IPaginatedData } from "@/common/interfaces";
import { TablePageContainer, TablePageContent } from '@/components/erp/shared/table-page';
import { TableActions, TableCardContents, TableContents, TableEmpty, TableHeaderCustom, TableHeaders, TableHeadersItem, TablePagination, TableStates } from "@/components/erp/shared/tables";
import { Crown, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

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
    }
  );

  const displayData = response?.data?.data || [];
  const meta = response?.data?.meta;
  const fetchError = response?.success === false ? response.error : null;

  return (
    <TablePageContainer>
      <TableHeaderCustom 
        title="Células"
        description="Gestão das células e lideranças de base"
        onSearch={(val) => { setSearch(val); setPage(1); }}
      />

      <TablePageContent>
        <TableStates isLoading={isLoading} error={fetchError} />

        <TableHeaders>
          <TableHeadersItem>Célula</TableHeadersItem>
          <TableHeadersItem>Rede Ministerial</TableHeadersItem>
          <TableHeadersItem>Liderança</TableHeadersItem>
          <TableHeadersItem action>Ações</TableHeadersItem>
        </TableHeaders>

        {displayData.length === 0 && !isLoading ? <TableEmpty /> : (
          <TableContents>
            {displayData.map((cell: CellEntity) => (
              <TableCardContents key={cell.id}>
                {/* 1. CÉLULA */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-blue-100 dark:bg-blue-950/40 p-2 rounded-lg shrink-0">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-foreground uppercase truncate">{cell.name}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase flex items-center gap-1">
                      <MapPin className="h-2 w-2" /> Célula Ativa
                    </span>
                  </div>
                </div>

                {/* 2. REDE */}
                <div className="flex flex-col border-y md:border-none py-3 md:py-0 border-dashed border-slate-100 dark:border-slate-800">
                  <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Rede Ministerial</span>
                  {cell.network ? (
                    <Link href={`/erp/redes-de-celulas/${cell.network.id}`} className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded border border-orange-100 dark:border-orange-900/40 hover:border-orange-400 transition-all w-fit">
                      <Crown className="h-3 w-3 text-orange-600" />
                      <span className="text-[10px] font-black text-orange-800 dark:text-orange-300 uppercase leading-none">{cell.network.name}</span>
                    </Link>
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic uppercase">Sem Rede</span>
                  )}
                </div>

                {/* 3. LIDERANÇA */}
                <div className="flex flex-col">
                  <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Líder Responsável</span>
                  {cell.leader ? (
                    <Link href={`/erp/colaboradores/${cell.leader.id}`} className="text-[10px] bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors uppercase">
                      {cell.leader.name}
                    </Link>
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic uppercase">Sem Líder</span>
                  )}
                </div>

                <TableActions path="celulas" id={cell.id} />
              </TableCardContents>
            ))}
          </TableContents>
        )}

        <TablePagination page={page} totalPages={meta?.totalPages || 0} onPageChange={setPage} />
      </TablePageContent>
    </TablePageContainer>
  );
}