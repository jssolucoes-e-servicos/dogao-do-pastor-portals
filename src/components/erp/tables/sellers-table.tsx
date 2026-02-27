// src/components/erp/partners/partners-table/index.tsx
"use client"

import { SellersPaginateAction } from "@/actions/sellers/paginate.action";
import { SellerEntity } from "@/common/entities";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { IPaginatedData } from "@/common/interfaces";
import { TablePagination } from "@/components/erp/shared/table-pagination";
import { TableStates } from "@/components/erp/shared/table-states";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Edit, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { TableHeaderCustom } from "../shared/table-header-custom";

interface Props {
  initialData: IPaginatedData<SellerEntity>;
}

export function SellersErpTable({ initialData }: Props) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState("");

  // Correção da chave do SWR: deve ser um array para reagir à mudança da 'page'
  const { data: response, isLoading } = useSWR(
    [`sellers-list`, page, search], 
    () => SellersPaginateAction(page, search), 
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
            title="Vendedores"
            description="Gerencie os vendedores cadastrados"
            onSearch={(val) => {
              setSearch(val);
              setPage(1);
            }}
            buttonLabel="Novo Vendedor"
            buttonHref="/erp/vendedor/novo"
          />
      <div className="flex flex-col gap-4">
        <div className="rounded-md border relative bg-card shadow-sm">
          <TableStates isLoading={isLoading} error={fetchError} />

          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="py-3">
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-xs uppercase text-foreground">Vendedor</span>
                    <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider">Telefone</span>
                  </div>
                </TableHead>
                <TableHead className="py-3">
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-xs uppercase text-foreground">TAG (link)</span>
                    <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider">Usuário sistema</span>
                  </div>
                </TableHead>
                <TableHead className="py-3">
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-xs uppercase text-foreground">Célula</span>
                    <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider">Líder</span>
                  </div>
                </TableHead>
                <TableHead className="text-right font-bold text-xs uppercase text-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 opacity-20" />
                      <p>Nenhum vendedor encontrado.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((seller) => {
                  const dateFormatted = new Intl.DateTimeFormat('pt-BR').format(new Date(seller.createdAt));

                  return (
                    <TableRow key={seller.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm leading-tight text-foreground">
                              {seller.name}
                            </span>
                            <span className="text-[12px] text-muted-foreground uppercase font-medium mt-0.5">
                              {seller.contributor?.phone ? 
                              NumbersHelper.maskPhone(seller.contributor?.phone) :
                              "SEM TELEFONE"}
                            </span>
                          </div>
                
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-medium">
                            {seller.tag ? seller.tag : "NÃO ENCONTRADA"}
                          </span>
                          <span className="text-[12px] text-muted-foreground">{seller.contributor.username}</span>
                        </div> 
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-medium">
                            {seller.cell?.name ? seller.cell.name : "NÃO VINCULADO"}
                          </span>
                          <span className="text-[12px] text-muted-foreground">{seller.cell?.leader?.name}</span>
                        </div> 
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" title="Visualizar" asChild>
                            <Link href={`/erp/vendedores/${seller.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100" title="Editar" asChild>
                            <Link href={`/erp/vendedores/${seller.id}/editar`}>
                              <Edit className="h-4 w-4" />
                            </Link>
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
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
}