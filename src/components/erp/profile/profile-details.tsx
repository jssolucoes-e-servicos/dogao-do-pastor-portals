// src/components/erp/profile/profile-details.tsx
import { ContributorEntity } from "@/common/entities";
import { Hash, Mail, Smartphone, UserCircle } from "lucide-react";

export function ProfileDetails({ contributor }: { contributor: ContributorEntity }) {
  return (
    <div className="grid gap-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-card overflow-hidden">
        <div className="bg-muted/50 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-wider">Informações da Conta</h3>
        </div>
        
        <div className="p-5 grid gap-6 sm:grid-cols-2">
          <DetailItem 
            icon={<UserCircle className="h-4 w-4" />} 
            label="Nome Completo" 
            value={contributor.name} 
          />
          <DetailItem 
            icon={<Smartphone className="h-4 w-4" />} 
            label="Telefone WhatsApp" 
            value={contributor.phone || "Não informado"} 
          />
          <DetailItem 
            icon={<Hash className="h-4 w-4" />} 
            label="ID do Sistema" 
            value={contributor.id} 
            className="font-mono text-[10px]"
          />
          <DetailItem 
            icon={<Mail className="h-4 w-4" />} 
            label="Usuário de Acesso" 
            value={`@${contributor.username}`} 
          />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value, className = "" }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1.5">
        {icon} {label}
      </span>
      <span className={`text-sm font-bold text-slate-700 dark:text-slate-200 ${className}`}>
        {value}
      </span>
    </div>
  );
}