'use client'

import { OrdersPaginateAction } from "@/actions/orders/paginate.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Search, 
  RefreshCw, 
  Filter,
  CheckCircle2,
  Clock,
  User,
  LayoutDashboard,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PedidosPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("PAID");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: response, error, mutate, isValidating } = useSWR(
    mounted ? ['orders-list', activeTab, search] : null,
    () => OrdersPaginateAction(1, search, undefined, activeTab),
    { refreshInterval: 15000 }
  );

  const orders = response?.data?.data || [];
  const isLoading = !response && !error;
  const isError = response?.success === false;

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-900/10">
                <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
                Gestão de <span className="text-orange-600">Pedidos</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
                Vendas & Faturamento • {orders.length} pedidos encontrados
              </p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
             <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <Input 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="BUSCAR PEDIDO..." 
                   className="pl-10 h-10 font-bold text-[11px] uppercase border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl"
                />
             </div>
             <Link href="/erp">
                <Button variant="outline" size="sm" className="gap-2 h-10 font-bold text-[10px] uppercase tracking-widest border-slate-200 dark:border-slate-800">
                    <LayoutDashboard className="h-3.5 w-3.5" /> Painel
                </Button>
            </Link>
        </div>
      </div>

      <Tabs defaultValue="PAID" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-12 w-fit">
          <TabsTrigger value="PAID" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Pagos
          </TabsTrigger>
          <TabsTrigger value="PENDING" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm">
            <Clock className="h-3.5 w-3.5 mr-2" /> Pendentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
            <div className="grid gap-4">
                {orders.map((order: any) => (
                    <Card key={order.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-all hover:shadow-md">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row md:items-center">
                                <div className={`w-full md:w-2 h-2 md:h-auto ${order.paymentStatus === 'PAID' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                                <div className="flex-1 p-4 grid md:grid-cols-4 gap-4 items-center">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Cliente</p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <User className="h-4 w-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white uppercase truncate max-w-[150px]">
                                                    {order.customerName}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-medium">CPF: {order.customerCPF}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Detalhes</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0 border-slate-200 dark:border-slate-800">
                                                {order.items?.length || 0} DOGÕES
                                            </Badge>
                                            <Badge className={`text-[9px] font-black uppercase tracking-widest px-2 py-0 border-none ${
                                                order.deliveryOption === 'DELIVERY' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {order.deliveryOption === 'DELIVERY' ? 'Entrega' : 'Retirada'}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 ml-1">Vendedor: {order.sellerTag}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Data & Valor</p>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                            {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                        </div>
                                        <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                                            R$ {order.totalValue?.toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-end gap-2">
                                        {order.status === 'DIGITATION' && (
                                            <Badge className="bg-orange-50 text-orange-600 border-none uppercase text-[9px] font-black px-2 py-0.5">
                                                Em Digitação
                                            </Badge>
                                        )}
                                        <Link href={`/erp/pedidos/${order.id}`}>
                                            <Button variant="outline" size="sm" className="h-9 font-bold text-[10px] uppercase border-slate-200 dark:border-slate-800 rounded-xl px-4">
                                                Detalhes
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {isError && (
                    <div className="flex flex-col items-center justify-center py-24 bg-red-50 dark:bg-red-950/20 rounded-[2.5rem] border-2 border-dashed border-red-200 dark:border-red-900/50">
                        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                        <h3 className="text-xl font-black text-red-700 dark:text-red-500 uppercase italic tracking-tighter">{response?.error || "Erro ao carregar pedidos"}</h3>
                        <p className="text-[10px] font-bold text-red-400 uppercase mt-2 max-w-sm text-center">
                            Provavelmente não há uma edição ativa no momento ou você não tem permissão para ver estes dados.
                        </p>
                    </div>
                )}

                {orders.length === 0 && !isLoading && !isError && (
                    <div className="flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <ShoppingCart className="h-16 w-16 text-slate-200 mb-4" />
                        <p className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">Nenhum pedido encontrado nesta aba</p>
                    </div>
                )}
            </div>
        </TabsContent>
      </Tabs>
      
      {isValidating && (
          <div className="fixed bottom-8 right-8 animate-in slide-in-from-bottom-4">
              <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-none uppercase text-[9px] font-black px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Atualizando...
              </Badge>
          </div>
      )}
    </div>
  );
}
