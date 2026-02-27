// src/app/erp/(protected)/partners/page.tsx
import { CellsPaginateAction } from "@/actions/cells/paginate.action";
import { CellsErpTable } from "@/components/erp/tables/cells-table";
import { Suspense } from "react";
export const dynamic = 'force-dynamic'

export default async function CellsErpPage() {
  const result = await CellsPaginateAction();

    if (!result.success || !result.data) {
      return (
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
          Erro ao carregar dados iniciais. Por favor, atualize a página.
        </div>
      );
    }
  
    return (
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground uppercase font-black animate-pulse">Carregando...</div>}>
        <CellsErpTable initialData={result.data} />
      </Suspense>
  );
}