import { GetEditionByIdAction } from "@/actions/editions/get-edition-by-id.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, DollarSign, Package, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function EditionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: edition } = await GetEditionByIdAction(id);

  if (!edition) return notFound();

  const soldPercent = Math.min(100, Math.round((edition.dogsSold / edition.limitSale) * 100));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/erp/edicoes"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight uppercase">{edition.name}</h2>
          <p className="text-muted-foreground text-sm font-mono uppercase">CÓD: {edition.code}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {edition.active
            ? <Badge className="bg-green-100 text-green-700">Ativa</Badge>
            : <Badge variant="secondary">Inativa</Badge>
          }
          <Button asChild variant="outline" size="sm" className="font-black uppercase text-[10px]">
            <Link href={`/erp/edicoes/${id}/editar`}>Editar</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Calendar className="h-4 w-4 text-orange-600" /> Datas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Produção", value: formatDate(edition.productionDate) },
              { label: "Início das Vendas", value: formatDate(edition.saleStartDate) },
              { label: "Fim das Vendas", value: formatDate(edition.saleEndDate) },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{label}</span>
                <span className="text-sm font-bold">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-orange-50/30 border-orange-100">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Package className="h-4 w-4 text-orange-600" /> Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4 gap-3">
            <div className="text-center">
              <span className="text-4xl font-black text-orange-600">{edition.dogsSold}</span>
              <span className="text-sm text-muted-foreground"> / {edition.limitSale}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="h-2 rounded-full bg-orange-500 transition-all" style={{ width: `${soldPercent}%` }} />
            </div>
            <span className="text-xs font-bold text-muted-foreground">{soldPercent}% vendido</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
              <DollarSign className="h-4 w-4 text-orange-600" /> Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Preço por Dog</span>
              <span className="text-2xl font-black text-orange-600">
                {edition.dogPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Receita Estimada</span>
              <span className="text-sm font-bold">
                {(edition.dogsSold * edition.dogPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </CardContent>
        </Card>

        {(edition.autoEnableDate || edition.autoDisableDate) && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
                <Zap className="h-4 w-4 text-yellow-500" /> Automação
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Ativar em</span>
                <span className="text-sm font-bold">{formatDate(edition.autoEnableDate)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Desativar em</span>
                <span className="text-sm font-bold">{formatDate(edition.autoDisableDate)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
