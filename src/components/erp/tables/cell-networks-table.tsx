// src/components/erp/tables/cell-networks-table.tsx
"use client"

import { CellsNetworksPaginateAction } from "@/actions/cells-networks/paginate.action";
import { CellNetworkEntity } from "@/common/entities";
import { IPaginatedData } from "@/common/interfaces";
import { TablePageContainer, TablePageContent } from '@/components/erp/shared/table-page';
import { TableActions, TableCardContents, TableContents, TableEmpty, TableHeaderCustom, TableHeaders, TableHeadersItem, TablePagination, TableStates } from "@/components/erp/shared/tables";
import { Crown, ExternalLink, Layers } from "lucide-react";
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
    }
  );

  const displayData = response?.data?.data || [];
  const meta = response?.data?.meta;
  const fetchError = response?.success === false ? response.error : null;

  return (
    <TablePageContainer>
      <TableHeaderCustom 
        title="Redes de Células"
        description="Gestão das redes e supervisão ministerial"
        onSearch={(val) => { setSearch(val); setPage(1); }}
      />

      <TablePageContent>
        <TableStates isLoading={isLoading} error={fetchError} />

        <TableHeaders>
          <TableHeadersItem>Rede</TableHeadersItem>
          <TableHeadersItem>Supervisor Responsável</TableHeadersItem>
          <TableHeadersItem className="text-center">Células</TableHeadersItem>
          <TableHeadersItem action>Ações</TableHeadersItem>
        </TableHeaders>

        {displayData.length === 0 && !isLoading ? <TableEmpty /> : (
          <TableContents>
            {displayData.map((network: CellNetworkEntity) => (
              <TableCardContents key={network.id}>
                {/* 1. REDE */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-orange-100 dark:bg-orange-950/40 p-2 rounded-lg shrink-0">
                    <Crown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-foreground uppercase truncate">{network.name}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Rede Ministerial</span>
                  </div>
                </div>

                {/* 2. SUPERVISOR */}
                <div className="flex flex-col border-y md:border-none py-3 md:py-0 border-dashed border-slate-100 dark:border-slate-800">
                  <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Supervisor</span>
                  {network.supervisor ? (
                    <Link href={`/erp/colaboradores/${network.supervisor.id}`} className="group flex flex-col leading-tight w-fit">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-orange-600 transition-colors flex items-center gap-1">
                        {network.supervisor.name}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase">@{network.supervisor.username}</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Sem supervisor vinculado</span>
                  )}
                </div>

                {/* 3. CÉLULAS */}
                <div className="flex flex-col md:items-center">
                  <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Qtd. Células</span>
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/40 w-fit">
                    <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-black text-blue-700 dark:text-blue-400">{network.cells?.length || 0}</span>
                  </div>
                </div>

                <TableActions path="redes-de-celulas" id={network.id} />
              </TableCardContents>
            ))}
          </TableContents>
        )}

        <TablePagination page={page} totalPages={meta?.totalPages || 0} onPageChange={setPage} />
      </TablePageContent>
    </TablePageContainer>
  );
}