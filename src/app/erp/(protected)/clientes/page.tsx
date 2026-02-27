// src/app/erp/(protected)/partners/page.tsx
import { CustomersPaginateAction } from "@/actions/customers/paginate.action";
import { CustomerErpTable } from "@/components/erp/tables/customers-table";
import { Suspense } from "react";
export const dynamic = 'force-dynamic'

export default async function CustomersErpPage() {
  const result = await CustomersPaginateAction();

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
        Erro ao carregar dados iniciais. Por favor, atualize a página.
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground uppercase font-black animate-pulse">Carregando...</div>}>
      <CustomerErpTable initialData={result.data} />
    </Suspense>
  );
}