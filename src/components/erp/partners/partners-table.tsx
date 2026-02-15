"use client"

import { PartnerEntity } from "@/common/entities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Clock, Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { InvitePartnerModal } from "./invite-partner-modal";

interface Props {
  initialData: PartnerEntity[];
}

export function PartnersTable({ initialData }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-bold">Instituição / Nome Fantasia</TableHead>
            <TableHead className="font-bold">Responsável</TableHead>
            <TableHead className="font-bold text-center">Status</TableHead>
            <TableHead className="font-bold text-center">Aprovação</TableHead>
            <TableHead className="text-right font-bold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8 opacity-20" />
                  <p>Nenhum parceiro cadastrado.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            initialData.map((partner) => {
              const isInvitePending = partner.name.includes("Parceiro temporário");

              return (
                <TableRow key={partner.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-bold",
                        isInvitePending ? "text-orange-600/70 italic" : "text-foreground"
                      )}>
                        {partner.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">
                        CNPJ: {partner.cnpj}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {partner.responsibleName ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{partner.responsibleName}</span>
                        <span className="text-xs text-muted-foreground">{partner.phone}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded">
                        Aguardando preenchimento...
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge 
                      variant={partner.active ? "default" : "secondary"}
                      className={cn(
                        "font-semibold",
                        partner.active ? "bg-green-100 text-green-700 hover:bg-green-100" : ""
                      )}
                    >
                      {partner.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      {partner.approved ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1">
                          <CheckCircle2 size={12} /> Aprovado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-500 text-orange-600 gap-1 animate-pulse">
                          <Clock size={12} /> Pendente
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* Se o convite está pendente, mostramos o botão de Reenvio (Modal) */}
                      {isInvitePending && (
                        <InvitePartnerModal partner={partner} mode="resend" />
                      )}

                      <Button variant="ghost" size="icon" title="Visualizar" asChild>
                        <Link href={`/erp/partners/${partner.id}`}>
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" size="icon" title="Editar" asChild>
                        <Link href={`/erp/partners/${partner.id}/editar`}>
                          <Edit className="h-4 w-4 text-slate-600" />
                        </Link>
                      </Button>

                      <Button variant="ghost" size="icon" title="Excluir" className="hover:bg-red-50">
                        <Trash2 className="h-4 w-4 text-red-500" />
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
  );
}