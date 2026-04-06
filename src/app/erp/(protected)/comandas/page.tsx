"use client"

import React from "react"
import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CommandsPaginateAction } from "@/actions/commands/paginate.action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Clock, Truck, ShoppingBag, HeartHandshake, Filter,
  Search, ExternalLink, RefreshCw, ChevronRight, Layers
} from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"
import { GetBatchSummaryAction, PullBatchAction } from "@/actions/commands/get-batch-summary.action"

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  QUEUE:               { label: 'Agendada',    color: 'bg-purple-100 text-purple-700 border-purple-200' },
  PENDING:             { label: 'Aguardando',  color: 'bg-slate-100 text-slate-600 border-slate-200' },
  IN_PRODUCTION:       { label: 'Produção',    color: 'bg-orange-100 text-orange-700 border-orange-200' },
  PRODUCED:            { label: 'Pronto',      color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  EXPEDITION:          { label: 'Expedição',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
  QUEUED_FOR_DELIVERY: { label: 'Fila Entrega', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  OUT_FOR_DELIVERY:    { label: 'Em Rota',     color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  DELIVERED:           { label: 'Entregue',    color: 'bg-green-100 text-green-700 border-green-200' },
}

// ─── Metric card que busca seu próprio total ──────────────────────────────────
function MetricCard({
  title, icon: Icon, color, deliveryOption, currentTab, currentTotal
}: {
  title: string; icon: React.ElementType; color: string;
  deliveryOption?: string; currentTab: string; currentTotal: number;
}) {
  const isActive = deliveryOption
    ? currentTab === deliveryOption || (deliveryOption === 'PICKUP' && currentTab === 'SCHEDULED')
    : currentTab === 'ALL';

  const { data } = useSWR(
    !isActive ? ['metric', deliveryOption || 'ALL'] : null,
    () => CommandsPaginateAction(1, 1, undefined, undefined, deliveryOption),
    { revalidateOnFocus: false, refreshInterval: 30000 }
  );

  const total = isActive ? currentTotal : (data?.data?.meta?.total ?? '…');

  return (
    <Card className={`border ${color}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
        <CardTitle className="text-xs font-bold uppercase tracking-widest">{title}</CardTitle>
        <Icon className="h-4 w-4 opacity-60" />
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="text-2xl font-black">{total}</div>
      </CardContent>
    </Card>
  );
}

// ─── Batch summary ────────────────────────────────────────────────────────────
function BatchSummary({ onPull }: { onPull: () => void }) {
  const { data, mutate } = useSWR('batch-summary',
    () => GetBatchSummaryAction().then(r => r.data || []),
    { refreshInterval: 60000 }
  );

  const batches: any[] = data || []; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (batches.length === 0) return null;

  const handlePull = async (hour: number, slot: 'first' | 'second') => {
    const res = await PullBatchAction(hour, slot);
    if (res.success) {
      toast.success(`${res.data?.pulled || 0} comanda(s) puxada(s) para produção!`);
    } else {
      toast.error(res.error || 'Erro ao puxar lote');
    }
    mutate();
    onPull();
  };

  return (
    <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/10">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-purple-700">
          <Layers className="h-4 w-4" /> Lotes Agendados ({batches.reduce((a, b) => a + b.count, 0)} comandas)
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="flex flex-wrap gap-2">
          {batches.map((b: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <button
              key={b.key}
              onClick={() => {
                const [h, slot] = b.key.split('-');
                handlePull(parseInt(h), slot as 'first' | 'second');
              }}
              className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-purple-200 rounded-xl px-3 py-2 text-xs font-black uppercase hover:bg-purple-100 transition-all"
            >
              <Clock className="h-3 w-3 text-purple-600" />
              <span className="text-purple-700">{b.label}</span>
              <Badge className="bg-purple-600 text-white text-[9px] h-4 px-1.5">{b.count}</Badge>
              <ChevronRight className="h-3 w-3 text-purple-400" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ComandasPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.get("search") || "")

  const currentTab = searchParams.get("tab") || "ALL"

  const { data: response, isLoading, mutate } = useSWR(
    ['comandas', currentTab, search],
    () => CommandsPaginateAction(1, 100, search || undefined, undefined, currentTab === "ALL" ? undefined : currentTab),
    { refreshInterval: 10000 }
  );

  const data: any[] = response?.data?.data || []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const total = response?.data?.meta?.total || 0;

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Comandas</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            Gestão de produção em tempo real
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => mutate()} className="gap-2 h-9 font-bold text-[10px] uppercase">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Entregas" icon={Truck} color="border-blue-100 bg-blue-50/50 dark:bg-blue-950/10"
          deliveryOption="DELIVERY" currentTab={currentTab} currentTotal={total} />
        <MetricCard title="Retiradas" icon={ShoppingBag} color="border-yellow-100 bg-yellow-50/50 dark:bg-yellow-950/10"
          deliveryOption="PICKUP" currentTab={currentTab} currentTotal={total} />
        <MetricCard title="Doações" icon={HeartHandshake} color="border-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/10"
          deliveryOption="DONATE" currentTab={currentTab} currentTotal={total} />
        <MetricCard title="Total" icon={Filter} color="border-slate-100"
          currentTab={currentTab} currentTotal={total} />
      </div>

      {/* Lotes agendados */}
      <BatchSummary onPull={() => mutate()} />

      {/* Tabela */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <Tabs value={currentTab} onValueChange={handleTabChange}>
              <TabsList className="h-9">
                <TabsTrigger value="ALL" className="text-[10px] font-black uppercase px-3">Todos</TabsTrigger>
                <TabsTrigger value="DELIVERY" className="text-[10px] font-black uppercase px-3">Entregas</TabsTrigger>
                <TabsTrigger value="PICKUP" className="text-[10px] font-black uppercase px-3">Retiradas</TabsTrigger>
                <TabsTrigger value="DONATE" className="text-[10px] font-black uppercase px-3">Doações</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2 w-full md:w-72">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <Input
                placeholder="Buscar comanda, cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm font-bold uppercase">
              Nenhuma comanda encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {['Comanda', 'Cliente / Parceiro', 'Tipo', 'Qtd', 'Horário', 'Status', ''].map((h) => (
                      <th key={h} className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((cmd: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    const isWithdrawal = !!cmd.withdrawalId && !cmd.orderId;
                    const name = isWithdrawal
                      ? (cmd.withdrawal?.partner?.name || 'Doação')
                      : (cmd.order?.customerName || '—');
                    const phone = isWithdrawal
                      ? cmd.withdrawal?.partner?.phone
                      : cmd.order?.customerPhone;
                    const qty = isWithdrawal
                      ? (cmd.quantity || cmd.withdrawal?.items?.length || 0)
                      : (cmd.commandItems?.length || cmd.order?.items?.length || 0);
                    const deliveryOpt = cmd.order?.deliveryOption || (isWithdrawal ? 'DONATE' : '—');
                    const scheduledTime = cmd.order?.deliveryTime ||
                      (cmd.withdrawal?.scheduledAt
                        ? new Date(cmd.withdrawal.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        : null);
                    const detailsHref = isWithdrawal
                      ? `/erp/doacoes/resgate/${cmd.withdrawalId}`
                      : `/erp/pedidos/${cmd.orderId}`;
                    const statusCfg = STATUS_CONFIG[cmd.status] || { label: cmd.status, color: 'bg-slate-100 text-slate-500' };

                    const deliveryLabels: Record<string, string> = {
                      PICKUP: 'Balcão', DELIVERY: 'Entrega',
                      DONATE: 'Doação', SCHEDULED: 'Agendado',
                    };

                    return (
                      <tr key={cmd.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3 font-black text-orange-600 text-sm">#{cmd.sequentialId}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-xs uppercase truncate max-w-[160px]">{name}</p>
                          {phone && <p className="text-[10px] text-slate-400">{phone}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-black uppercase text-slate-500">
                            {deliveryLabels[deliveryOpt] || deliveryOpt}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-black text-sm">{qty}x</span>
                        </td>
                        <td className="px-4 py-3">
                          {scheduledTime ? (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                              <Clock className="h-3 w-3 text-orange-500" />{scheduledTime}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => router.push(detailsHref)}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
