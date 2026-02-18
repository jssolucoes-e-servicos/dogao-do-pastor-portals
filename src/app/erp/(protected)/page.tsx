// src/app/erp/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ShoppingBag, TrendingUp, Users } from "lucide-react";
export const dynamic = 'force-dynamic'
export default async function ErpDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"> carregando ... {/* R$ 12.450,00 */}</div>
            <p className="text-xs text-muted-foreground">carregando ... {/* +20.1% em relação ao mês passado */}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doações Totais</CardTitle>
            <Heart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">carregando ...{/* 452 Unid. */}</div>
            <p className="text-xs text-muted-foreground">carregando ...{/* +12% em relação ao mês passado */}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">carregando ...{/* +2350 */}</div>
            <p className="text-xs text-muted-foreground">carregando ...{/* +180.1% desde a última semana */}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos em Análise</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">carregando ...{/* 12 */}</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação manual</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder para Gráficos Futuros */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader><CardTitle>Visão Geral de Vendas</CardTitle></CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg m-4">
            Gráfico de Vendas virá aqui
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader><CardTitle>Últimas Doações</CardTitle></CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg m-4">
            Lista de transações recentes
          </CardContent>
        </Card>
      </div>
    </div>
  );
}