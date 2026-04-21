"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Search, 
  MapPin, 
  Loader2,
  UserCircle,
  Building2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

import { ContributorsPaginateAction } from "@/actions/contributors/paginate.action"
import { CellsListAllAction } from "@/actions/cells/list-all.action"
import { ContributorLinkToCellAction } from "@/actions/contributors/link-to-cell.action"
import { ContributorEntity, CellEntity } from "@/common/entities"

export default function LinkContributorToCellPage() {
  const [searching, setSearching] = useState(false)
  const [contributorSearch, setContributorSearch] = useState("")
  const [contributors, setContributors] = useState<ContributorEntity[]>([])
  const [allCells, setAllCells] = useState<CellEntity[]>([])
  const [loadingRows, setLoadingRows] = useState<Record<string, boolean>>({})

  // Carregar todas as células
  useEffect(() => {
    async function loadCells() {
      const res = await CellsListAllAction()
      if (res.success && res.data) {
        setAllCells(res.data)
      }
    }
    loadCells()
  }, [])

  // Buscar colaboradores
  useEffect(() => {
    const timer = setTimeout(async () => {
      setSearching(true)
      const res = await ContributorsPaginateAction(1, contributorSearch)
      if (res.success && res.data) {
        // Garantir que é um array para evitar o erro .length reported
        setContributors(res.data.data || [])
      } else {
        setContributors([])
      }
      setSearching(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [contributorSearch])

  async function handleLink(contributorId: string, cellId: string) {
    if (!cellId) return

    setLoadingRows(prev => ({ ...prev, [contributorId]: true }))
    const res = await ContributorLinkToCellAction(contributorId, cellId)
    
    if (res.success) {
      toast.success("Vínculo realizado com sucesso!")
      // Opcional: recarregar o colaborador para mostrar as células atualizadas
      const updatedRes = await ContributorsPaginateAction(1, contributorSearch)
      if (updatedRes.success && updatedRes.data) {
        setContributors(updatedRes.data.data || [])
      }
    } else {
      toast.error(res.error || "Erro ao vincular")
    }
    setLoadingRows(prev => ({ ...prev, [contributorId]: false }))
  }

  return (
    <div className="container max-w-6xl py-10 space-y-8">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[.3em] text-orange-500">Gestão Administrativa</p>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Vincular Membros às Células</h1>
        <p className="text-slate-500 text-sm">Busque usuários existentes e defina a célula de atuação diretamente na lista.</p>
      </div>

      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                <Search className="h-4 w-4 text-orange-500" />
                Busca de Colaboradores
              </CardTitle>
              <CardDescription>Pesquise por nome, usuário ou telefone</CardDescription>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Ex: João Silva ou joaosilva..." 
                className="pl-10 h-11 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                value={contributorSearch}
                onChange={(e) => setContributorSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                <TableRow className="border-slate-100 dark:border-slate-800">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Colaborador</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Células Atuais</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 w-[300px]">Vincular a Nova Célula</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searching ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                        <span className="text-[10px] font-bold uppercase text-slate-400">Buscando...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : contributors.length > 0 ? (
                  contributors.map((contributor) => (
                    <TableRow key={contributor.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <UserCircle className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white uppercase">{contributor.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">@{contributor.username || 'sem_user'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contributor.cells && contributor.cells.length > 0 ? (
                            contributor.cells.map((cell: any) => (
                              <Badge key={cell.id} variant="secondary" className="text-[9px] font-bold uppercase bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                                {cell.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-300 font-bold uppercase italic">Sem vínculo</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select 
                            onValueChange={(val) => handleLink(contributor.id, val)}
                            disabled={loadingRows[contributor.id]}
                          >
                            <SelectTrigger className="h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-xs uppercase tracking-tighter">
                              <SelectValue placeholder={loadingRows[contributor.id] ? "Salvando..." : "Selecionar Célula"} />
                            </SelectTrigger>
                            <SelectContent>
                              {allCells.map(cell => (
                                <SelectItem key={cell.id} value={cell.id} className="text-xs font-bold uppercase">
                                  {cell.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {loadingRows[contributor.id] && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-300">
                        <AlertCircle className="h-8 w-8" />
                        <span className="text-[10px] font-bold uppercase">Nenhum colaborador encontrado</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50/50 dark:bg-slate-900/20 flex items-start gap-4">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-1 shrink-0" />
        <div className="space-y-1">
          <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Regra de Negócio</h4>
          <p className="text-xs font-medium max-w-2xl">
            Ao selecionar uma célula para o colaborador, o sistema vincula automaticamente o membro usando o <strong>Vendedor (SellerId) do líder da célula</strong>. 
            Isso agrupa as vendas do membro sob o comando do líder, disparando também as notificações de credenciais se necessário.
          </p>
        </div>
      </div>
    </div>
  )
}
