import { DonationsCuratoryPaginateAction } from "@/actions/orders/donations-curatory-paginate.action";
import { DonationsCuratoryTable } from "@/components/erp/tables/donations-curatory-table";
import { Suspense } from "react";

export const dynamic = 'force-dynamic'

export default async function DonationsCuratoryPage() {
  const result = await DonationsCuratoryPaginateAction();
  
  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200 uppercase font-black">
        Erro ao carregar fila de análise.
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground uppercase font-black animate-pulse">Carregando fila...</div>}>
      <DonationsCuratoryTable initialData={result.data} />
    </Suspense>
  );
}