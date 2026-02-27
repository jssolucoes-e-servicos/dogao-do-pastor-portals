// src/app/erp/(protected)/partners/page.tsx
import { CellsNetworksPaginateAction } from "@/actions/cells-networks/paginate.action";
import { CellsNetworksErpTable } from "@/components/erp/tables/cell-networks-table";
import { Suspense } from "react";
export const dynamic = 'force-dynamic'

export default async function SellersErpPage() {
  const result = await CellsNetworksPaginateAction();
    if (!result.success || !result.data) {
      return (
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
          Erro ao carregar dados iniciais. Por favor, atualize a página.
        </div>
      );
    }
  
    return (
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground uppercase font-black animate-pulse">Carregando...</div>}>
        <CellsNetworksErpTable initialData={result.data} />
      </Suspense>
  );
}