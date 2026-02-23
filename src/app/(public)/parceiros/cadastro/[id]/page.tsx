import { VerifyLinkAction } from '@/actions/partners/verify-link.action';
import { PartnerUpdateForm } from '@/components/partners/partner-update-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface CadastroPageProps {
  params: Promise<{ id: string }>;
}

export default async function CadastroParceiroPage({ params }: CadastroPageProps) {
  const { id } = await params;
  const {data: check} = await VerifyLinkAction(id);

  if (!check?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <Card className="max-w-md w-full border-red-100 shadow-2xl">
          <CardHeader className="text-center">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600 w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-black uppercase text-slate-800">
              Link Inválido
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 pb-10">
            <p className="text-slate-500 font-medium">
              {check?.message || "Este link de ativação expirou ou já foi utilizado para configurar uma conta."}
            </p>
            <div className="pt-4">
              <Link
                href="/parceiros/acesso"
                className="text-orange-600 font-bold uppercase text-sm hover:underline">
                  Ir para o Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
          Ativar Minha Conta
        </h1>
        <p className="text-slate-500 font-medium italic">
          Olá! Complete os dados abaixo para começar a utilizar a plataforma do Dogão do Pastor.
        </p>
      </div>
      <PartnerUpdateForm partnerId={id} />
    </div>
  );
}