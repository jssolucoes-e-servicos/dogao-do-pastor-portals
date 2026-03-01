// src/components/erp/tables/sellers-table.tsx
"use client"

import { SellersPaginateAction } from "@/actions/sellers/paginate.action";
import { SellerEntity } from "@/common/entities";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { IPaginatedData } from "@/common/interfaces";
import { TablePageContainer, TablePageContent } from '@/components/erp/shared/table-page';
import { TableActions, TableCardContents, TableContents, TableEmpty, TableHeaderCustom, TableHeaders, TableHeadersItem, TablePagination, TableStates } from "@/components/erp/shared/tables";
import { Smartphone, Tag, User, Users } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

interface Props {
  initialData: IPaginatedData<SellerEntity>;
}

export function SellersErpTable({ initialData }: Props) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState("");

  const { data: response, isLoading } = useSWR([`sellers-list`, page, search], () => SellersPaginateAction(page, search), {
    fallbackData: { success: true, data: initialData },
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const displayData = response?.data?.data || [];
  const meta = response?.data?.meta;
  const fetchError = response?.success === false ? response.error : null;

  return (
    <TablePageContainer>
      <TableHeaderCustom 
        title="Vendedores"
        description="Gerencie os vendedores cadastrados"
        onSearch={(val) => { setSearch(val); setPage(1); }}
        buttonLabel="Novo Vendedor"
        buttonHref="/erp/vendedor/novo"
      />

      <TablePageContent>
        <TableStates isLoading={isLoading} error={fetchError} />

        <TableHeaders>
          <TableHeadersItem>Vendedor</TableHeadersItem>
          <TableHeadersItem>TAG / Sistema</TableHeadersItem>
          <TableHeadersItem>Célula / Líder</TableHeadersItem>
          <TableHeadersItem action>Ações</TableHeadersItem>
        </TableHeaders>

        {displayData.length === 0 && !isLoading ? <TableEmpty /> : (
          <TableContents>
            {displayData.map((seller: SellerEntity) => (
              <TableCardContents key={seller.id}>
                {/* 1. VENDEDOR */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="hidden sm:flex h-10 w-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-500">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm uppercase truncate text-foreground">{seller.name}</span>
                    <span className="text-[10px] text-emerald-600 font-black uppercase flex items-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      {seller.contributor?.phone ? NumbersHelper.maskPhone(seller.contributor.phone) : "SEM TELEFONE"}
                    </span>
                  </div>
                </div>

                {/* 2. TAG / SISTEMA */}
                <div className="flex flex-col border-y md:border-none py-3 md:py-0 border-dashed border-slate-100 dark:border-slate-800">
                  <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Identificação</span>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{seller.tag || "SEM TAG"}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">@{seller.contributor.username}</span>
                </div>

                {/* 3. CÉLULA */}
                <div className="flex flex-col">
                  <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Vínculo</span>
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Users className="h-3.5 w-3.5" />
                    <span className="text-sm font-bold uppercase tracking-tight">{seller.cell?.name || "NÃO VINCULADO"}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">{seller.cell?.leader?.name || "Sem Líder"}</span>
                </div>

                <TableActions path="vendedores" id={seller.id} />
              </TableCardContents>
            ))}
          </TableContents>
        )}

        <TablePagination page={page} totalPages={meta?.totalPages || 0} onPageChange={setPage} />
      </TablePageContent>
    </TablePageContainer>
  );
}