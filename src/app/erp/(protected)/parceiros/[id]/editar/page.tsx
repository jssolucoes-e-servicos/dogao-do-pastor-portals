// src/app/erp/(protected)/partners/[id]/editar/page.tsx
import { GetByIdAction } from "@/actions/partners/get-by-id.action";
import { PartnerUpdateForm } from "@/components/partners/partner-update-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditPartnerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPartnerPage({ params }: EditPartnerPageProps) {
  const { id } = await params;
  
  // Busca os dados do parceiro no servidor
  const partner = await GetByIdAction(id);

  // Se o parceiro não existir ou se tentarem editar um convite que ainda não virou parceiro real 
  // (caso você queira restringir ainda mais via servidor)
  if (!partner) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-10">
      {/* Header da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
            <Link href="/erp/parceiros">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-slate-800">
              Editar Cadastro
            </h2>
            <p className="text-muted-foreground text-sm font-medium">
              Ajuste as informações da instituição e controle o acesso ao sistema.
            </p>
          </div>
        </div>

        <div className="hidden md:block">
          <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 border uppercase">
            ID: {partner.id}
          </span>
        </div>
      </div>

      {/* Formulário Reutilizado com Poderes de Admin */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PartnerUpdateForm 
          partnerId={partner.id} 
          initialData={partner} 
          isEdit={true} 
          isAdmin={true} // 🔥 Aqui liberamos os Switches de Active e Approved
        />
      </div>
    </div>
  );
}