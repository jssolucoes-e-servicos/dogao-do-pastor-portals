'use client';

import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GitBranch, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetchApi, FetchCtx } from "@/lib/api";
import Link from "next/link";

export default function MinhaRedePagePage() {
  const [mounted, setMounted] = useState(false);
  const [resolvedNetworkId, setResolvedNetworkId] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => { setMounted(true); }, []);

  // Resolve supervisorNetworkId do cookie ou busca do backend
  useEffect(() => {
    if (!mounted) return;
    if (user?.supervisorNetworkId) { setResolvedNetworkId(user.supervisorNetworkId); return; }
    fetchApi(FetchCtx.ERP, '/contributors/me', { cache: 'no-store' })
      .then((me: any) => setResolvedNetworkId(me?.cellNetworks?.[0]?.id ?? null))
      .catch(() => setResolvedNetworkId(null));
  }, [mounted, user?.supervisorNetworkId]);

  const networkId = resolvedNetworkId;

  const { data: networkData } = useSWR(
    mounted && networkId ? ["my-network", networkId] : null,
    () => fetchApi(FetchCtx.ERP, `/cells-networks/show/${networkId}`, { cache: "no-store" })
  );

  const { data: ordersData } = useSWR(
    mounted && networkId ? ["network-orders"] : null,
    () => fetchApi(FetchCtx.ERP, `/orders?perPage=200`, { cache: "no-store" })
  );

  const network = networkData;
  const cells = network?.cells || [];
  const orders = ordersData?.data || [];
  const paidOrders = orders.filter((o: any) => o.paymentStatus === 'PAID');
  const totalDogs = paidOrders.reduce((acc: number, o: any) => acc + (o.items?.length || 0), 0);
  const totalRevenue = paidOrders.reduce((acc: number, o: any) => acc + (o.totalValue || 0), 0);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-violet-600 p-3 rounded-2xl shadow-lg shadow-violet-600/20">
            <GitBranch className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Minha <span className="text-violet-600">Rede</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              {network?.name || "Carregando..."} • {cells.length} célula{cells.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link href="/erp/minha-rede/celulas">
          <Button variant="outline" className="h-10 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 border-slate-200">
            <Users className="h-3.5 w-3.5" /> Ver Células
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Células</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{cells.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-violet-600 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-100">Dogões Vendidos</p>
            <p className="text-3xl font-black text-white mt-1">{totalDogs}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Receita da Rede</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Células da rede */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-600" /> Células da Rede
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Célula</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Líder</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Vendedores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cells.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center">
                    <p className="font-bold text-slate-400 uppercase text-xs tracking-widest italic">Nenhuma célula encontrada</p>
                  </TableCell>
                </TableRow>
              ) : cells.map((cell: any) => (
                <TableRow key={cell.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                  <TableCell className="pl-8 py-4 font-black text-xs uppercase italic text-slate-900 dark:text-white">{cell.name}</TableCell>
                  <TableCell className="text-[11px] font-bold text-slate-500">{cell.leader?.name || "—"}</TableCell>
                  <TableCell className="text-center font-black text-sm text-violet-600">{cell.sellers?.length || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
