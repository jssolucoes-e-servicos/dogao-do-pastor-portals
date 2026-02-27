// src/app/(erp)/vendedores/[id]/page.tsx
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchApi, FetchCtx } from "@/lib/api";
import {
  BadgeCheck,
  Clock,
  MessageSquare,
  Phone,
  User
} from "lucide-react";
import Link from "next/link";
import { SendLinkButton } from "./_components/send-link-button"; // Componente cliente para ação

export default async function SellerDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  // No seu backend, a rota de findById deve retornar o seller 
  // com include: { contributor: true, cell: { include: { leader: true } }, _count: { items: true } }
  // E idealmente um resumo de stats (pode ser um método separado se preferir)
  const data = await fetchApi(FetchCtx.ERP, `/sellers/${id}`);
  const seller = data.seller;
  const stats = data.stats;

  return (
    <div className="flex flex-col gap-6">
      {/* Header com Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground flex items-center gap-2">
            <User className="text-orange-600" /> Detalhes do Vendedor
          </h1>
          <p className="text-muted-foreground text-sm">Gerencie o desempenho e informações de {seller.contributor.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <SendLinkButton sellerId={id} />
          <Link href={`/erp/vendedores/${seller.id}/editar`}>
            <Button  variant="outline" size="sm" className="font-bold">EDITAR CADASTRO</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card de Informações Pessoais */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-600/20 flex items-center justify-center text-orange-600 font-bold">
                {seller.name.substring(0,2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold leading-none">{seller.name}</p>
                <p className="text-xs text-muted-foreground">{seller.contributor.name}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{NumbersHelper.maskPhone(seller.contributor.phone)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BadgeCheck className="w-4 h-4 text-muted-foreground" />
                <span>TAG: <b className="text-orange-600">{seller.tag}</b></span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Célula / Líder</span>
                <span className="text-sm font-bold">{seller.cell?.name || "N/A"}</span>
                <span className="text-xs text-muted-foreground">{seller.cell?.leader?.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas de Itens (Dogões) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase">Aguardando Pgto</p>
                  <h3 className="text-3xl font-black mt-1">{stats?.pendingItems || 0}</h3>
                  <p className="text-xs text-muted-foreground mt-1 underline cursor-pointer">Ver itens detalhados</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase">Dogões Confirmados</p>
                  <h3 className="text-3xl font-black mt-1 text-green-600">{stats?.paidItems || 0}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Total arrecadado: {NumbersHelper.formatCurrency(stats?.totalValue || 0)}</p>
                </div>
                <BadgeCheck className="w-10 h-10 text-green-500/20" />
              </div>
            </CardContent>
          </Card>

          {/* Card de Link de Divulgação */}
          <Card className="md:col-span-2 bg-orange-600 text-white">
            <CardContent className="py-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6" />
                <div>
                  <p className="font-bold">Link de Divulgação</p>
                  <p className="text-xs text-orange-100">https://dogao.igrejavivaemcelulas.com.br/comprar?v={seller.tag}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="font-bold uppercase w-full md:w-auto">
                Copiar Link
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}