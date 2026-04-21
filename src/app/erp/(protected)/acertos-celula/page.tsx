'use client';

import { GetCellSettlementsAction } from '@/actions/cash-settlement';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUser } from '@/hooks/use-user';

type Settlement = {
  id: string;
  totalAmount: number;
  amount?: number;
  status: string;
  paymentMethod?: string;
  submittedAt?: string;
  confirmedAt?: string;
  contributor?: { id: string; name: string; username: string };
  orders?: { id: string }[];
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'PIX Gerado',
  SUBMITTED: 'Aguardando Confirmação',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700',
  PROCESSING: 'bg-violet-100 text-violet-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-600',
};
const METHOD_LABEL: Record<string, string> = {
  PIX_QRCODE: 'PIX QR Code',
  PIX_IVC: 'PIX IVC',
  CASH: 'Tesouraria',
};

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AcertosCelulaPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const [resolvedCellId, setResolvedCellId] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (user?.leaderCellId) { setResolvedCellId(user.leaderCellId); return; }
    import('@/lib/api').then(({ fetchApi, FetchCtx }) =>
      fetchApi(FetchCtx.ERP, '/contributors/me', { cache: 'no-store' })
        .then((me: any) => setResolvedCellId(me?.cells?.[0]?.id ?? null))
        .catch(() => setResolvedCellId(null))
    );
  }, [mounted, user?.leaderCellId]);

  const cellId = resolvedCellId;

  const { data: res, isLoading } = useSWR(
    mounted && cellId ? ['cell-settlements', cellId] : null,
    () => GetCellSettlementsAction(cellId!),
    { refreshInterval: 20000 },
  );

  const settlements: Settlement[] = res?.data ?? [];

  // Agrupa por contributor para mostrar resumo por pessoa
  const byContributor: Record<string, { name: string; username: string; pending: number; confirmed: number; items: Settlement[] }> = {};
  for (const s of settlements) {
    const id = s.contributor?.id ?? 'unknown';
    if (!byContributor[id]) {
      byContributor[id] = {
        name: s.contributor?.name ?? '—',
        username: s.contributor?.username ?? '—',
        pending: 0,
        confirmed: 0,
        items: [],
      };
    }
    if (['PENDING', 'PROCESSING', 'SUBMITTED'].includes(s.status)) {
      byContributor[id].pending += s.totalAmount;
    }
    if (s.status === 'CONFIRMED') {
      byContributor[id].confirmed += s.amount ?? 0;
    }
    byContributor[id].items.push(s);
  }

  const members = Object.values(byContributor).sort((a, b) => b.pending - a.pending);

  const totalPending = members.reduce((a, m) => a + m.pending, 0);
  const totalConfirmed = members.reduce((a, m) => a + m.confirmed, 0);

  if (!mounted) return null;

  if (!cellId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <DollarSign className="h-10 w-10 text-slate-300" />
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
          Você não é líder de nenhuma célula
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Acertos da <span className="text-blue-600">Célula</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
            Repasses de vendas em dinheiro dos membros
          </p>
        </div>
      </div>

      {/* Totais */}
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

      {/* Resumo por membro */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" /> Membros da Célula
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Membro</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Pendente</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmado</TableHead>
                <TableHead className="pr-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Registros</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1, 2, 3, 4].map((j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <p className="font-bold text-slate-400 uppercase text-xs tracking-widest italic">
                      Nenhum acerto registrado
                    </p>
                    <p className="text-[10px] text-slate-300 mt-2">
                      Vendas em dinheiro dos membros aparecerão aqui
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.username} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                    <TableCell className="pl-8 py-4">
                      <p className="font-black text-sm uppercase italic text-slate-900 dark:text-white">{m.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">@{m.username}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-black text-lg ${m.pending > 0 ? 'text-orange-500' : 'text-slate-300'}`}>
                        {fmt(m.pending)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-black text-lg ${m.confirmed > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                        {fmt(m.confirmed)}
                      </span>
                    </TableCell>
                    <TableCell className="pr-8 text-center">
                      <span className="font-black text-sm text-slate-500">{m.items.length}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detalhes de todos os registros */}
      {settlements.length > 0 && (
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-sm font-black uppercase tracking-widest">
              Todos os Registros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Membro</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Saldo</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Forma</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                  <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((s) => (
                  <TableRow key={s.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                    <TableCell className="pl-8 py-3">
                      <p className="font-black text-xs uppercase italic text-slate-900 dark:text-white">
                        {s.contributor?.name ?? '—'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {s.orders?.length ?? 0} venda(s)
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-black text-sm text-slate-900 dark:text-white">
                      {fmt(s.totalAmount)}
                    </TableCell>
                    <TableCell className="text-[11px] font-bold text-slate-500">
                      {s.paymentMethod ? (METHOD_LABEL[s.paymentMethod] ?? s.paymentMethod) : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${STATUS_COLOR[s.status] ?? 'bg-slate-100 text-slate-500'} border-none text-[9px] font-black`}>
                        {STATUS_LABEL[s.status] ?? s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-[10px] font-bold text-slate-400">
                      {s.confirmedAt
                        ? `✓ ${format(new Date(s.confirmedAt), 'dd/MM HH:mm', { locale: ptBR })}`
                        : s.submittedAt
                          ? format(new Date(s.submittedAt), 'dd/MM HH:mm', { locale: ptBR })
                          : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
