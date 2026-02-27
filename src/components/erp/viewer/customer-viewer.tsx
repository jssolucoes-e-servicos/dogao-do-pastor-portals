// src/components/erp/customers/customer-viewer.tsx
"use client"

import { CustomerEntity, OrderEntity } from "@/common/entities";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { StringsHelper } from "@/common/helpers/string-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Banknote,
  Calendar, CheckCircle2, ChevronRight,
  Fingerprint,
  Flame,
  History,
  ShoppingBag, Smartphone,
  User, XCircle
} from "lucide-react";
import Link from "next/link";

interface Props {
  customer: CustomerEntity;
}

export function CustomerViewer({ customer }: Props) {
  
  // Filtros baseados na flag 'active' da edição que vem no pedido
  const currentOrders = customer.orders?.filter(o => o.edition?.active === true) || [];
  const historyOrders = customer.orders?.filter(o => o.edition?.active !== true) || [];

  // Somente o que está efetivamente pago entra no somatório financeiro
  const currentPaidOrders = currentOrders.filter(o => o.paymentStatus === "PAID");
  const totalPaidCurrent = currentPaidOrders.reduce((acc, ord) => acc + ord.totalValue, 0);
  const totalPaidGeneral = customer.orders?.filter(o => o.paymentStatus === "PAID")
    .reduce((acc, ord) => acc + ord.totalValue, 0) || 0;

  // Total de lanches pagos nesta edição
  const currentDogsCount = currentPaidOrders.reduce((acc, ord) => acc + (ord.items?.length || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* COLUNA 1: PERFIL DO CLIENTE */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="bg-slate-50/80 dark:bg-slate-900/40 border-b p-5">
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" /> Cadastro do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Nome Completo</label>
              <p className="font-black text-xl text-foreground uppercase leading-tight">{customer.name}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                <Fingerprint className="h-4 w-4 text-slate-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground leading-none">CPF</span>
                  <span className="text-sm font-bold text-foreground">
                    {customer.cpf ? NumbersHelper.maskCPF(customer.cpf) : "Não informado"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                <Smartphone className="h-4 w-4 text-emerald-600" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground leading-none">WhatsApp</span>
                  <span className="text-sm font-bold text-foreground">
                    {customer.phone ? NumbersHelper.maskPhone(customer.phone) : "Não informado"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t dark:border-slate-800 space-y-3">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block">Vínculo com a Igreja</label>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Já conhece a igreja?</span>
                  {customer.knowsChurch ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-slate-300" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Permite contato?</span>
                  {customer.allowsChurch ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-400" />}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* COLUNA 2 & 3: HISTÓRICO E OPERAÇÃO */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-orange-800 border-none text-white relative overflow-hidden shadow-sm">
                <CardContent className="p-4 flex flex-col justify-center min-h-[100px]">
                    <span className="text-[9px] font-black uppercase opacity-90 tracking-widest">Dogs Pagos (Atual)</span>
                    <p className="text-3xl font-black">{currentDogsCount}</p>
                    <Flame className="absolute right-[-10px] bottom-[-10px] h-16 w-16 opacity-20 rotate-12" />
                </CardContent>
            </Card>

            <Card className="bg-emerald-800 border-none text-white relative overflow-hidden shadow-sm">
                <CardContent className="p-4 flex flex-col justify-center min-h-[100px]">
                    <span className="text-[9px] font-black uppercase opacity-90 tracking-widest">Valor Pago (Atual)</span>
                    <p className="text-xl font-black">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaidCurrent)}
                    </p>
                    <Banknote className="absolute right-[-10px] bottom-[-10px] h-16 w-16 opacity-20" />
                </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-background">
                <CardContent className="p-4 flex flex-col justify-center min-h-[100px]">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Total Geral Pago</span>
                    <p className="text-xl font-black text-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaidGeneral)}
                    </p>
                </CardContent>
            </Card>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-full flex flex-col gap-1 py-4 border-2 border-dashed border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                  <History className="h-5 w-5 text-blue-600" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-center">Histórico<br/>Antigo</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4">
                  <DialogTitle className="text-xl font-black uppercase flex items-center gap-2 font-black">
                    <History className="h-5 w-5 text-blue-600" /> Registro de Edições Passadas
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-1 mt-4">
                  {historyOrders.length > 0 ? (
                    historyOrders.map(order => <OrderListRow key={order.id} order={order} />)
                  ) : (
                    <div className="py-20 text-center text-muted-foreground italic text-xs uppercase font-bold tracking-widest opacity-30">
                        Nenhum pedido em edições passadas
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
        </div>

        {/* LISTA PRINCIPAL (EDIÇÃO ATUAL) */}
        <Card className="shadow-sm border-orange-200 dark:border-orange-900/30 overflow-hidden">
          <CardHeader className="border-b p-5 bg-orange-50/50 dark:bg-orange-950/20 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-orange-800 dark:text-orange-400">
              <ShoppingBag className="h-4 w-4" /> Operação na Edição Ativa
            </CardTitle>
            <Badge className="font-black bg-orange-600 text-white border-none px-3">
                {currentOrders.length} {currentOrders.length === 1 ? 'PEDIDO' : 'PEDIDOS'}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {currentOrders.length > 0 ? (
              <div className="divide-y dark:divide-slate-800">
                {currentOrders.map((order: OrderEntity) => (
                  <OrderListRow key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="p-20 text-center flex flex-col items-center gap-2 opacity-50 italic text-sm">
                <ShoppingBag className="h-10 w-10 mb-2 text-orange-200" />
                <p className="font-bold uppercase text-[10px] tracking-widest">Nenhum pedido nesta edição.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Subcomponente de Linha com Dualidade de Status
function OrderListRow({ order }: { order: OrderEntity }) {
    const orderStatus = StringsHelper.getOrderStatus(order.status);
    const paymentStatus = StringsHelper.getPaymentStatus(order.paymentStatus);

    return (
        <div className="p-4 hover:bg-muted/40 transition-all flex items-center justify-between group border-l-4 border-l-transparent hover:border-l-blue-500">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="font-black text-sm uppercase tracking-tighter text-foreground">
                        #{order.id.slice(-6).toUpperCase()}
                    </span>
                    
                    {/* Status Operacional */}
                    <Badge className={`${orderStatus.color} text-white border-none text-[9px] uppercase font-black px-2 py-0`}>
                        {orderStatus.label}
                    </Badge>

                    {/* Status Financeiro */}
                    <Badge variant="outline" className={`${paymentStatus.color} text-[9px] uppercase font-black px-2 py-0`}>
                        PGTO: {paymentStatus.label}
                    </Badge>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-tight mt-1">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {format(new Date(order.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </span>
                    <span className="text-blue-600 font-black">
                        {order.seller?.name?.toUpperCase() || order.sellerTag?.toUpperCase() || 'WEB'}
                    </span>
                    <span className="text-orange-600 font-black flex items-center gap-1">
                        <Flame className="h-3 w-3" /> {order.items?.length || 0} ITEMS
                    </span>
                    {order.edition && (
                        <span className="bg-muted px-2 py-0.5 rounded text-[9px] text-slate-500">
                            {order.edition.name}
                        </span>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1">Total</span>
                    <span className={`font-black text-base ${order.paymentStatus === 'PAID' ? 'text-foreground' : 'text-muted-foreground opacity-60'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalValue)}
                    </span>
                </div>
                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-all hover:bg-blue-50 dark:hover:bg-blue-950" asChild>
                    <Link href={`/erp/vendas/${order.id}`}><ChevronRight className="h-5 w-5 text-blue-600" /></Link>
                </Button>
            </div>
        </div>
    );
}