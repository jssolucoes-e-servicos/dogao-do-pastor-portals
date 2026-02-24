// src/app/erp/(protected)/partners/page.tsx
import { ListPartnersAllAction } from "@/actions/partners/list-partners-all.action";
import { InvitePartnerModal } from "@/components/erp/partners/invite-partner-modal";
import { PartnersTable } from "@/components/erp/tables/partners-table";
import { Suspense } from "react";

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
  // Busca inicial server-side
  const result = await ListPartnersAllAction();
  
  // No server side, se falhar, podemos passar uma array vazia ou tratar o erro
  const initialPartners = result.success ? (result.data || []) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parceiros</h2>
          <p className="text-muted-foreground">Gerencie as instituições e o fluxo de doações.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <InvitePartnerModal />
        </div>
      </div>

      {/* Exibição de erro caso a carga inicial falhe feio */}
      {!result.success && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
          Aviso: Não foi possível carregar os dados atualizados. Exibindo cache local.
        </div>
      )}

      <div className="bg-card rounded-xl border shadow-sm">
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Carregando lista de parceiros...</div>}>
          <PartnersTable initialData={initialPartners} />
        </Suspense>
      </div>
    </div>
  );
}