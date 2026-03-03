'use client'

import { DashboardSummaryAction } from "@/actions/dashboard/get-summary.action";
import { DashboardActions } from "@/components/erp/dashboard/dashboard-actions";
import { DashboardSkeleton } from "@/components/erp/dashboard/dashboard-skeleton";
import { DistributionChart } from "@/components/erp/dashboard/distribution-chart";
import { IngredientsChart } from "@/components/erp/dashboard/ingredients-chart";
import { RankingList } from "@/components/erp/dashboard/ranking-list";
import { RecentDonations } from "@/components/erp/dashboard/recent-donations";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Heart,
  PackageCheck,
  PieChart as PieIcon,
  RefreshCw, ShoppingBag,
  Truck,
  UtensilsCrossed,
  WifiOff
} from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from 'swr';

const logisticsLabels: Record<string, string> = {
  DONATE: 'Doação',
  PICKUP: 'Retirada',
  DELIVERY: 'Entrega',
  OUTROS: 'Outros'
};

export default function ErpDashboard() {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { data: response, error, isLoading, isValidating } = useSWR(
    'dashboard-summary',
    async () => {
      const res = await DashboardSummaryAction();
      if (!res || !res.success) throw new Error("Offline");
      return res;
    },
    { 
      refreshInterval: 10000, 
      revalidateOnFocus: true,
      keepPreviousData: true 
    }
  );

  const data = response?.data;
  const isOffline = !!error;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (isLoading && !data) return <DashboardSkeleton />;

  const totalLimit = (data?.totalDogsSold || 0) + (data?.availableDogs || 0);
  const salesPercentage = totalLimit > 0 ? (data?.totalDogsSold / totalLimit) * 100 : 0;

  return (
    <div className={`
      flex flex-col gap-6 animate-in fade-in duration-700 
      ${isOffline ? 'grayscale-[0.5]' : ''}
      ${isFullScreen ? 'fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 p-8 overflow-y-auto' : ''}
    `}>
      {/* Header Atualizado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
            Dashboard {isFullScreen && <span className="text-orange-600">TV</span>}
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            Edição: <span className="text-slate-600 dark:text-slate-300 italic">{data?.editionName || 'Carregando...'}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            {isValidating && !isOffline && <RefreshCw className="h-3 w-3 animate-spin text-slate-300" />}
            {isOffline ? (
              <Badge variant="destructive" className="gap-1 px-2 py-0.5 font-black text-[9px] uppercase animate-pulse">
                <WifiOff className="h-3 w-3" /> Offline
              </Badge>
            ) : (
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 dark:text-emerald-400 uppercase text-[9px] font-black px-2 py-0.5">
                • Online
              </Badge>
            )}
          </div>

          {/* O menu flutuante agora fica aqui, ao lado do status */}
          <DashboardActions 
            data={data} 
            isFullScreen={isFullScreen} 
            onToggleFullScreen={() => setIsFullScreen(!isFullScreen)} 
          />
        </div>
      </div>

      {isOffline && (
        <div className="bg-orange-500 text-white text-[9px] font-black py-1 px-4 rounded-full w-fit mx-auto shadow-lg uppercase tracking-widest animate-bounce">
          Servidor fora de linha. Exibindo última atualização do sistema.
        </div>
      )}

      {/* Grid de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden relative">
           <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-slate-500">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em]">Faturamento Bruto</CardTitle>
            <ShoppingBag className="h-3.5 w-3.5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-slate-500">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em]">Vendas (Qtd)</CardTitle>
            <PackageCheck className="h-3.5 w-3.5 text-blue-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between text-slate-900 dark:text-white font-black text-2xl">
              {data?.totalDogsSold || 0}
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Meta: {totalLimit}</span>
            </div>
            <Progress value={salesPercentage} className="h-1 bg-slate-100 dark:bg-slate-800" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-slate-500">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em]">Missão / Doações</CardTitle>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{data?.totalDonations || 0} <span className="text-[10px] font-bold text-slate-400 uppercase">Unid.</span></div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-red-50 dark:bg-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-red-600">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em]">Críticos</CardTitle>
            <AlertTriangle className="h-3.5 w-3.5" />
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              <p className="text-[9px] text-red-400 font-black uppercase">Análise</p>
              <div className="text-xl font-black text-red-700 dark:text-red-500">{data?.pendingAnalysis || 0}</div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-red-400 font-black uppercase">Abandono</p>
              <div className="text-xl font-black text-red-700 dark:text-red-500">{data?.abandonedOrdersCount || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Secundário */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-2 border-b border-slate-50 dark:border-slate-800 mb-3"><CardTitle className="text-[10px] font-black tracking-widest uppercase">Performance Células</CardTitle></CardHeader>
          <CardContent><RankingList data={data?.rankingCells || []} /></CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-2 border-b border-slate-50 dark:border-slate-800 mb-3"><CardTitle className="text-[10px] font-black tracking-widest uppercase">Performance Vendedores</CardTitle></CardHeader>
          <CardContent><RankingList data={data?.rankingSellers || []} color="blue" /></CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-2 border-b border-slate-50 dark:border-slate-800 mb-3"><CardTitle className="text-[10px] font-black tracking-widest uppercase">Últimas Transações</CardTitle></CardHeader>
          <CardContent><RecentDonations list={data?.recentOrders || []} /></CardContent>
        </Card>
      </div>

      {/* Gráficos de Distribuição */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex items-center gap-2 flex-row text-slate-400 uppercase"><PieIcon className="h-3 w-3" /><CardTitle className="text-[9px] font-black tracking-tighter">Pagamentos</CardTitle></CardHeader>
          <CardContent><DistributionChart data={data?.paymentMethodsStats?.map(p => ({ label: p.method, value: p.count })) || []} /></CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex items-center gap-2 flex-row text-slate-400 uppercase"><Truck className="h-3 w-3" /><CardTitle className="text-[9px] font-black tracking-tighter">Tipos de Pedido</CardTitle></CardHeader>
          <CardContent><DistributionChart data={data?.logisticsStats?.map(l => ({ label: logisticsLabels[l.label] || l.label, value: l.value })) || []} colors={["#3b82f6", "#10b981", "#f59e0b"]} /></CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex items-center gap-2 flex-row text-slate-400 uppercase"><Heart className="h-3 w-3" /><CardTitle className="text-[9px] font-black tracking-tighter">Doações / Parcerias</CardTitle></CardHeader>
          <CardContent><DistributionChart data={data?.donationsByPartner || []} colors={["#ef4444", "#ec4899", "#f43f5e"]} /></CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex items-center gap-2 flex-row text-slate-400 uppercase"><UtensilsCrossed className="h-3 w-3" /><CardTitle className="text-[9px] font-black tracking-tighter">Retiradas Cozinha</CardTitle></CardHeader>
          <CardContent><IngredientsChart data={data?.ingredientsStats || []} /></CardContent>
        </Card>
      </div>
    </div>
  );
} 