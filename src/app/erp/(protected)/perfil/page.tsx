// src/app/(erp)/erp/perfil/page.tsx

import { ContributorsByIdAction } from "@/actions/contributors/find-by-id.action";
import { ProfileDetails } from "@/components/erp/profile/profile-details";
import { ProfileHeader } from "@/components/erp/profile/profile-header";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("ddp-ctb-01")?.value;

  if (!userDataCookie) redirect("/erp/acesso");

  let sessionUser;
  try {
    sessionUser = JSON.parse(decodeURIComponent(userDataCookie));
  } catch (e) {
    redirect("/erp/acesso");
  }

  // Buscamos dados atualizados do banco via action
  const response = await ContributorsByIdAction(sessionUser.id);
  const contributor = response.data;

  if (!contributor) {
    return <div className="p-8 text-center">Colaborador não encontrado.</div>;
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-5xl mx-auto">
      <ProfileHeader contributor={contributor} />
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ProfileDetails contributor={contributor} />
        </div>
        
        <div className="flex flex-col gap-6">
          {/* Espaço para cards de resumo de conexões ou status */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-card shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-4">Vínculos Ativos</h4>
            <div className="space-y-3">
              <BadgeLink label="Vendedor" active={contributor.sellers && contributor.sellers.length > 0 ? true : false} />
              <BadgeLink label="Líder de Célula" active={contributor.cells && contributor.cells.length > 0 ? true : false} />
              <BadgeLink label="Entregador" active={contributor.deliveryPersons && contributor.deliveryPersons.length > 0 ? true : false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgeLink({ label, active }: { label: string, active: boolean }) {
  return (
    <div className={`flex justify-between items-center text-xs font-bold px-3 py-2 rounded-lg border ${active ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'}`}>
      <span className="uppercase">{label}</span>
      <span>{active ? "ATIVO" : "INATIVO"}</span>
    </div>
  );
}