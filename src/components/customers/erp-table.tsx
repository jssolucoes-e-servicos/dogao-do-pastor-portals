// src/components/erp/partners/partners-table/index.tsx
"use client"

import { CustomersListAction } from "@/actions/customers/list.action";
import { CustomerEntity } from "@/common/entities";
import { StringsHelper } from "@/common/helpers/string-helpers";
import { IPaginatedData } from "@/common/interfaces";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronLeft, ChevronRight, Edit, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

interface Props {
  initialData: IPaginatedData<CustomerEntity>;
}

export function CustomerErpTable({ initialData }: Props) {
  const [page, setPage] = useState<number>(1);

  // Correção da chave do SWR: deve ser um array para reagir à mudança da 'page'
  const { data: response, isLoading } = useSWR(
    [`customers-list`, page], 
    () => CustomersListAction(page), 
    {
      fallbackData: { success: true, data: initialData },
      keepPreviousData: true,
      revalidateOnFocus: true
    }
  );

  const displayData = response?.data?.data || [];
  const meta = response?.data?.meta;
  const fetchError = response?.success === false ? response.error : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border relative bg-card shadow-sm">
        {isLoading && (
          <div className="absolute top-2 right-2 z-10">
            <Loader2 className="h-4 w-4 animate-spin text-orange-500 opacity-50" />
          </div>
        )}

        {fetchError && (
          <div className="p-4 text-xs text-red-600 bg-red-50 border-b flex items-center gap-2">
            <AlertCircle className="h-3 w-3" />
            Erro ao atualizar: {fetchError}
          </div>
        )}

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

      {/* Paginação Estilizada */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-muted-foreground">
          <span className="text-[12px] font-medium italic">
            Página {page} de {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
              disabled={page === 1 || isLoading}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
              disabled={page === meta.totalPages || isLoading}
              onClick={() => setPage(p => p + 1)}
            >
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}