'use client';

import { useUser } from "@/hooks/use-user";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Search } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetchApi, FetchCtx } from "@/lib/api";

export default function MinhaCelulaVendedoresPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const { user } = useUser();

  useEffect(() => { setMounted(true); }, []);

  const cellId = user?.leaderCellId;

  const { data: cellData, isLoading } = useSWR(
    mounted && cellId ? ["cell-sellers", cellId] : null,
    () => fetchApi(FetchCtx.ERP, `/cells/show/${cellId}`, { cache: "no-store" })
  );

  const sellers = (cellData?.sellers || []).filter((s: any) =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.tag?.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="bg-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-600/20">
          <ShoppingBag className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Vendedores da <span className="text-orange-600">Célula</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
            {cellData?.name || "Carregando..."} • {sellers.length} vendedor{sellers.length !== 1 ? 'es' : ''}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar vendedor ou tag..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tag</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Colaborador</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1,2,3,4].map((j) => <TableCell key={j}><div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" /></TableCell>)}
                  </TableRow>
                ))
              ) : sellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <p className="font-bold text-slate-400 uppercase text-xs tracking-widest italic">Nenhum vendedor encontrado</p>
                  </TableCell>
                </TableRow>
              ) : sellers.map((s: any) => (
                <TableRow key={s.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                  <TableCell className="pl-8 py-5 font-black text-xs uppercase italic text-slate-900 dark:text-white">{s.name}</TableCell>
                  <TableCell>
                    <code className="text-[10px] font-black bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-lg">{s.tag}</code>
                  </TableCell>
                  <TableCell className="text-[11px] font-bold text-slate-500">{s.contributor?.name || "—"}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={`${s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'} border-none text-[9px] font-black`}>
                      {s.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
