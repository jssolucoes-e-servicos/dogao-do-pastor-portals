// src/components/erp/partners/partners-table/index.tsx
"use client"

import { CustomersPaginateAction } from "@/actions/customers/paginate.action";
import { CustomerEntity } from "@/common/entities";
import { StringsHelper } from "@/common/helpers/string-helpers";
import { IPaginatedData } from "@/common/interfaces";
import { TablePageContainer, TablePageContent } from '@/components/erp/shared/table-page';
import {
  TableActions,
  TableCardContents,
  TableContents,
  TableEmpty,
  TableHeaderCustom,
  TableHeaders,
  TableHeadersItem,
  TablePagination,
  TableStates
} from "@/components/erp/shared/tables";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, Fingerprint, Mail, Smartphone, User } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

interface Props {
  initialData: IPaginatedData<CustomerEntity>;
}

export function CustomerErpTable({ initialData }: Props) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState("");

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
    <TablePageContainer>
      <TableHeaderCustom 
        title="Clientes"
        description="Gerencie os clientes e seus vínculos"
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
      />

      <TablePageContent>
        <TableStates isLoading={isLoading} error={fetchError} />

        <TableHeaders cols={5}>
          <TableHeadersItem>Cliente</TableHeadersItem>
          <TableHeadersItem>Contato</TableHeadersItem>
          <TableHeadersItem className="text-center">Qualificadores</TableHeadersItem>
          <TableHeadersItem className="text-center">Cadastro</TableHeadersItem>
          <TableHeadersItem action>Ações</TableHeadersItem>
        </TableHeaders>

        {displayData.length === 0 && !isLoading ? (
          <TableEmpty />
        ) : (
          <TableContents>
            {displayData.map((customer: CustomerEntity) => {
              const dateFormatted = new Intl.DateTimeFormat('pt-BR').format(new Date(customer.createdAt));
              
              return (
                <TableCardContents key={customer.id} cols={5}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-bold text-sm uppercase truncate text-foreground leading-tight">
                        {customer.name}
                      </h3>
                      <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Fingerprint className="h-3 w-3" />
                        {customer.cpf ? StringsHelper.maskSecureCPF(customer.cpf) : "NÃO INFORMADO"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col border-y md:border-none py-3 md:py-0 border-dashed border-slate-100 dark:border-slate-800">
                    <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Contato</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Smartphone className="h-3 w-3 text-emerald-600 md:hidden" />
                      {customer.phone}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3" /> {customer.email || 'N/A'}
                    </span>
                  </div>

                  <div className="flex flex-col md:items-center gap-1.5">
                    <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Qualificadores</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-1.5", customer.knowsChurch ? "border-green-500 text-green-600" : "opacity-40")}>
                        IVC: {customer.knowsChurch ? "SIM" : "NÃO"}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-1.5", customer.allowsChurch ? "border-green-500 text-green-600" : "border-red-400 text-red-500")}>
                        CONTATO: {customer.allowsChurch ? "OK" : "NÃO"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-center">
                    <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Cliente desde</span>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs tabular-nums font-medium">{dateFormatted}</span>
                    </div>
                  </div>

                  <TableActions path="clientes" id={customer.id} />
                </TableCardContents>
              );
            })}
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