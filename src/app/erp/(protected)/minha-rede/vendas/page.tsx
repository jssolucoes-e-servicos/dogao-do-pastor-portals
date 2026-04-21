'use client';

import { useUser } from "@/hooks/use-user";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingBag, Search } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetchApi, FetchCtx } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusLabel: Record<string, string> = {
  PAID: 'Pago', PENDING_PAYMENT: 'Aguardando', CANCELLED: 'Cancelado', DELIVERED: 'Entregue',
};
const statusColor: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700', PENDING_PAYMENT: 'bg-orange-100 text-orange-700',
  CANCELLED: 'bg-red-100 text-red-600', DELIVERED: 'bg-blue-100 text-blue-700',
};
const deliveryLabel: Record<string, string> = {
  PICKUP: 'Retirada', DELIVERY: 'Entrega', DONATE: 'Doação',
};

export default function MinhaRedeVendasPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [resolvedNetworkId, setResolvedNetworkId] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (user?.supervisorNetworkId) { setResolvedNetworkId(user.supervisorNetworkId); return; }
    fetchApi(FetchCtx.ERP, '/contributors/me', { cache: 'no-store' })
      .then((me: any) => setResolvedNetworkId(me?.cellNetworks?.[0]?.id ?? null))
      .catch(() => setResolvedNetworkId(null));
  }, [mounted, user?.supervisorNetworkId]);

  const { data: ordersData, isLoading } = useSWR(
    mounted && resolvedNetworkId ? ["network-vendas", resolvedNetworkId] : null,
    () => fetchApi(FetchCtx.ERP, `/orders?perPage=200`, { cache: "no-store" })
  );

  const allOrders = ordersData?.data || [];
  const filtered = allOrders.filter((o: any) =>
    !search ||
    o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    o.sellerTag?.toLowerCase().includes(search.toLowerCase())
  );

  const paidOrders = allOrders.filter((o: any) => o.paymentStatus === 'PAID');
  const totalDogs = paidOrders.reduce((a: number, o: any) => a + (o.items?.length || 0), 0);
  const totalRevenue = paidOrders.reduce((a: number, o: any) => a + (o.totalValue || 0), 0);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="bg-violet-600 p-3 rounded-2xl shadow-lg shadow-violet-600/20">
          <ShoppingBag className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Vendas da <span className="text-violet-600">Rede</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
            Todas as vendas das células da rede
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-violet-600 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-100">Dogs Vendidos</p>
            <p className="text-3xl font-black text-white mt-1">{totalDogs}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pedidos Pagos</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{paidOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Receita</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Buscar cliente ou vendedor..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-10 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-xs" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vendedor</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Dogs</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{[1,2,3,4,5,6,7].map(j => <TableCell key={j}><div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" /></TableCell>)}</TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="h-48 text-center"><p className="font-bold text-slate-400 uppercase text-xs tracking-widest italic">Nenhuma venda encontrada</p></TableCell></TableRow>
            ) : filtered.map((o: any) => (
              <TableRow key={o.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                <TableCell className="pl-8 py-4">
                  <p className="font-black text-xs uppercase italic text-slate-900 dark:text-white">{o.customerName}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{o.customerPhone}</p>
                </TableCell>
                <TableCell className="text-[11px] font-bold text-slate-500">{o.sellerTag}</TableCell>
                <TableCell className="text-[11px] font-bold text-slate-500">{deliveryLabel[o.deliveryOption] || o.deliveryOption}</TableCell>
                <TableCell className="text-center font-black text-sm text-violet-600">{o.items?.length || 0}</TableCell>
                <TableCell className="text-right font-black text-sm text-slate-900 dark:text-white">
                  {(o.totalValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`${statusColor[o.status] || 'bg-slate-100 text-slate-500'} border-none text-[9px] font-black`}>
                    {statusLabel[o.status] || o.status}
                  </Badge>
                </TableCell>
                <TableCell className="pr-8 text-[10px] font-bold text-slate-400">
                  {o.createdAt ? format(new Date(o.createdAt), "dd/MM/yy HH:mm", { locale: ptBR }) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
