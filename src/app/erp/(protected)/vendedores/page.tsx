// src/app/erp/(protected)/partners/page.tsx
import { SellersListAction } from "@/actions/sellers/list.action";
import { SellersErpTable } from "@/components/erp/tables/sellers-table";
import { Suspense } from "react";
export const dynamic = 'force-dynamic'

export default async function SellersErpPage() {
  const result = await SellersListAction();
  //const initialData = result.success ? (result.data) : [];
  const initialData = result.data!
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendedores</h2>
          <p className="text-muted-foreground">Gerenciamento de vendedores.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* <Button asChild className="bg-orange-600 hover:bg-orange-700">
            <Link href="/erp/partners/novo">
              <Plus className="mr-2 h-4 w-4" /> Novo Cadastro
            </Link>
          </Button> */}
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando vendedores...</div>}>
          <SellersErpTable initialData={initialData} />
        </Suspense>
      </div>
    </div>
  );
}