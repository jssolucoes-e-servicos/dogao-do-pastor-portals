// src/app/erp/partners/page.tsx
import { ListPartnersAllAction } from "@/actions/partners/list-partners-all.action";
import { InvitePartnerModal } from "@/components/erp/partners/invite-partner-modal";
import { PartnersTable } from "@/components/erp/partners/partners-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function PartnersPage() {
  // Busca inicial server-side
  const partners = await ListPartnersAllAction();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parceiros</h2>
          <p className="text-muted-foreground">Gerencie as instituições e o fluxo de doações.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <InvitePartnerModal />
          <Button asChild className="bg-orange-600 hover:bg-orange-700">
            <Link href="/erp/partners/novo">
              <Plus className="mr-2 h-4 w-4" /> Novo Cadastro
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando parceiros...</div>}>
          <PartnersTable initialData={partners} />
        </Suspense>
      </div>
    </div>
  );
}