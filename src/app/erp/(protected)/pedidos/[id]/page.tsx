'use client';

import { findOrdersByIdAction } from "@/actions/orders/find-by-id.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Phone, 
  ShoppingCart, 
  User, 
  UserCheck, 
  CreditCard,
  Info
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

export default function DetalhesPedidoPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: response, error } = useSWR(
    mounted ? [`order-detail`, id] : null,
    () => findOrdersByIdAction(id)
  );

  const order = response?.data;
  const isLoading = !response && !error;

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest italic">Pedido não encontrado</p>
        <Button onClick={() => router.back()} variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 px-8 font-black text-[10px] uppercase tracking-widest">Voltar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            size="icon" 
            className="rounded-2xl border-slate-200 dark:border-slate-800 w-12 h-12 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Detalhes do <span className="text-orange-600">Pedido</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              ID: #{order.id.slice(-8).toUpperCase()} • Edição: {order.edition?.name || '---'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <Badge className={`${
                order.paymentStatus === 'PAID' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'
            } border-none uppercase text-[10px] font-black px-6 py-2 rounded-full shadow-lg shadow-slate-900/5`}>
                {order.paymentStatus === 'PAID' ? 'PAGO' : 'PENDENTE'}
            </Badge>
            <Badge className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-none uppercase text-[10px] font-black px-6 py-2 rounded-full shadow-lg shadow-slate-900/5">
                {order.status}
            </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-xl">
                    <ShoppingCart className="h-5 w-5 text-orange-600" />
                </div>
                Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-3">
                {order.items?.map((item: any, idx: number) => (
                  <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-neutral-950 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 group hover:border-orange-200 dark:hover:border-orange-900 transition-colors">
                    <div className="flex items-center gap-5">
                       <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-100 dark:border-slate-800 italic">
                         #{idx + 1}
                       </div>
                       <div>
                         <p className="font-black text-sm uppercase text-slate-900 dark:text-white tracking-tight">Dogão do Pastor</p>
                         {item.removedIngredients?.length > 0 ? (
                            <p className="text-[9px] font-bold text-orange-600 uppercase mt-0.5">
                               SEM: {item.removedIngredients.join(", ")}
                            </p>
                         ) : (
                            <p className="text-[9px] font-bold text-emerald-600 uppercase mt-0.5">COMPLETO</p>
                         )}
                       </div>
                    </div>
                    <p className="font-black text-slate-900 dark:text-white italic">R$ {item.unitPrice?.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-8 bg-slate-900 dark:bg-white rounded-[2rem] text-white dark:text-slate-900 flex justify-between items-center shadow-2xl shadow-slate-900/20">
                 <div>
                    <p className="font-black uppercase text-[10px] tracking-[0.3em] opacity-40">Valor Total</p>
                    <p className="text-[9px] font-bold uppercase opacity-60">Faturamento da Edição</p>
                 </div>
                 <p className="text-3xl font-black italic tracking-tighter">R$ {order.totalValue?.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {order.deliveryOption === 'DELIVERY' && order.address && (
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-3">
                   <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-xl text-blue-600">
                      <MapPin className="h-5 w-5" />
                   </div>
                   Logística de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <p className="font-black text-sm text-slate-700 dark:text-slate-300 uppercase leading-snug">
                    {order.address.street}, {order.address.number}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {order.address.neighborhood} • {order.address.city}, {order.address.state}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Complemento</p>
                        <p className="text-xs font-bold uppercase truncate">{order.address.complement || 'Nenhum'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] font-black text-slate-400 uppercase">CEP</p>
                        <p className="text-xs font-bold uppercase tracking-widest">{order.address.zipCode}</p>
                    </div>
                </div>
              </CardContent>
            </Card>
          )}

          {order.observations && (
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600">
                    <Info className="h-5 w-5" />
                  </div>
                  Observações Internas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="p-6 bg-yellow-50/50 dark:bg-yellow-900/5 rounded-3xl border border-yellow-100 dark:border-yellow-900/10">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    {order.observations}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                    <User className="h-4 w-4" />
                </div>
                Proprietário
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-5">
               <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Nome do Cliente</p>
                  <p className="font-black text-xs text-slate-900 dark:text-white uppercase italic tracking-tight truncate">{order.customerName}</p>
               </div>
               <Separator className="bg-slate-100 dark:bg-slate-800" />
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800">
                     <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400">Telefone</p>
                    <p className="font-bold text-[11px] tracking-widest">{order.customerPhone}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800">
                     <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400">Registrado em</p>
                    <p className="font-bold text-[11px] uppercase tracking-tighter">
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
               </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                    <UserCheck className="h-4 w-4" />
                </div>
                Vendedor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-5">
                <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Tag de Faturamento</p>
                    <div className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-black text-xs italic tracking-tighter border border-emerald-100">
                        {order.sellerTag}
                    </div>
                </div>
                {order.seller?.contributor && (
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Responsável Interno</p>
                    <p className="font-bold text-[11px] text-slate-900 dark:text-white uppercase tracking-tight">{order.seller.contributor.name}</p>
                  </div>
                )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                    <CreditCard className="h-4 w-4" />
                </div>
                Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black uppercase text-slate-400">Método Usado</p>
                    <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200 dark:border-slate-800 tracking-widest">{(order as any).paymentType || 'Indefinido'}</Badge>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black uppercase text-slate-400">Ponto de Origem</p>
                    <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200 dark:border-slate-800 tracking-widest">{order.origin}</Badge>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black uppercase text-slate-400">Modalidade</p>
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none text-[9px] font-black uppercase tracking-widest">
                        {order.deliveryOption === 'DELIVERY' ? 'Entrega' : order.deliveryOption === 'PICKUP' ? 'Retirada' : 'Doação'}
                    </Badge>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
