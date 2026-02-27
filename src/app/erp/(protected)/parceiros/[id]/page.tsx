import { PartnerByIdAction } from "@/actions/partners/get-by-id.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, Calendar, Heart, MapPin, Phone, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PartnerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: partner } = await PartnerByIdAction(id);

  if (!partner)
      return notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/erp/parceiros"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{partner.name}</h2>
          <p className="text-muted-foreground text-sm font-mono uppercase">CNPJ: {partner.cnpj}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Building2 className="h-4 w-4 text-orange-600" /> Dados da Instituição
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Responsável</span>
              <span className="text-sm flex items-center gap-2"><User className="h-3 w-3" /> {partner.responsibleName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Contato</span>
              <span className="text-sm flex items-center gap-2"><Phone className="h-3 w-3" /> {partner.phone}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Endereço</span>
              <span className="text-sm flex items-center gap-2">
                <MapPin className="h-3 w-3 shrink-0" /> 
                {partner.street}, {partner.number} - {partner.neighborhood}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card Resumo de Doações (Mocked por enquanto) */}
        <Card className="bg-orange-50/30 border-orange-100">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Heart className="h-4 w-4 text-orange-600" /> Doações Acumuladas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <span className="text-4xl font-black text-orange-600">452</span>
            <span className="text-xs font-bold uppercase text-orange-800">Cachorros-Quentes</span>
          </CardContent>
        </Card>

        {/* Card Próximos Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Calendar className="h-4 w-4 text-orange-600" /> Próxima Produção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Badge className="w-fit bg-green-100 text-green-700 hover:bg-green-100">22/10/2025 - 19:30</Badge>
              <p className="text-xs text-muted-foreground italic">Agendamento confirmado para 50 unidades.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}