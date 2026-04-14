'use client';

import { GetPartnerStatsAction } from '@/actions/partners/get-stats.action';
import { GetPartnerSessionAction } from '@/actions/auth/get-partner-session.action';
import { ListWithdrawalsAction } from '@/actions/donations/list-withdrawals.action';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Dog, History, QrCode, ShoppingBag } from 'lucide-react';
import { ReceiptModal } from './components/receipt-modal';
import { WithdrawalModal } from './components/withdrawal-modal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default function DoacoesPage() {
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    GetPartnerSessionAction().then((s) => { if (s) setPartnerId(s.id); });
  }, []);

  const { data: statsRes, mutate: mutateStats } = useSWR(
    partnerId ? ['partner-stats', partnerId] : null,
    ([, id]) => GetPartnerStatsAction(id as string),
    { refreshInterval: 15000 }
  );

  const { data: withdrawalsRes, mutate: mutateWithdrawals } = useSWR(
    partnerId ? ['partner-withdrawals', partnerId] : null,
    ([, id]) => ListWithdrawalsAction(id as string),
    { refreshInterval: 15000 }
  );

  const stats = statsRes?.data || { totalRecebido: 0, jaRetirados: 0, disponiveis: 0 };
  const withdrawals: any[] = withdrawalsRes?.data || []; // eslint-disable-line @typescript-eslint/no-explicit-any

  const handleWithdrawalCreated = (withdrawal: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    mutateStats();
    mutateWithdrawals();
    setSelectedWithdrawal(withdrawal);
    setIsReceiptOpen(true);
  };

  const statusLabel: Record<string, string> = {
    PENDING:   'Pendente',
    CONFIRMED: 'Em Produção',
    READY:     'Pronto',
    COMPLETED: 'Finalizado',
    DELIVERED: 'Finalizado',
    CANCELLED: 'Rejeitado',
  };
  const statusColor: Record<string, string> = {
    PENDING:   'bg-orange-100 text-orange-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    READY:     'bg-emerald-100 text-emerald-700',
    COMPLETED: 'bg-green-100 text-green-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doações Recebidas</h1>
          <p className="text-muted-foreground font-medium">Gerencie o saldo e agende a retirada na IVC.</p>
        </div>
        <Button size="lg" onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 shadow-lg gap-2 h-14 px-8 text-lg font-bold"
          disabled={stats.disponiveis <= 0 || !partnerId}>
          <ShoppingBag className="w-6 h-6" /> Solicitar Retirada
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="pb-2 text-center">
            <CardDescription className="uppercase font-bold text-[10px] tracking-widest">Total Recebido</CardDescription>
            <CardTitle className="text-3xl font-black">{stats.totalRecebido}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="pb-2 text-center">
            <CardDescription className="uppercase font-bold text-[10px] tracking-widest text-slate-400">Já Retirados</CardDescription>
            <CardTitle className="text-3xl font-black text-slate-400">{stats.jaRetirados}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-orange-600 border-none shadow-md text-white">
          <CardHeader className="pb-2 text-center">
            <CardDescription className="uppercase font-bold text-[10px] tracking-widest text-orange-100">Saldo Disponível</CardDescription>
            <CardTitle className="text-5xl font-black">{stats.disponiveis}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-black flex items-center gap-2 text-slate-800 uppercase tracking-tight">
          <History className="w-5 h-5 text-orange-600" /> Agenda de Retiradas
        </h3>

        {withdrawals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed p-12 text-center space-y-3">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Clock className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium italic">Nenhum agendamento ativo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {withdrawals.map((w: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              const totalItems = w.items?.length || 0;
              const scheduledTime = w.scheduledAt
                ? format(new Date(w.scheduledAt), "HH:mm 'de' dd/MM", { locale: ptBR })
                : '—';
              const groups = new Map<string, { label: string; quantity: number }>();
              (w.items || []).forEach((item: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                const key = (item.removedIngredients || []).sort().join('|') || 'completo';
                const label = item.removedIngredients?.length > 0
                  ? `Sem: ${item.removedIngredients.join(', ')}` : 'Dogão Completo';
                if (groups.has(key)) groups.get(key)!.quantity++;
                else groups.set(key, { label, quantity: 1 });
              });

              return (
                <Card key={w.id} className="overflow-hidden border-l-4 border-l-orange-500 shadow-sm flex flex-col">
                  <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2 text-orange-700 font-bold text-sm">
                      <Clock className="w-4 h-4" /> {scheduledTime}
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${statusColor[w.status] || 'bg-slate-100 text-slate-500'}`}>
                      {statusLabel[w.status] || w.status}
                    </span>
                  </div>
                  <CardContent className="p-4 space-y-3 flex-1">
                    <div className="flex items-center gap-3 border-b pb-3">
                      <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                        <Dog className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 leading-none">Total de dogs</p>
                        <p className="text-2xl font-black text-slate-800">{totalItems}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {Array.from(groups.values()).map((g, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-slate-600">• {g.label}</span>
                          <span className="font-black">{g.quantity}x</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <div className="p-3 bg-slate-50/50 border-t">
                    <Button variant="outline" size="sm"
                      className="w-full text-[10px] font-bold uppercase tracking-widest gap-2"
                      onClick={() => { setSelectedWithdrawal(w); setIsReceiptOpen(true); }}>
                      <QrCode className="w-3 h-3" /> Ver Comprovante
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {partnerId && (
        <WithdrawalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          availableBalance={stats.disponiveis}
          partnerId={partnerId}
          onConfirm={handleWithdrawalCreated}
        />
      )}

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        withdrawal={selectedWithdrawal}
      />
    </div>
  );
}
