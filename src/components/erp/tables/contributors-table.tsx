// src/components/erp/partners/partners-table/index.tsx
"use client"

import { ContributorsPaginateAction } from "@/actions/contributors/paginate.action";
import { CellEntity, CellNetworkEntity, ContributorEntity } from "@/common/entities";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { IPaginatedData } from "@/common/interfaces";

import {
  Crown,
  Smartphone,
  User,
  Users
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { TablePageContainer, TablePageContent } from '@/components/erp/shared/table-page';
import { TableActions, TableCardContents, TableContents, TableEmpty, TableHeaderCustom, TableHeaders, TableHeadersItem, TablePagination, TableStates } from "@/components/erp/shared/tables";

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
    <TablePageContainer>
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

      <TablePageContent>
        <TableStates isLoading={isLoading} error={fetchError} />

        <TableHeaders>
          <TableHeadersItem>Colaborador</TableHeadersItem>
          <TableHeadersItem>Acesso</TableHeadersItem>
          <TableHeadersItem>Funções / Vínculos</TableHeadersItem>
          <TableHeadersItem action>Ações</TableHeadersItem>
        </TableHeaders>

        {displayData.length === 0 && !isLoading ? (<TableEmpty/>) : (
          <TableContents>
            {displayData.map((contributor: ContributorEntity) => (
              <TableCardContents key={contributor.id}>
                {/* 1. COLABORADOR */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="hidden sm:flex h-10 w-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-500">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-sm md:text-base uppercase truncate text-foreground leading-tight">
                      {contributor.name}
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-black uppercase mt-0.5 flex items-center gap-1">
                      <Smartphone className="h-3 w-3 text-emerald-600" />
                      {contributor.phone ? NumbersHelper.maskPhone(contributor.phone) : "SEM TELEFONE"}
                    </span>
                  </div>
                </div>

                {/* 2. ACESSO */}
                <div className="flex flex-col md:items-start border-y md:border-none py-3 md:py-0 border-dashed border-slate-100 dark:border-slate-800">
                  <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1 tracking-widest opacity-70">Acesso ao Sistema</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">@{contributor.username}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                    <span className="text-[9px] text-green-600 font-black uppercase">Ativo</span>
                  </div>
                </div>

                {/* 3. VÍNCULOS */}
                <div className="flex flex-wrap gap-2">
                  <span className="md:hidden w-full text-[9px] font-black text-muted-foreground uppercase mb-1 tracking-widest opacity-70">Funções e Vínculos</span>
                  {/* Supervisão de Redes */}
                  {contributor.cellNetworks?.map((net: CellNetworkEntity) => (
                    <Link 
                      key={net.id}
                      href={`/erp/redes-de-celulas/${net.id}`}
                      className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/20 px-2 py-1.5 rounded border border-orange-100 dark:border-orange-900/40 hover:scale-105 transition-transform"
                    >
                      <Crown className="h-3 w-3 text-orange-600" />
                      <span className="text-[9px] font-black text-orange-800 dark:text-orange-300 uppercase leading-none">{net.name}</span>
                      <span className="text-[8px] text-orange-400 font-bold uppercase border-l border-orange-200 pl-1 ml-0.5 tracking-tighter">SUP</span>
                    </Link>
                  ))}

                  {/* Liderança de Células */}
                  {contributor.cells?.map((cell: CellEntity) => (
                    <Link 
                      key={cell.id}
                      href={`/erp/celulas/${cell.id}`}
                      className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/20 px-2 py-1.5 rounded border border-blue-100 dark:border-blue-900/40 hover:scale-105 transition-transform"
                    >
                      <Users className="h-3 w-3 text-blue-600" />
                      <span className="text-[9px] font-black text-blue-800 dark:text-blue-300 uppercase leading-none">{cell.name}</span>
                      <span className="text-[8px] text-blue-400 font-bold uppercase border-l border-blue-200 pl-1 ml-0.5 tracking-tighter">LÍDER</span>
                    </Link>
                  ))}
                </div>
                <TableActions path="colaboradores" id={contributor.id}/>
              </TableCardContents>
            ))}
          </TableContents>
        )}

        <TablePagination 
          page={page}
          totalPages={meta?.totalPages || 0}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </TablePageContent>
    </TablePageContainer>
  );
}