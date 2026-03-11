"use client"

import { DonationsCuratoryPaginateAction } from "@/actions/orders/donations-curatory-paginate.action";
import { OrderEntity } from "@/common/entities";
import { IPaginatedData } from "@/common/interfaces";
import { DonationAnalysisModal } from "@/components/erp/modals/donation-analysis-modal";
import { TablePageContainer, TablePageContent } from '@/components/erp/shared/table-page';
import {
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Gift, MessageSquare, Search, Send, User } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

interface Props {
  initialData: IPaginatedData<OrderEntity>;
}

export function DonationsCuratoryTable({ initialData }: Props) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderEntity | null>(null);

  const { data: response, isLoading, mutate } = useSWR(
    [`donations-curatory-list`, page, search], 
    () => DonationsCuratoryPaginateAction(page, search), 
    {
      fallbackData: { success: true, data: initialData },
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const displayData = response?.data?.data || [];
  const meta = response?.data?.meta;
  const fetchError = response?.success === false ? response.error : null;

  return (
    <TablePageContainer>
      <TableHeaderCustom 
        title="Curadoria de Doações"
        description="Gestão de indicações e vínculos de novas entidades parceiras"
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
      />

      <TablePageContent>
        <TableStates isLoading={isLoading} error={fetchError} />

        <TableHeaders cols={5}>
          <TableHeadersItem>Doador / Data</TableHeadersItem>
          <TableHeadersItem>Indicação & Fluxo</TableHeadersItem>
          <TableHeadersItem className="text-center">Volume</TableHeadersItem>
          <TableHeadersItem className="text-center">Pagamento</TableHeadersItem>
          <TableHeadersItem action>Ações</TableHeadersItem>
        </TableHeaders>

        {displayData.length === 0 && !isLoading ? (
          <TableEmpty />
        ) : (
          <TableContents>
            {displayData.map((order: OrderEntity) => {
              const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
              }).format(new Date(order.createdAt));

              // Identificadores de Status no Texto
              const hasInvite = order.observations?.includes("[PARTNER_ID]");
              const isLinked = order.observations?.includes("SUCESSO");

              return (
                <TableCardContents key={order.id} cols={5} className="hover:bg-orange-50/20 transition-colors">
                  {/* 1. DOADOR */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 rounded-full items-center justify-center border",
                      isLinked ? "bg-emerald-100 border-emerald-200 text-emerald-600" : "bg-orange-100 border-orange-200 text-orange-600"
                    )}>
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-black text-xs uppercase truncate text-foreground">
                        {order.customerName}
                      </h3>
                      <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 mt-0.5 uppercase tracking-tighter">
                        <Clock className="h-3 w-3" />
                        {dateFormatted}
                      </span>
                    </div>
                  </div>

                  {/* 2. INDICAÇÃO / STATUS DO FLUXO */}
                  <div className="flex flex-col py-2 md:py-0">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className={cn(
                          "text-[10px] font-bold uppercase truncate max-w-[180px]",
                          order.observations ? "text-slate-700 dark:text-slate-300" : "text-muted-foreground italic opacity-50"
                        )}>
                          {order.observations?.split('\n')[0] || "SEM INDICAÇÃO (IVC DECIDE)"}
                        </span>
                      </div>
                      
                      <div className="flex gap-1 flex-wrap">
                        {isLinked ? (
                          <Badge className="bg-emerald-500 text-white text-[8px] font-black uppercase border-none h-4 px-1.5">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Vinculado
                          </Badge>
                        ) : hasInvite ? (
                          <Badge className="bg-blue-500 text-white text-[8px] font-black uppercase border-none h-4 px-1.5">
                            <Send className="h-2.5 w-2.5 mr-1" /> Convite Enviado
                          </Badge>
                        ) : order.observations && (
                          <Badge variant="outline" className="text-[8px] font-black uppercase border-orange-200 text-orange-600 h-4 px-1.5">
                            Nova Indicação
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. VOLUME */}
                  <div className="flex flex-col md:items-center">
                    <div className="flex items-center gap-1.5">
                      <Gift className="h-3.5 w-3.5 text-orange-600" />
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {order.items?.length || 0} DOGS
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground tabular-nums tracking-tighter">
                      R$ {order.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* 4. STATUS FINANCEIRO */}
                  <div className="flex flex-col md:items-center">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] font-black uppercase px-2 h-5 border-2",
                        order.paymentStatus === 'PAID' 
                          ? "border-emerald-500/20 text-emerald-600 bg-emerald-50" 
                          : "border-amber-400/20 text-amber-500 bg-amber-50"
                      )}
                    >
                      {order.paymentStatus === 'PAID' ? "PAGO" : "PENDENTE"}
                    </Badge>
                  </div>

                  {/* 5. AÇÕES */}
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={cn(
                        "h-8 border-2 font-black text-[10px] uppercase px-3 gap-2 transition-all",
                        hasInvite && !isLinked 
                          ? "border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100" 
                          : "border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600"
                      )}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Search className="h-3.5 w-3.5" /> 
                      {isLinked ? "Ver Detalhes" : hasInvite ? "Ver Convite" : "Analisar"}
                    </Button>
                  </div>
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

      <DonationAnalysisModal 
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </TablePageContainer>
  );
}