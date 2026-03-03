"use client"

import { Clock, Search, ShieldAlert, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { OrdersAnalysisPaginateAction } from "@/actions/orders/analysis-paginate.action";
import { ResultAnalysisAction } from "@/actions/orders/result-analysis.action";
import { OrderEntity } from "@/common/entities";
import { IPaginatedData } from "@/common/interfaces";
import { AnalysisModal } from "@/components/erp/modals/analysis-modal";
import { TablePageContainer, TablePageContent } from '@/components/erp/shared/table-page';
import {
  TableCardContents, TableContents, TableEmpty, TableHeaderCustom,
  TableHeaders, TableHeadersItem, TablePagination, TableStates
} from "@/components/erp/shared/tables";
import { Button } from "@/components/ui/button";

interface Props {
  initialData: IPaginatedData<OrderEntity>;
}

export function OrdersAnalysisErpTable({ initialData }: Props) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderEntity | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: response, isLoading, mutate } = useSWR(
    [`orders-analysis-list`, page, search], 
    () => OrdersAnalysisPaginateAction(page, search), 
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

  const handleProcess = async (approved: boolean, observations: string) => {
    if (!selectedOrder) return;
    setIsProcessing(true);

    const res = await ResultAnalysisAction(
      {
        orderId: selectedOrder.id,
        approved: approved,
        observations: observations
      }
      
    );

    if (res.success) {
      toast.success(approved ? "Pedido aprovado com sucesso!" : "Pedido retornado para correção.");
      mutate();
      setSelectedOrder(null);
    } else {
      toast.error(res.error || "Erro ao processar.");
    }
    setIsProcessing(false);
  };

  return (
    <TablePageContainer>
      <TableHeaderCustom 
        title="Fila de Análise"
        description="Validar novos cadastros e pedidos em conferência"
        onSearch={(val) => { setSearch(val); setPage(1); }}
      />

      <TablePageContent>
        <TableStates isLoading={isLoading} error={fetchError} />

        <TableHeaders>
          <TableHeadersItem>Cliente / Cadastro</TableHeadersItem>
          <TableHeadersItem>Valor Bruto</TableHeadersItem>
          <TableHeadersItem>Data/Hora</TableHeadersItem>
          <TableHeadersItem action>Ações</TableHeadersItem>
        </TableHeaders>

        {displayData.length === 0 && !isLoading ? <TableEmpty /> : (
          <TableContents>
            {displayData.map((order) => (
              <TableCardContents key={order.id}>
                {/* 1. CLIENTE */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg shrink-0">
                    <User className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-foreground uppercase truncate">{order.customerName}</span>
                    <span className="text-[10px] text-muted-foreground font-black uppercase flex items-center gap-1">
                      <ShieldAlert className="h-2.5 w-2.5" /> Aguardando Validação
                    </span>
                  </div>
                </div>

                {/* 2. VALOR */}
                <div className="flex flex-col">
                  <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1">Total</span>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                    R$ {order.totalValue.toFixed(2)}
                  </span>
                </div>

                {/* 3. DATA */}
                <div className="flex flex-col">
                  <span className="md:hidden text-[9px] font-black text-muted-foreground uppercase mb-1">Solicitado em</span>
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {new Date(order.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>

                {/* BOTÃO ANALISAR */}
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    className="h-8 bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase px-4 gap-2"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Search className="h-3 w-3" /> Analisar
                  </Button>
                </div>
              </TableCardContents>
            ))}
          </TableContents>
        )}

        <TablePagination page={page} totalPages={meta?.totalPages || 0} onPageChange={setPage} />
      </TablePageContent>

      <AnalysisModal 
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        isProcessing={isProcessing}
        onConfirm={handleProcess}
      />
    </TablePageContainer>
  );
}