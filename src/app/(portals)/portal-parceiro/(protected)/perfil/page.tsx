import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPartnerSession } from '@/lib/auth-partner-session';
import { AlertCircle, Building2, Mail, MapPin, Phone } from 'lucide-react';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic'
import { GetByIdAction } from '@/actions/partners/get-by-id.action';
import Link from 'next/link';
import { LogoUpload } from './components/logo-upload';
import { ProfileActions } from './components/profile-actions';

export default async function PerfilPage() {
  const session = await getPartnerSession();

  if (!session) {
    redirect('/portal-parceiro/acesso');
  }

  const {data: partner} = await GetByIdAction(session.user.id);

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-black uppercase">Perfil não encontrado</h2>
        <p className="text-slate-500">Não conseguimos carregar os dados agora.</p>
        <Link href="/portal-parceiro/acesso" className="text-orange-600 font-bold underline">Tentar login novamente</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase">Meu Perfil</h1>
          <p className="text-muted-foreground font-medium">Informações da conta e segurança.</p>
        </div>
        <ProfileActions partner={partner} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              {/* Sincronizado com as props do LogoUpload */}
              <LogoUpload 
                currentLogo={partner.logo || '/assets/images/default-inst.png'} 
                partnerId={partner.id} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tighter text-slate-700">
                <Building2 className="w-5 h-5 text-orange-600" /> Detalhes da Instituição
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                <DataLabel label="Nome Fantasia" value={partner.name} />
                <DataLabel label="CNPJ" value={partner.cnpj!} />
                <DataLabel 
                  label="Responsável" 
                  value={partner.responsibleName} 
                  icon={<Mail className="w-3 h-3"/>} 
                />
                <DataLabel 
                  label="WhatsApp Responsável" 
                  value={partner.responsiblePhone} 
                  icon={<Phone className="w-3 h-3"/>} 
                />
              </div>
              <div className="pt-6 border-t border-slate-50">
                <DataLabel 
                  label="Endereço Completo" 
                  value={partner.addressInLine} 
                  icon={<MapPin className="w-3 h-3"/>} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DataLabel({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
        {icon} {label}
      </p>
      <p className="text-slate-800 font-bold leading-tight">{value || "---"}</p>
    </div>
  );
}