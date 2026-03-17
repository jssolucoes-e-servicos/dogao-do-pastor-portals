// src/app/erp/(protected)/partners/[id]/page.tsx
import { ContributorsByIdAction } from "@/actions/contributors/find-by-id.action";
import { ContributorViewer } from "@/components/erp/viewer/contributor-viewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Lock } from "lucide-react";
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

        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-bold border-slate-200 dark:border-slate-800 uppercase gap-2 rounded-xl h-11" asChild>
            <Link href={`/erp/colaboradores/${id}/permissoes`}>
              <Lock className="h-4 w-4 text-orange-600" />
              Gestão de Acessos
            </Link>
          </Button>
          <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white font-bold uppercase gap-2 rounded-xl h-11 shadow-lg shadow-slate-900/10" asChild>
            <Link href={`/erp/colaboradores/${id}/editar`}>
              <Edit className="h-4 w-4" />
              Editar Dados
            </Link>
          </Button>
        </div>
      </div>

      <ContributorViewer contributor={data} />
    </div>
  );
}