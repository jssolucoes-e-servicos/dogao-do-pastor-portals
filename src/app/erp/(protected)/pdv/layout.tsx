import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { FetchCtx } from "@/common/enums";

const PDV_ROLES = ['IT', 'ADMIN', 'RECEPTION', 'PDV'];

export default async function PdvLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  let user: { roles?: string[] } | null = null;
  try {
    const raw = cookieStore.get("ddp-ctb-01")?.value;
    if (raw) user = JSON.parse(decodeURIComponent(raw));
  } catch { /* ignore */ }

  const roles: string[] = (user?.roles || []).map((r: string) => r.toUpperCase());
  const isMaster = roles.some(r => ['IT', 'ADMIN'].includes(r));
  const hasPdvRole = isMaster || roles.some(r => PDV_ROLES.includes(r));

  if (!hasPdvRole) {
    redirect('/erp?blocked=pdv-role');
  }

  // Superusuários sempre têm acesso
  if (isMaster) return <>{children}</>;

  // Verifica flag pdv_enabled via SystemConfig
  let pdvEnabled = false;
  try {
    const res = await fetchApi(FetchCtx.ERP, '/permissions/system-config/pdv_enabled');
    pdvEnabled = res?.value === 'true';
  } catch {
    pdvEnabled = false;
  }
  if (!pdvEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="text-6xl">🔒</div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">
            PDV Indisponível
          </h2>
          <p className="text-slate-500 font-bold mt-2 uppercase text-sm tracking-widest">
            O ponto de venda não está habilitado no momento
          </p>
          <p className="text-orange-600 font-black mt-3 text-sm">
            Aguarde a liberação pelo administrador
          </p>
        </div>
        <a href="/erp" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition-colors">
          ← Voltar ao Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
