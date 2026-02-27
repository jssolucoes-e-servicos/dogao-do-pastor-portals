// src/app/erp/(protected)/partners/page.tsx
import { PartnersPaginateAction } from "@/actions/partners/paginate.action";
import { PartnersTable } from "@/components/erp/tables/partners-table";
import { Suspense } from "react";

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {

  const result = await PartnersPaginateAction();
  
  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
        Erro ao carregar dados iniciais. Por favor, atualize a página.
      </div>
    );
  }


  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground uppercase font-black animate-pulse">Carregando...</div>}>
      <PartnersTable initialData={result.data} />
       {/*   <div className="flex items-center gap-3">
          <InvitePartnerModal />
        </div> */}
    </Suspense>
  );
}