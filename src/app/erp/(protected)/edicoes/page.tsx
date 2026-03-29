import { PaginateEditionsAction } from "@/actions/editions/paginate-editions.action";
import { EditionsTable } from "@/components/erp/tables/editions-table";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function EdicoesPage() {
  const result = await PaginateEditionsAction();

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
        Erro ao carregar edições. Por favor, atualize a página.
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground uppercase font-black animate-pulse">Carregando...</div>}>
      <EditionsTable initialData={result.data} />
    </Suspense>
  );
}
