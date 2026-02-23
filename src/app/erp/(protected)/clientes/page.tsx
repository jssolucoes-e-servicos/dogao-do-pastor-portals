// src/app/erp/(protected)/partners/page.tsx
import { CustomersListAction } from "@/actions/customers/list.action";
import { CustomerErpTable } from "@/components/customers/erp-table";
import { Suspense } from "react";
export const dynamic = 'force-dynamic'

export default async function CustomersErpPage() {
  const result = await CustomersListAction();
  //const initialData = result.success ? (result.data) : [];
  const initialData = result.data!
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">Gerenciamento de clientes.</p>
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
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando clientes...</div>}>
          <CustomerErpTable initialData={initialData} />
        </Suspense>
      </div>
    </div>
  );
}