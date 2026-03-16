// src/components/erp/profile/profile-permissions.tsx
import { ContributorEntity } from "@/common/entities";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export function ProfilePermissions({ contributor }: { contributor: ContributorEntity }) {
  const roles = contributor.userRoles?.map(ur => ur.role?.name).filter(Boolean) || [];
  const permissions = contributor.permissions || [];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-card overflow-hidden h-full">
      <div className="bg-muted/50 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-black uppercase tracking-wider">Perfis e Módulos Liberados</h3>
      </div>
      
      <div className="p-5 space-y-6">
        {/* Roles Section */}
        <div className="space-y-3">
          <span className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3" /> Perfis Atribuídos
          </span>
          <div className="flex flex-wrap gap-2">
            {contributor.userRoles && contributor.userRoles.length > 0 ? contributor.userRoles.map((ur, i) => (
              <span key={i} className="bg-orange-50 text-orange-700 border border-orange-100 px-2 py-1 rounded text-[10px] font-bold uppercase">
                {ur.role?.name || 'Sem Nome'} ({ur.roleId})
              </span>
            )) : (
              <span className="text-xs text-muted-foreground italic">Nenhum perfil específico (Apenas Vínculos)</span>
            )}
          </div>
        </div>

        {/* Modules Section */}
        <div className="space-y-3">
          <span className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1.5">
            <ShieldAlert className="h-3 w-3" /> Acesso a Módulos
          </span>
          <div className="grid gap-2">
            {permissions.length > 0 ? permissions.map((perm: any, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  {perm.module?.name || "Módulo Externo"}
                </span>
                <div className="flex gap-1">
                  {perm.access && <PermissionBadge label="A" color="emerald" title="Acesso/Leitura" />}
                  {perm.create && <PermissionBadge label="C" color="blue" title="Criação" />}
                  {perm.update && <PermissionBadge label="U" color="orange" title="Edição" />}
                  {perm.delete && <PermissionBadge label="D" color="red" title="Exclusão" />}
                </div>
              </div>
            )) : (
              <span className="text-xs text-muted-foreground italic">Nenhuma permissão de módulo configurada.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PermissionBadge({ label, color, title }: { label: string, color: string, title: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    red: "bg-red-100 text-red-700 border-red-200"
  };

  return (
    <span 
      title={title}
      className={`w-5 h-5 flex items-center justify-center rounded text-[9px] font-black border ${colors[color]}`}
    >
      {label}
    </span>
  );
}
