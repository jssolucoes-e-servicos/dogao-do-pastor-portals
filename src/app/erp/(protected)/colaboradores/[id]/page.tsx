// src/app/erp/(protected)/partners/[id]/page.tsx
import { ContributorsByIdAction } from "@/actions/contributors/find-by-id.action";
import { ContributorViewer } from "@/components/erp/viewer/contributor-viewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ContributorDetailsPage({ params }: Props) {
  const { id } = await params;
  const {success, data} = await ContributorsByIdAction(id);

  if (!success || !data) {
    return notFound();
  }
  return (
    <div className="flex flex-col gap-6 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/erp/colaboradores">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">
              Perfil do Colaborador
            </h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
              Visualização Detalhada
            </p>
          </div>
        </div>

        <Button className="bg-orange-600 hover:bg-orange-700 font-bold uppercase gap-2" asChild>
          <Link href={`/erp/colaboradores/${id}/editar`}>
            <Edit className="h-4 w-4" />
            Editar Dados
          </Link>
        </Button>
      </div>

      <ContributorViewer contributor={data} />
    </div>
  );
}