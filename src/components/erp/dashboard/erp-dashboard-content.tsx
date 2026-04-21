'use client'

import { DashboardSummaryAction } from "@/actions/dashboard/get-summary.action";
import { DashboardActions } from "@/components/erp/dashboard/dashboard-actions";
import { DashboardSkeleton } from "@/components/erp/dashboard/dashboard-skeleton";
import { DistributionChart } from "@/components/erp/dashboard/distribution-chart";
import { IngredientsChart } from "@/components/erp/dashboard/ingredients-chart";
import { RankingList } from "@/components/erp/dashboard/ranking-list";
import { RecentDonations } from "@/components/erp/dashboard/recent-donations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Heart,
  PackageCheck,
  PieChart as PieIcon,
  RefreshCw, ShoppingBag,
  Shield,
  Truck,
  UtensilsCrossed,
  WifiOff
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { useEdition } from "@/contexts/edition-context";
import { useEffect, useState } from "react";
import useSWR from 'swr';
import Link from "next/link";

const logisticsLabels: Record<string, string> = {
  DONATE: 'Doação',
  PICKUP: 'Retirada',
  DELIVERY: 'Entrega',
  OUTROS: 'Outros'
};

export function ErpDashboardContent({ user: initialUser }: { user?: any }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { selectedId } = useEdition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: response, error, isLoading, isValidating } = useSWR(
    ['dashboard-summary', selectedId],
    async () => {
      const res = await DashboardSummaryAction(selectedId || undefined);
      if (!res || !res.success) {
        if (res?.error?.includes("403") || res?.error?.includes("negado")) {
          return { success: false, error: "Acesso Negado", code: 403 };
        }
        if (res?.error?.includes("404") || res?.error?.includes("edição")) {
          return { success: false, error: "Nenhuma edição ativa encontrada", code: 404 };
        }
        throw new Error("Offline");
      }
      return res;
    },
    { 
      refreshInterval: 10000, 
      revalidateOnFocus: true,
      keepPreviousData: true 
    }
  );

  const data = (response as any)?.data;
  const isOffline = !!error;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const { loading: permissionsLoading, canAccess } = usePermissions(initialUser);
  
  // ── Permissões dos cards (Sistema de Slugs erp.*) ─────────────────────────
  // Faturamento: apenas Financeiro
  const canSeeFinance    = mounted && canAccess('erp.finance');
  
  // Vendas (qtd), doações, pendentes: Operação, Expedição, Produção, Recepção + Financeiro
  const canSeeOperations = mounted && (
    canSeeFinance || 
    canAccess('erp.production') || 
    canAccess('erp.reception') || 
    canAccess('erp.delivery')
  );

  // Ranking células/vendedores: Líderes, Supervisores, Financeiro
  const canSeeRankingCells   = mounted && (canSeeFinance || canAccess('erp.my-network'));
  const canSeeRankingSellers = mounted && (canSeeRankingCells || canAccess('erp.my-cell'));

  // Gráfico de pagamentos: apenas Financeiro
  const canSeePaymentChart = canSeeFinance;

  // Tipos de pedido (logística): Operação, Expedição, Produção, Recepção
  const canSeeLogisticsChart = canSeeOperations;

  // Doações: Recepção, Expedição, Doações
  const canSeeDonations  = mounted && (
    canAccess('erp.donations') || 
    canAccess('erp.reception') || 
    canAccess('erp.delivery')
  );

  // Cozinha: Produção
  const canSeeKitchen    = mounted && canAccess('erp.production');

  const isSupervisor     = mounted && canAccess('erp.my-network');
  const isLeader         = mounted && canAccess('erp.my-cell');

  if ((isLoading || (!initialUser && permissionsLoading) || !mounted) && !data) return <DashboardSkeleton />;

  if (response?.success === false) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
           {(response as any).code === 403 ? <Shield className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
        </div>
        <div>
          <h3 className="text-xl font-black uppercase italic text-slate-900 dark:text-white">{response.error}</h3>
          <p className="text-[10px] font-bold uppercase text-slate-400 max-w-xs mx-auto mt-2">
            {(response as any).code === 403 
              ? "Seu perfil não possui permissão para visualizar as métricas globais do Dashboard." 
              : "É necessário iniciar uma nova edição no sistema para começar a coletar dados."}
          </p>
        </div>
        {(response as any).code === 404 && (
          <Link href="/erp/configuracoes">
            <Button className="h-10 rounded-xl bg-orange-600 font-bold uppercase text-[9px] tracking-widest">Configurar Edição</Button>
          </Link>
        )}
      </div>
    );
  }

  const totalDogsSold = data?.totalDogsSold ?? 0;
  const availableDogs = data?.availableDogs ?? 0;
  const totalLimit = totalDogsSold + availableDogs;
  const salesPercentage = totalLimit > 0 ? (totalDogsSold / totalLimit) * 100 : 0;

  return (
    <div className={`
      flex flex-col gap-6 animate-in fade-in duration-700 
      ${isOffline ? 'grayscale-[0.5]' : ''}
      ${isFullScreen ? 'fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 p-8 overflow-y-auto' : ''}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
            Dashboard {isFullScreen && <span className="text-orange-600">TV</span>}
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            Edição: <span className="text-slate-600 dark:text-slate-300 italic">{data?.editionName || '---'}</span>
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

      {/* ── Linha de Destaque: Meta e Doações ───────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Card de Meta (70%) */}
        <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden relative flex-[7]">
          {/* Efeito Visual de Fundo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-24 -mb-24 blur-3xl" />
          
          <CardContent className="py-8 px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">
                  Performance Geral
                </p>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                  Status da Meta Global
                </h3>
                <p className="text-slate-400 text-xs font-medium">
                  Vendas realizadas na edição {data?.editionName || '---'}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-slate-500">Atingimento</p>
                  <div className="text-5xl font-black italic text-white tracking-tighter">
                    {salesPercentage.toFixed(1)}%
                  </div>
                </div>
                <div className="h-16 w-[1px] bg-slate-800 hidden md:block" />
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500">Quantidade</p>
                  <div className="text-2xl font-black text-white">
                    {totalDogsSold} <span className="text-slate-500 text-sm">/ {totalLimit}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">Progresso</span>
                <span className="text-orange-500">{totalDogsSold} vendidos</span>
              </div>
              <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden p-1 border border-slate-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                  style={{ width: `${salesPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Doações (30%) - Integrado ao topo */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden relative flex-[3] flex flex-col justify-center">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-slate-500 mb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em]">Missão / Doações</CardTitle>
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-slate-900 dark:text-white">
                {data?.totalDonations || 0} 
                <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Unidades</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">
                Parcerias e Doações Diretas
              </p>
            </CardContent>
          </Card>
      </div>

      {/* Grid de Métricas Secundárias */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {canSeeFinance && (
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
        )}

        {/* Card de Missão foi movido para o topo */}

        {canSeeFinance && (
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
        )}
      </div>

      {/* Conteúdo Secundário */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {canSeeRankingCells && (
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-2 border-b border-slate-50 dark:border-slate-800 mb-3">
              <CardTitle className="text-[10px] font-black tracking-widest uppercase">
                {isSupervisor ? 'Performance da Rede' : 'Performance Células'}
              </CardTitle>
            </CardHeader>
            <CardContent><RankingList data={data?.rankingCells || []} /></CardContent>
          </Card>
        )}
        {canSeeRankingSellers && (
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-2 border-b border-slate-50 dark:border-slate-800 mb-3">
              <CardTitle className="text-[10px] font-black tracking-widest uppercase">Performance Vendedores</CardTitle>
            </CardHeader>
            <CardContent><RankingList data={data?.rankingSellers || []} color="blue" /></CardContent>
          </Card>
        )}
        {canSeeFinance && (
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-2 border-b border-slate-50 dark:border-slate-800 mb-3">
              <CardTitle className="text-[10px] font-black tracking-widest uppercase">Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent><RecentDonations list={data?.recentOrders || []} /></CardContent>
          </Card>
        )}
      </div>

      {/* Gráficos de Distribuição */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
        {canSeePaymentChart && (
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="flex items-center gap-2 flex-row text-slate-400 uppercase"><PieIcon className="h-3 w-3" /><CardTitle className="text-[9px] font-black tracking-tighter">Pagamentos</CardTitle></CardHeader>
            <CardContent><DistributionChart data={data?.paymentMethodsStats?.map((p: any) => ({ label: p.method, value: p.count })) || []} /></CardContent>
          </Card>
        )}
        {canSeeLogisticsChart && (
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="flex items-center gap-2 flex-row text-slate-400 uppercase"><Truck className="h-3 w-3" /><CardTitle className="text-[9px] font-black tracking-tighter">Tipos de Pedido</CardTitle></CardHeader>
            <CardContent>
              <DistributionChart 
                data={data?.logisticsStats?.map((l: any) => ({ label: logisticsLabels[l.label] || l.label, value: l.value })) || []} 
                colors={["#3b82f6", "#10b981", "#f59e0b"]} 
              />
            </CardContent>
          </Card>
        )}
        {canSeeDonations && (
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="flex items-center gap-2 flex-row text-slate-400 uppercase"><Heart className="h-3 w-3" /><CardTitle className="text-[9px] font-black tracking-tighter">Doações / Parcerias</CardTitle></CardHeader>
            <CardContent><DistributionChart data={data?.donationsByPartner || []} colors={["#ef4444", "#ec4899", "#f43f5e"]} /></CardContent>
          </Card>
        )}
        {canSeeKitchen && (
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="flex items-center gap-2 flex-row text-slate-400 uppercase"><UtensilsCrossed className="h-3 w-3" /><CardTitle className="text-[9px] font-black tracking-tighter">Retiradas Cozinha</CardTitle></CardHeader>
            <CardContent><IngredientsChart data={data?.ingredientsStats || []} /></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
