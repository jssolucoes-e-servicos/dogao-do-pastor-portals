// src/components/erp/partners/partners-table/index.tsx
"use client"

import { ListPartnersAllAction } from "@/actions/partners/list-partners-all.action";
import { PartnerEntity } from "@/common/entities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Certifique-se de ter instalado o componente
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Clock, Edit, Eye, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { InvitePartnerModal } from "./invite-partner-modal";

interface Props {
  initialData: PartnerEntity[];
}

export function PartnersTable({ initialData }: Props) {
  const { data: response, isLoading } = useSWR(`partners-list`, () => ListPartnersAllAction(), {
    fallbackData: { success: true, data: initialData },
    revalidateOnFocus: true
  });

  const displayData = response?.data || initialData;
  const fetchError = response?.success === false ? response.error : null;

  return (
    <div className="rounded-md border relative">
      {isLoading && (
        <div className="absolute top-2 right-2 z-10">
          <Loader2 className="h-4 w-4 animate-spin text-orange-500 opacity-50" />
        </div>
      )}

      {fetchError && (
        <div className="p-4 text-xs text-red-600 bg-red-50 border-b flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          Erro ao atualizar dados: {fetchError}
        </div>
      )}

      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-bold text-xs uppercase">Instituição</TableHead>
            <TableHead className="font-bold text-xs uppercase">Responsável</TableHead>
            <TableHead className="font-bold text-xs uppercase text-center">Status</TableHead>
            <TableHead className="font-bold text-xs uppercase text-center">Aprovação</TableHead>
            <TableHead className="text-right font-bold text-xs uppercase">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8 opacity-20" />
                  <p>Nenhum parceiro encontrado.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            displayData.map((partner) => {
              const isInviteOnly = partner.name?.includes("Parceiro temporário") || !partner.responsibleName;
              const hasCompletedRegistration = !!partner.responsibleName && !partner.name?.includes("Parceiro temporário");
              const initials = partner.name
                ? partner.name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().substring(0, 2)
                : "??";

              return (
                <TableRow key={partner.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">

                      <Avatar className="h-9 w-9 border border-orange-100 shadow-sm">
                        <AvatarImage src={partner.logo} alt={partner.name} className="object-cover" />
                        <AvatarFallback className="bg-orange-600 text-white font-bold text-[10px]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col">
                        <span className={cn(
                          "font-bold text-sm leading-tight",
                          isInviteOnly ? "text-orange-600/70 italic" : "text-foreground"
                        )}>
                          {partner.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">
                          CNPJ: {partner.cnpj}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {partner.responsibleName ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{partner.responsibleName}</span>
                        <span className="text-[10px] text-muted-foreground">{partner.responsiblePhone || partner.phone}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Link enviado...
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge 
                      variant={partner.active ? "default" : "secondary"}
                      className={cn(
                        "font-semibold text-[10px] uppercase",
                        partner.active ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : ""
                      )}
                    >
                      {partner.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      {partner.approved ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1 text-[10px] uppercase">
                          <CheckCircle2 size={12} /> Aprovado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-500 text-orange-600 gap-1 animate-pulse text-[10px] uppercase">
                          <Clock size={12} /> Pendente
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {!partner.approved && (
                        <InvitePartnerModal partner={partner} mode="resend" />
                      )}

                      {!isInviteOnly && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Visualizar" asChild>
                            <Link href={`/erp/parceiros/${partner.id}`}>
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Link>
                          </Button>

                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar" asChild>
                            <Link href={`/erp/partners/${partner.id}/editar`}>
                              <Edit className="h-4 w-4 text-slate-600" />
                            </Link>
                          </Button>
                        </>
                      )}

                      {!hasCompletedRegistration && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" title="Excluir Convite">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}