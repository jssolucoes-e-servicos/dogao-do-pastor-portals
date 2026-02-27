// src/components/erp/partners/partners-table/index.tsx
"use client"

import { CustomersPaginateAction } from "@/actions/customers/paginate.action";
import { CustomerEntity } from "@/common/entities";
import { StringsHelper } from "@/common/helpers/string-helpers";
import { IPaginatedData } from "@/common/interfaces";
import { TablePagination } from "@/components/erp/shared/table-pagination";
import { TableStates } from "@/components/erp/shared/table-states";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AlertCircle, Edit, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { TableHeaderCustom } from "../shared/table-header-custom";

interface Props {
  initialData: IPaginatedData<CustomerEntity>;
}

export function CustomerErpTable({ initialData }: Props) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState("");

  // Correção da chave do SWR: deve ser um array para reagir à mudança da 'page'
  const { data: response, isLoading } = useSWR(
    [`customers-list`, page, search], 
    () => CustomersPaginateAction(page, search), 
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
            title="Clientes"
            description="Gerencie os clientes"
            onSearch={(val) => {
              setSearch(val);
              setPage(1);
            }}
            /* buttonLabel="Novo Cliente"
            buttonHref="/erp/clientes/novo" */
          />
      <div className="flex flex-col gap-4">
        <div className="rounded-md border relative bg-card shadow-sm">
          <TableStates isLoading={isLoading} error={fetchError} />

          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase text-foreground">Nome</TableHead>
                <TableHead className="font-bold text-xs uppercase text-foreground">Contato</TableHead>
                <TableHead className="font-bold text-xs uppercase text-foreground text-center">Qualificador</TableHead>
                <TableHead className="font-bold text-xs uppercase text-foreground text-center">Cliente desde</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase text-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 opacity-20" />
                      <p>Nenhum cliente encontrado.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((customer) => {
                  const dateFormatted = new Intl.DateTimeFormat('pt-BR').format(new Date(customer.createdAt));

                  return (
                    <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
              
                          <div className="flex flex-col">
                            <span className="font-bold text-sm leading-tight text-foreground">
                              {customer.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">
                              CPF: {customer.cpf ? StringsHelper.maskSecureCPF(customer.cpf) : "NÃO INFORMADO"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-medium">{customer.phone}</span>
                          <span className="text-[11px] text-muted-foreground">{customer.email}</span>
                        </div> 
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1 text-[11px]">
                          <div className="flex gap-1">
                            <span className="text-muted-foreground italic">Conhece a IVC:</span>
                            <span className={cn("font-bold uppercase", customer.knowsChurch ? "text-green-600" : "text-red-600")}>
                              {customer.knowsChurch ? "Sim" : "Não"}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <span className="text-muted-foreground italic">Permite contato:</span>
                            <span className={cn("font-bold uppercase", customer.allowsChurch ? "text-green-600" : "text-red-600")}>
                              {customer.allowsChurch ? "Sim" : "Não"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <span className="text-sm tabular-nums text-muted-foreground font-medium">
                          {dateFormatted}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" title="Visualizar" asChild>
                            <Link href={`/erp/clientes/${customer.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100" title="Editar" asChild>
                            <Link href={`/erp/clientes/${customer.id}/editar`}>
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