"use client"

import { PaginateEditionsAction, EditionEntity } from "@/actions/editions/paginate-editions.action";
import { IPaginatedData } from "@/common/interfaces";
import { TablePageContainer, TablePageContent } from "@/components/erp/shared/table-page";
import {
  TableActions, TableCardContents, TableContents, TableEmpty,
  TableHeaderCustom, TableHeaders, TableHeadersItem, TablePagination, TableStates
} from "@/components/erp/shared/tables";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Package, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";

interface Props {
  initialData: IPaginatedData<EditionEntity>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function EditionsTable({ initialData }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: response, isLoading } = useSWR(
    ["editions-list", page, search],
    () => PaginateEditionsAction(page, search),
    { fallbackData: { success: true, data: initialData }, keepPreviousData: true, revalidateOnFocus: false }
  );

  const displayData = response?.data?.data || [];
  const meta = response?.data?.meta;
  const fetchError = response?.success === false ? response.error : null;

  return (
    <TablePageContainer>
      <TableHeaderCustom
        title="Edições"
        description="Gerencie as edições de venda do Dogão do Pastor"
        onSearch={(val) => { setSearch(val); setPage(1); }}
        actionButton={
          <Button asChild className="bg-orange-600 hover:bg-orange-700 font-black uppercase text-[10px] gap-2 rounded-xl h-10">
            <Link href="/erp/edicoes/nova"><Plus className="h-4 w-4" /> Nova Edição</Link>
          </Button>
        }
      />

      <TablePageContent>
        <TableStates isLoading={isLoading} error={fetchError} />

        <TableHeaders>
          <TableHeadersItem>Edição</TableHeadersItem>
          <TableHeadersItem>Datas</TableHeadersItem>
          <TableHeadersItem className="text-center">Vendas</TableHeadersItem>
          <TableHeadersItem className="text-center">Status</TableHeadersItem>
          <TableHeadersItem action>Ações</TableHeadersItem>
        </TableHeaders>

        {displayData.length === 0 && !isLoading ? <TableEmpty /> : (
          <TableContents>
            {displayData.map((edition) => {
              const now = new Date();
              const saleStart = new Date(edition.saleStartDate);
              const saleEnd = new Date(edition.saleEndDate);
              const isOnSale = edition.active && now >= saleStart && now <= saleEnd;
              const isSoldOut = edition.dogsSold >= edition.limitSale;
              const soldPercent = Math.min(100, Math.round((edition.dogsSold / edition.limitSale) * 100));

              return (
                <TableCardContents key={edition.id}>
                  {/* 1. EDIÇÃO */}
                  <div className="flex flex-col min-w-0">
                    <span className={cn("font-black text-sm uppercase truncate", !edition.active && "text-muted-foreground line-through")}>
                      {edition.name}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      CÓD: {edition.code} • {formatCurrency(edition.dogPrice)}/dog
                    </span>
                  </div>

                  {/* 2. DATAS */}
                  <div className="flex flex-col gap-1 border-y md:border-none py-3 md:py-0 border-dashed border-slate-100 dark:border-slate-800">
                    <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Datas</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3 text-orange-500" />
                      <span className="font-bold">Produção:</span> {formatDate(edition.productionDate)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <DollarSign className="h-3 w-3 text-green-500" />
                      <span className="font-bold">Vendas:</span> {formatDate(edition.saleStartDate)} → {formatDate(edition.saleEndDate)}
                    </div>
                  </div>

                  {/* 3. VENDAS */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Vendas</span>
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-orange-500" />
                      <span className="font-black text-sm">{edition.dogsSold}</span>
                      <span className="text-[10px] text-muted-foreground">/ {edition.limitSale}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 min-w-[80px]">
                      <div
                        className={cn("h-1.5 rounded-full transition-all", isSoldOut ? "bg-red-500" : "bg-orange-500")}
                        style={{ width: `${soldPercent}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground">{soldPercent}% vendido</span>
                  </div>

                  {/* 4. STATUS */}
                  <div className="flex flex-wrap md:justify-center gap-2">
                    <span className="md:hidden w-full text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Status</span>
                    {edition.active ? (
                      <Badge className="bg-green-100 text-green-700 text-[9px] uppercase font-black">Ativa</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[9px] uppercase font-black">Inativa</Badge>
                    )}
                    {isOnSale && <Badge className="bg-orange-500 text-white text-[9px] uppercase font-black animate-pulse">Vendendo</Badge>}
                    {isSoldOut && <Badge className="bg-red-100 text-red-700 text-[9px] uppercase font-black">Esgotado</Badge>}
                  </div>

                  {/* 5. AÇÕES */}
                  <div className="flex items-center justify-end gap-1.5">
                    <TableActions path="edicoes" id={edition.id} hideDefaultStyle hideDelete className="md:flex-none" />
                  </div>
                </TableCardContents>
              );
            })}
          </TableContents>
        )}

        <TablePagination page={page} totalPages={meta?.totalPages || 0} onPageChange={setPage} />
      </TablePageContent>
    </TablePageContainer>
  );
}
