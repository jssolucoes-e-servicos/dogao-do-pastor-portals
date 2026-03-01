// src/components/erp/tables/partners-table.tsx
"use client"

import { PartnersPaginateAction } from "@/actions/partners/paginate.action";
import { PartnerEntity } from "@/common/entities";
import { IPaginatedData } from "@/common/interfaces";
import { InvitePartnerModal } from "@/components/erp/partners/invite-partner-modal";
import { TablePageContainer, TablePageContent } from '@/components/erp/shared/table-page';
import { TableActions, TableCardContents, TableContents, TableEmpty, TableHeaderCustom, TableHeaders, TableHeadersItem, TablePagination, TableStates } from "@/components/erp/shared/tables";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Trash2 } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

interface Props {
  initialData: IPaginatedData<PartnerEntity>;
}

export function PartnersTable({ initialData }: Props) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState("");

  const { data: response, isLoading } = useSWR([`partners-list`, page, search], () => PartnersPaginateAction(page, search), {
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
        title="Parceiros"
        description="Gerencie os parceiros cadastrados"
        onSearch={(val) => { setSearch(val); setPage(1); }}
        actionButton={<InvitePartnerModal />}
      />

      <TablePageContent>
        <TableStates isLoading={isLoading} error={fetchError} />

        <TableHeaders>
          <TableHeadersItem>Instituição</TableHeadersItem>
          <TableHeadersItem>Responsável</TableHeadersItem>
          <TableHeadersItem className="text-center">Status / Aprovação</TableHeadersItem>
          <TableHeadersItem action>Ações</TableHeadersItem>
        </TableHeaders>

        {displayData.length === 0 && !isLoading ? <TableEmpty /> : (
          <TableContents>
            {displayData.map((partner) => {
              const isInviteOnly = partner.name?.includes("Parceiro temporário") || !partner.responsibleName;
              const hasCompletedRegistration = !!partner.responsibleName && !partner.name?.includes("Parceiro temporário");
              const initials = partner.name ? partner.name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().substring(0, 2) : "??";

              return (
                <TableCardContents key={partner.id}>
                  {/* 1. INSTITUIÇÃO */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 border border-orange-100 shadow-sm shrink-0">
                      <AvatarImage src={partner.logo} alt={partner.name} className="object-cover" />
                      <AvatarFallback className="bg-orange-600 text-white font-bold text-[10px]">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className={cn("font-bold text-sm uppercase truncate", isInviteOnly ? "text-orange-600/70 italic" : "text-foreground")}>
                        {partner.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">CNPJ: {partner.cnpj}</span>
                    </div>
                  </div>

                  {/* 2. RESPONSÁVEL */}
                  <div className="flex flex-col border-y md:border-none py-3 md:py-0 border-dashed border-slate-100 dark:border-slate-800">
                    <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Responsável</span>
                    {partner.responsibleName ? (
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{partner.responsibleName}</span>
                        <span className="text-[10px] text-muted-foreground">{partner.responsiblePhone || partner.phone}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-orange-400 italic font-bold uppercase">Aguardando Cadastro...</span>
                    )}
                  </div>

                  {/* 3. STATUS / APROVAÇÃO */}
                  <div className="flex flex-wrap md:justify-center gap-2">
                    <span className="md:hidden w-full text-[9px] font-black text-muted-foreground uppercase mb-1 opacity-70">Situação</span>
                    <Badge variant={partner.active ? "default" : "secondary"} className={cn("text-[9px] uppercase font-black", partner.active ? "bg-green-100 text-green-700" : "")}>
                      {partner.active ? "Ativo" : "Inativo"}
                    </Badge>
                    {partner.approved ? (
                      <Badge className="bg-emerald-500 gap-1 text-[9px] uppercase font-black"><CheckCircle2 size={10} /> Aprovado</Badge>
                    ) : (
                      <Badge variant="outline" className="border-orange-500 text-orange-600 gap-1 animate-pulse text-[9px] uppercase font-black"><Clock size={10} /> Pendente</Badge>
                    )}
                  </div>

                  {/* 4. AÇÕES CUSTOMIZADAS */}
                  <div className="flex items-center justify-end gap-1.5">
                    {!partner.approved && <InvitePartnerModal partner={partner} mode="resend" />}
                    
                    {!isInviteOnly && <TableActions path="parceiros" id={partner.id} hideDefaultStyle className="md:flex-none" />}
                    
                    {!hasCompletedRegistration && (
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full" title="Excluir Convite">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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