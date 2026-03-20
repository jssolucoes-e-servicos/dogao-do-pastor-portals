'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DonationsCuratoryPaginateAction } from "@/actions/orders/donations-curatory-paginate.action";
import { ListPartnersForOrdersAction } from "@/actions/partners/list-partners-for-orders.action";
import { SetOrderDonateAction } from "@/actions/orders/set-order-donate.action";
import { ListPartnersBalancesAction } from "@/actions/donations/list-partners-balances.action";
import { ListPartnerEntriesAction } from "@/actions/donations/list-partner-entries.action";
import { CreateWithdrawalAction } from "@/actions/donations/create-withdrawal.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  RefreshCw, 
  Search,
  Building2,
  Users,
  LayoutDashboard,
  ArrowRightLeft,
  Calendar,
  Gift,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Loader2,
  Eye
} from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DoacoesPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [matchingPartners, setMatchingPartners] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("partners");
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isWithdrawalLoading, setIsWithdrawalLoading] = useState(false);

  const fetchPartners = async () => {
    const res = await ListPartnersForOrdersAction();
    if (res.success && res.data) {
      setMatchingPartners(res.data || []);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchPartners();
  }, []);

  // 1. Hook para "Por Venda" (Curadoria)
  const { data: salesResponse, mutate: mutateSales, isValidating: isValidatingSales } = useSWR(
    mounted && activeTab === 'sales' ? ['donations-curatory', search] : null,
    () => DonationsCuratoryPaginateAction(1, search, 'true'),
    { refreshInterval: 10000 }
  );

  // 2. Hook para "Por Parceiro" (Saldos)
  const { data: partnersResponse, mutate: mutatePartners, isValidating: isValidatingPartners } = useSWR(
    mounted && activeTab === 'partners' ? 'partners-balances' : null,
    () => ListPartnersBalancesAction(),
    { refreshInterval: 10000 }
  );

  // 3. Hook para Histórico do Parceiro Selecionado
  const { data: entriesResponse, mutate: mutateEntries } = useSWR(
    mounted && selectedPartner?.id ? [`partner-entries`, selectedPartner.id] : null,
    () => selectedPartner?.id ? ListPartnerEntriesAction(selectedPartner.id, 1, 50) : null
  );

  const donations = salesResponse?.data?.data || [];
  const partnersWithBalance = partnersResponse?.data || [];
  const partnerEntries = entriesResponse?.data?.data || [];

  const handleAssignPartner = async (orderId: string, partnerId: string) => {
    const res = await SetOrderDonateAction(orderId, partnerId);
    if (res.success) {
      toast.success("Doação vinculada com sucesso!");
      mutateSales();
      mutatePartners();
    } else {
      toast.error("Erro ao vincular doação");
    }
  };

  const handleCreateWithdrawal = async (partnerId: string, quantity: number) => {
    if (quantity <= 0) {
      toast.error("Quantidade inválida");
      return;
    }
    
    setIsWithdrawalLoading(true);
    const res = await CreateWithdrawalAction({
      partnerId,
      scheduledAt: new Date().toISOString(),
      items: [{ quantity, removedIngredients: [] }]
    });

    if (res.success) {
      toast.success("Solicitação de retirada enviada!");
      mutatePartners();
      mutateEntries();
      // setSelectedPartner(null);
    } else {
      toast.error(res.error || "Erro ao solicitar retirada");
    }
    setIsWithdrawalLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-rose-500 p-3 rounded-2xl shadow-lg shadow-rose-500/20">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Gestão de <span className="text-rose-500">Doações</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              Social & Missão • Impactando vidas através do alimento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/erp">
            <Button variant="outline" size="sm" className="gap-2 h-10 font-bold text-[10px] uppercase tracking-widest border-slate-200 dark:border-slate-800">
              <LayoutDashboard className="h-3.5 w-3.5" /> Painel
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="partners" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl h-14 w-full md:w-auto mb-6">
          <TabsTrigger value="partners" className="rounded-xl h-12 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-rose-500 font-black uppercase text-[10px] tracking-widest gap-2">
            <Building2 className="h-4 w-4" /> Por Parceiro
          </TabsTrigger>
          <TabsTrigger value="sales" className="rounded-xl h-12 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-rose-500 font-black uppercase text-[10px] tracking-widest gap-2">
            <Gift className="h-4 w-4" /> Por Venda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="mt-0 space-y-4">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl font-black uppercase italic tracking-tight">Parceiros e Saldos</CardTitle>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Acompanhamento de créditos disponíveis</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => mutatePartners()} disabled={isValidatingPartners}>
                <RefreshCw className={`h-4 w-4 ${isValidatingPartners ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                    <TableHead className="uppercase font-black text-[10px] tracking-widest">Parceiro</TableHead>
                    <TableHead className="uppercase font-black text-[10px] tracking-widest text-center">Saldo Atual</TableHead>
                    <TableHead className="uppercase font-black text-[10px] tracking-widest text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partnersWithBalance.map((p: any) => (
                    <TableRow key={p.id} className="border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                             {p.logo ? <img src={p.logo as string} alt={(p.name as string) || "Logo"} className="h-full w-full object-cover" /> : <Building2 className="h-5 w-5 text-slate-400" />}
                          </div>
                          <div>
                            <p className="font-black text-xs uppercase tracking-tight">{p.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{p.responsibleName || 'Responsável N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-black text-lg text-rose-500 italic">
                        {p.balance} <span className="text-[10px] uppercase not-italic text-slate-400 ml-1">Lanches</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPartner(p)} className="rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2">
                              <Eye className="h-3.5 w-3.5" /> Ver Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[700px] border-none shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900 p-0 overflow-hidden">
                             <div className="h-2 w-full bg-rose-500" />
                             <div className="p-8">
                                <DialogHeader className="mb-6">
                                  <div className="flex items-center gap-4 mb-2">
                                     <div className="h-16 w-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-inner border border-white dark:border-slate-700">
                                        {selectedPartner?.logo ? <img src={selectedPartner.logo as string} alt={(selectedPartner.name as string) || "Logo"} className="h-full w-full object-cover" /> : <Building2 className="h-8 w-8 text-rose-500" />}
                                     </div>
                                     <div>
                                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                                          {selectedPartner?.name}
                                        </DialogTitle>
                                        <div className="flex items-center gap-3 mt-1.5 font-bold uppercase text-[10px] tracking-widest text-slate-400">
                                          <span className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {selectedPartner?.responsibleName}</span>
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                          <span className="text-rose-500 font-black italic text-sm">{selectedPartner?.balance} Lanches Disponíveis</span>
                                        </div>
                                     </div>
                                  </div>
                                </DialogHeader>

                                <div className="grid gap-6 md:grid-cols-5 h-[400px]">
                                   {/* Formulário de Retirada Rápida */}
                                   <div className="md:col-span-2 space-y-4">
                                      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                                            <ArrowUpRight className="h-3 w-3 text-rose-500" /> Solicitar Retirada
                                         </p>
                                         <div className="space-y-4">
                                            <div className="space-y-1.5">
                                               <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Quantidade de lanches</label>
                                               <Input 
                                                  id="withdrawalQuantity"
                                                  type="number" 
                                                  defaultValue={10} 
                                                  className="h-12 rounded-xl font-black text-base bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                               />
                                            </div>
                                            <Button 
                                              disabled={isWithdrawalLoading}
                                              onClick={() => {
                                                const qty = (document.getElementById('withdrawalQuantity') as HTMLInputElement).value;
                                                if (selectedPartner?.id) {
                                                  handleCreateWithdrawal(selectedPartner.id, parseInt(qty));
                                                }
                                              }}
                                              className="w-full h-12 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-rose-500/20"
                                            >
                                               {isWithdrawalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRightLeft className="h-4 w-4 mr-2" />}
                                               Enviar p/ Cozinha
                                            </Button>
                                         </div>
                                      </div>

                                      <div className="p-5 bg-amber-50 dark:bg-amber-950/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex gap-3">
                                         <Plus className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                         <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed uppercase">
                                            As retiradas solicitadas aqui geram comandas automáticas na fila da cozinha.
                                         </p>
                                      </div>
                                   </div>

                                   {/* Lista de Movimentações */}
                                   <div className="md:col-span-3">
                                      <div className="flex items-center justify-between mb-3 px-1">
                                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Histórico Recente</p>
                                         <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest">{partnerEntries.length} Registros</Badge>
                                      </div>
                                      
                                      <div className="h-[340px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                                         {partnerEntries.map((entry: any) => (
                                            <div key={entry.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 transition-all">
                                               <div className="flex items-center gap-3">
                                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${entry.quantity > 0 ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10' : 'bg-orange-50 text-orange-500 dark:bg-orange-500/10'}`}>
                                                     {entry.quantity > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                                  </div>
                                                  <div>
                                                     <p className="font-black text-[11px] uppercase text-slate-900 dark:text-white leading-none mb-0.5">
                                                        {entry.quantity > 0 ? "Crédito (Venda)" : "Débito (Retirada)"}
                                                     </p>
                                                     <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                                                        <Calendar className="h-2.5 w-2.5" /> 
                                                        {format(new Date(entry.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                                                     </p>
                                                  </div>
                                               </div>
                                               <div className={`font-black tracking-tighter italic ${entry.quantity > 0 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                                                  {entry.quantity > 0 ? '+' : ''}{entry.quantity}
                                               </div>
                                            </div>
                                         ))}
                                         {partnerEntries.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                               <ArrowRightLeft className="h-8 w-8 opacity-20 mb-2" />
                                               <p className="text-[10px] font-black uppercase tracking-widest">Sem movimentações</p>
                                            </div>
                                         )}
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="mt-0">
          <div className="flex flex-col gap-6">
            <div className="relative group flex-1 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="BUSCAR DOADOR OU PARCEIRO..." 
                className="pl-10 h-12 font-bold text-[11px] uppercase border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[1.25rem] shadow-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {donations.map((order: any) => (
                <Card key={order.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-all hover:shadow-xl hover:-translate-y-1 rounded-[2rem]">
                  <div className={`h-1.5 w-full ${order.partnerId ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <CardHeader className="pb-3 pt-4 px-6">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                        {order.items?.length || 0} DOGÕES
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                        VIA: {order.sellerTag}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase truncate">
                      {order.customerName}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                       <Calendar className="h-3 w-3 text-slate-300" />
                       <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {format(new Date(order.createdAt), "dd/MM/yyyy")}
                       </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 px-6 pb-6">
                    <div className={`p-5 rounded-3xl border-2 border-dashed transition-colors ${order.partnerId ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/20' : 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        {order.partnerId ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Building2 className="h-4 w-4 text-rose-500" />}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${order.partnerId ? 'text-emerald-600' : 'text-slate-500'}`}>
                           {order.partnerId ? 'Parceiro Vinculado' : 'Destinar para Parceiro'}
                        </span>
                      </div>

                      <Select 
                        defaultValue={order.partnerId || ""} 
                        onValueChange={(val) => handleAssignPartner(order.id, val)}
                        disabled={!!order.partnerId}
                      >
                        <SelectTrigger className={`w-full bg-white dark:bg-slate-900 border-none font-black text-xs h-12 rounded-2xl shadow-sm ${order.partnerId ? 'cursor-default opacity-80' : ''}`}>
                          <SelectValue placeholder="SELECIONE O PARCEIRO..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 p-2">
                          <SelectItem value="IVC_INTERNAL" className="font-black text-rose-600 hover:bg-rose-50 rounded-xl uppercase text-xs">
                            DOAÇÃO DIRETA (IVC)
                          </SelectItem>
                          {matchingPartners.map((partner: any) => (
                            <SelectItem key={partner.id} value={partner.id} className="font-bold uppercase text-xs rounded-xl">
                              {partner.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {order.partner && (
                         <div className="mt-3 flex items-center gap-2 px-1">
                            <ArrowRightLeft className="h-3 w-3 text-emerald-500 opacity-50" />
                            <p className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 italic truncate">Destinado a: {order.partner.name}</p>
                         </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {donations.length === 0 && !isValidatingSales && (
                <div className="col-span-full flex flex-col items-center justify-center py-24 bg-rose-50/30 dark:bg-rose-950/5 rounded-[4rem] border-2 border-dashed border-rose-100 dark:border-rose-900/20">
                  <div className="bg-white dark:bg-rose-900/20 p-6 rounded-full shadow-sm mb-6">
                    <Users className="h-16 w-16 text-rose-200" />
                  </div>
                  <p className="text-xl font-black text-rose-300 uppercase italic tracking-tighter">Nenhuma doação encontrada</p>
                  <p className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.3em] mt-2 opacity-60">Filtre por doador ou verifique as abas ✨</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
