'use client';

import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetchApi, FetchCtx } from "@/lib/api";

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function MinhaRedeAcertosPage() {
  const [mounted, setMounted] = useState(false);
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

  // Busca células da rede para depois buscar acertos de cada célula
  const { data: networkData } = useSWR(
    mounted && resolvedNetworkId ? ["network-acertos-net", resolvedNetworkId] : null,
    () => fetchApi(FetchCtx.ERP, `/cells-networks/show/${resolvedNetworkId}`, { cache: "no-store" })
  );

  const cells = networkData?.cells || [];

  // Busca acertos de todas as células
  const { data: settlementsData, isLoading } = useSWR(
    mounted && cells.length > 0 ? ["network-acertos", resolvedNetworkId] : null,
    async () => {
      const results = await Promise.all(
        cells.map((c: any) =>
          fetchApi(FetchCtx.ERP, `/cash-settlements/cell/${c.id}`, { cache: 'no-store' })
            .then((data: any) => (Array.isArray(data) ? data : []).map((s: any) => ({ ...s, cellName: c.name })))
            .catch(() => [])
        )
      );
      return results.flat();
    }
  );

  const settlements = settlementsData || [];

  // Agrupa por contributor
  const byContributor: Record<string, { name: string; username: string; cellName: string; pending: number; confirmed: number }> = {};
  for (const s of settlements) {
    const id = s.contributor?.id ?? 'unknown';
    if (!byContributor[id]) {
      byContributor[id] = {
        name: s.contributor?.name ?? '—',
        username: s.contributor?.username ?? '—',
        cellName: s.cellName ?? '—',
        pending: 0,
        confirmed: 0,
      };
    }
    const balance = (s.totalAmount ?? 0) - (s.paidAmount ?? 0);
    if (balance > 0) byContributor[id].pending += balance;
    byContributor[id].confirmed += s.paidAmount ?? 0;
  }

  const members = Object.values(byContributor).sort((a, b) => b.pending - a.pending);
  const totalPending = members.reduce((a, m) => a + m.pending, 0);
  const totalConfirmed = members.reduce((a, m) => a + m.confirmed, 0);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="bg-violet-600 p-3 rounded-2xl shadow-lg shadow-violet-600/20">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Acertos da <span className="text-violet-600">Rede</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
            Repasses de vendas em dinheiro de toda a rede
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-orange-600 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-100">Total Pendente</p>
            <p className="text-3xl font-black text-white mt-1">{fmt(totalPending)}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Confirmado</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{fmt(totalConfirmed)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-600" /> Membros da Rede
          </CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Membro</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Célula</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Pendente</TableHead>
              <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>{[1,2,3,4].map(j => <TableCell key={j}><div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" /></TableCell>)}</TableRow>
              ))
            ) : members.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-48 text-center"><p className="font-bold text-slate-400 uppercase text-xs tracking-widest italic">Nenhum acerto registrado</p></TableCell></TableRow>
            ) : members.map((m) => (
              <TableRow key={m.username} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                <TableCell className="pl-8 py-4">
                  <p className="font-black text-sm uppercase italic text-slate-900 dark:text-white">{m.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold">@{m.username}</p>
                </TableCell>
                <TableCell className="text-[11px] font-bold text-slate-500">{m.cellName}</TableCell>
                <TableCell className="text-right">
                  <span className={`font-black text-lg ${m.pending > 0 ? 'text-orange-500' : 'text-slate-300'}`}>{fmt(m.pending)}</span>
                </TableCell>
                <TableCell className="pr-8 text-right">
                  <span className={`font-black text-lg ${m.confirmed > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>{fmt(m.confirmed)}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
