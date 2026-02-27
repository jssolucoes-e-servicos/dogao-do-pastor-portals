// src/app/erp/(protected)/redes-de-celulas/[id]/page.tsx
import { CustomersByIdAction } from "@/actions/customers/find-by-id.action";
import { CustomerViewer } from "@/components/erp/viewer/customer-viewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CellDetailsPage({ params }: Props) {
  const { id } = await params;
  const {success, data} = await CustomersByIdAction(id);

  if (!success || !data) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="dark:border-slate-800">
            <Link href="/erp/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
                <Crown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">
                    Visualizar Cliente
                </h1>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest bg-orange-50/50 dark:bg-orange-950/20 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-900/40 w-fit">
              Gestão Comercial
            </p>
          </div>
        </div>

        <Button className="bg-orange-600 dark:bg-orange-600 hover:bg-orange-700 dark:hover:bg-orange-700 font-bold uppercase gap-2 transition-colors" asChild>
          <Link href={`/erp/clientes/${id}/editar`}>
            <Edit className="h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <CustomerViewer customer={data} />
    </div>
  );
} 