// src/app/erp/(protected)/partners/page.tsx
import { ContributorsPaginateAction } from "@/actions/contributors/paginate.action";
import { ContributorsErpTable } from "@/components/erp/tables/contributors-table";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function SellersErpPage() {
  const result = await ContributorsPaginateAction();
  

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
        Erro ao carregar dados iniciais. Por favor, atualize a página.
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground uppercase font-black animate-pulse">Carregando...</div>}>
      <ContributorsErpTable initialData={result.data} />
    </Suspense>
  );
}