"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CommandsPaginateAction } from "@/actions/commands/paginate.action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Plus, 
  Printer, 
  Clock, 
  Truck, 
  ShoppingBag, 
  HeartHandshake,
  ExternalLink,
  Filter
} from "lucide-react"
import { toast } from "sonner"

export default function ComandasPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  
  const currentTab = searchParams.get("tab") || "DELIVERY"
  const searchQuery = searchParams.get("search") || ""
  
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await CommandsPaginateAction(
        1, 
        100, 
        searchQuery, 
        undefined, 
        currentTab === "ALL" ? undefined : currentTab
      )
      
      if (res.success && res.data) {
        setData(res.data.data || [])
        setTotal(res.data.meta?.total || 0)
      } else {
        toast.error(res.error || "Erro ao carregar comandas")
      }
    } catch (err) {
      toast.error("Erro inesperado ao carregar comandas")
    } finally {
      setLoading(false)
    }
  }, [currentTab, searchQuery])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = formData.get("search") as string
    const params = new URLSearchParams(searchParams.toString())
    if (search) params.set("search", search)
    else params.delete("search")
    router.push(`?${params.toString()}`)
  }

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`?${params.toString()}`)
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PENDING: { label: "Pendente", variant: "outline" },
      IN_PRODUCTION: { label: "Produção", variant: "secondary" },
      PRODUCED: { label: "Pronto", variant: "default" },
      EXPEDITION: { label: "Expedição", variant: "default" },
      DELIVERED: { label: "Entregue", variant: "outline" },
    }
    const config = configs[status] || { label: status, variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comandas</h1>
          <p className="text-muted-foreground">Gerencie as comandas e a produção em tempo real.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/erp/comandas/manual")}>
            <Plus className="mr-2 h-4 w-4" />
            Lançamento Manual
          </Button>
          <Button variant="outline" onClick={loadData}>
            <Clock className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTab === "DELIVERY" ? total : "-"}</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retiradas</CardTitle>
            <ShoppingBag className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTab === "PICKUP" || currentTab === "SCHEDULED" ? total : "-"}</div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doações</CardTitle>
            <HeartHandshake className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTab === "DONATE" ? total : "-"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length > 0 ? total : 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="DELIVERY">Entregas</TabsTrigger>
                <TabsTrigger value="PICKUP">Retiradas</TabsTrigger>
                <TabsTrigger value="SCHEDULED">Agendados</TabsTrigger>
                <TabsTrigger value="DONATE">Doações</TabsTrigger>
                <TabsTrigger value="ALL">Todos</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSearch} className="flex w-full md:w-80 items-center space-x-2">
              <Input
                placeholder="Buscar comanda, cliente..."
                name="search"
                defaultValue={searchQuery}
                className="h-9"
              />
              <Button type="submit" size="sm" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comanda</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <Clock className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Carregando comandas...</p>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Nenhuma comanda encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((command) => (
                  <TableRow key={command.id}>
                    <TableCell className="font-bold text-primary">
                      #{command.sequentialId}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{command.order?.customerName || "Consumidor Interno"}</span>
                        <span className="text-xs text-muted-foreground">{command.order?.customerPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {command.order?.items?.length || 0}x Dogão
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {command.order?.deliveryTime ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {command.order.deliveryTime}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(command.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Imprimir" onClick={() => window.open(`/erp/pedidos/${command.orderId}`, "_blank")}>
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/erp/pedidos/${command.orderId}`)}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
