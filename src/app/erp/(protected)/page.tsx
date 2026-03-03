// src/app/erp/page.tsx
'use client'

import { DashboardSummaryAction } from "@/actions/dashboard/get-summary.action";
import { RecentDonations } from "@/components/erp/dashboard/recent-donations";
import { SalesChart } from "@/components/erp/dashboard/sales-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, RefreshCw, ShoppingBag, TrendingUp, Users } from "lucide-react";
import useSWR from 'swr';

export default function ErpDashboard() {
  // SWR para Realtime: Revalida a cada 30 segundos
  const { data: response, isLoading, isValidating } = useSWR(
    'dashboard-summary',
    () => DashboardSummaryAction(),
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const data = response?.data;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h2>
        {isValidating && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card Vendas */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Vendas Totais</CardTitle>
            <ShoppingBag className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Card Doações */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Doações</CardTitle>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{data?.totalDonations} Unid.</div>
          </CardContent>
        </Card>

        {/* Clientes */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">+{data?.newCustomers}</div>
          </CardContent>
        </Card>

        {/* Análise */}
        <Card className="border-none shadow-sm bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase text-red-600">Pedidos em Análise</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-red-700">{data?.pendingAnalysis}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader><CardTitle className="font-bold">Evolução de Vendas (7 dias)</CardTitle></CardHeader>
          <CardContent>
            <SalesChart data={data?.salesHistory || []} />
          </CardContent>
        </Card>
        <Card className="col-span-3 border-none shadow-sm">
          <CardHeader><CardTitle className="font-bold">Últimas Doações</CardTitle></CardHeader>
          <CardContent>
            <RecentDonations list={data?.recentDonations || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-4 md:grid-cols-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Skeleton className="col-span-4 h-80" />
        <Skeleton className="col-span-3 h-80" />
      </div>
    </div>
  );
}