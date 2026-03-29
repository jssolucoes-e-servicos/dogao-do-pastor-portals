'use client'

import { useEffect, useState } from 'react'
import { GetEditionSummaryAction, type EditionSummary } from '@/actions/reports/edition-summary.action'
import { ListEditionsAction, type EditionItem } from '@/actions/editions/list-editions.action'
import { usePdfExport } from '@/hooks/use-pdf-export'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3, RefreshCw, TrendingUp,
  Truck, Heart, Store, Printer,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function StatBox({ label, value, sub, color = 'orange' }: {
  label: string; value: string | number; sub?: string; color?: string
}) {
  const colors: Record<string, string> = {
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    green:  'bg-emerald-50 border-emerald-200 text-emerald-700',
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    slate:  'bg-slate-50 border-slate-200 text-slate-700',
  }
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-3xl font-black leading-none">{value}</p>
      {sub && <p className="text-[11px] font-semibold opacity-60 mt-1">{sub}</p>}
    </div>
  )
}

export default function EditionReportPage() {
  const [editionId, setEditionId] = useState<string>('')
  const [editions, setEditions] = useState<EditionItem[]>([])
  const [summary, setSummary] = useState<EditionSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { exportEditionReport, exporting } = usePdfExport()

  useEffect(() => {
    ListEditionsAction().then(setEditions)
  }, [])

  async function load() {
    if (!editionId) return
    setLoading(true)
    setError(null)
    const res = await GetEditionSummaryAction(editionId)
    if (res.success && res.data) setSummary(res.data)
    else setError(res.error ?? 'Erro desconhecido')
    setLoading(false)
  }

  function handlePrint() {
    if (summary) exportEditionReport(summary)
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Relatório de <span className="text-orange-600">Edição</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Vendas • Entregas • Ranking por Vendedor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={editionId} onValueChange={setEditionId}>
            <SelectTrigger className="w-56 h-10 font-bold text-[11px] uppercase border-slate-200 dark:border-slate-800 rounded-xl">
              <SelectValue placeholder="Selecionar edição..." />
            </SelectTrigger>
            <SelectContent>
              {editions.map((e) => (
                <SelectItem key={e.id} value={e.id} className="font-bold text-[11px] uppercase">
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={load}
            disabled={!editionId || loading}
            className="h-10 bg-orange-600 hover:bg-orange-700 font-black text-[10px] uppercase tracking-widest rounded-xl gap-2"
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
            Gerar
          </Button>

          {summary && (
            <Button
              onClick={handlePrint}
              disabled={exporting}
              variant="outline"
              className="h-10 font-black text-[10px] uppercase tracking-widest rounded-xl gap-2 border-slate-200 dark:border-slate-800"
            >
              {exporting
                ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Gerando PDF...</>
                : <><Printer className="h-3.5 w-3.5" /> Exportar PDF</>
              }
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-700 font-bold text-sm">
          {error}
        </div>
      )}

      {!summary && !loading && (
        <div className="flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
          <BarChart3 className="h-16 w-16 text-slate-200 mb-4" />
          <p className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">
            Selecione uma edição para gerar o relatório
          </p>
        </div>
      )}

      {summary && (
        <div id="edition-report-content" className="flex flex-col gap-6 bg-white dark:bg-slate-950 p-2 rounded-2xl">
          {/* Cabeçalho do relatório */}
          <div className="flex items-center justify-between bg-slate-900 text-white rounded-2xl p-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Relatório</p>
              <h2 className="text-2xl font-black uppercase italic">{summary.edition.name}</h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Produção: {format(new Date(summary.edition.productionDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                {' · '}Preço: {fmt(summary.edition.dogPrice)}
                {' · '}Limite: {summary.edition.limitSale} dogões
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Gerado em</p>
              <p className="text-sm font-bold">
                {format(new Date(summary.generatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Totais gerais */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Totais Gerais</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Dogões vendidos" value={summary.totals.dogs} sub={`${summary.totals.orders} pedidos`} color="orange" />
              <StatBox label="Receita total" value={fmt(summary.totals.revenue)} color="green" />
              <StatBox label="Via site" value={summary.totals.byOrigin.site.dogs} sub={`${fmt(summary.totals.byOrigin.site.revenue)}`} color="blue" />
              <StatBox label="Via PDV" value={summary.totals.byOrigin.pdv.dogs} sub={`${fmt(summary.totals.byOrigin.pdv.revenue)}`} color="purple" />
            </div>
          </div>

          {/* Tipo de entrega */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Por Tipo de Entrega</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Store className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Retirada</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{summary.deliverySummary.pickup.dogs} 🌭</p>
                    <p className="text-[11px] text-slate-400">{summary.deliverySummary.pickup.orders} pedidos</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Truck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entrega</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{summary.deliverySummary.delivery.dogs} 🌭</p>
                    <p className="text-[11px] text-slate-400">{summary.deliverySummary.delivery.orders} pedidos</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="bg-rose-100 p-3 rounded-xl">
                    <Heart className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Doação</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{summary.deliverySummary.donate.dogs} 🌭</p>
                    <p className="text-[11px] text-slate-400">{summary.deliverySummary.donate.orders} pedidos</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Ranking por vendedor */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              Ranking por Vendedor — Site ({summary.rankingBySeller.length} vendedores)
            </p>
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">#</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Vendedor</th>
                      <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Pedidos</th>
                      <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Dogões</th>
                      <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Receita</th>
                      <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">% Dogs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.rankingBySeller.map((s, i) => {
                      const pct = summary.totals.byOrigin.site.dogs > 0
                        ? ((s.dogs / summary.totals.byOrigin.site.dogs) * 100).toFixed(1)
                        : '0'
                      const medals = ['🥇', '🥈', '🥉']
                      return (
                        <tr
                          key={s.tag}
                          className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${i === 0 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                        >
                          <td className="p-4 text-lg">{medals[i] ?? <span className="text-sm font-black text-slate-400">{s.position}º</span>}</td>
                          <td className="p-4">
                            <p className="font-black text-sm text-slate-900 dark:text-white uppercase">{s.name}</p>
                            <p className="text-[10px] text-orange-500 font-bold">@{s.tag}</p>
                          </td>
                          <td className="p-4 text-right font-bold text-sm text-slate-600 dark:text-slate-400">{s.orders}</td>
                          <td className="p-4 text-right">
                            <span className="font-black text-slate-900 dark:text-white">{s.dogs}</span>
                            <span className="text-slate-400 ml-1 text-xs">🌭</span>
                          </td>
                          <td className="p-4 text-right font-bold text-sm text-emerald-600">{fmt(s.revenue)}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[11px] font-bold text-slate-500 w-10 text-right">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
                      <td colSpan={2} className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Total Site</td>
                      <td className="p-4 text-right font-black text-sm text-slate-900 dark:text-white">{summary.totals.byOrigin.site.orders}</td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white">{summary.totals.byOrigin.site.dogs} 🌭</td>
                      <td className="p-4 text-right font-black text-emerald-600">{fmt(summary.totals.byOrigin.site.revenue)}</td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
