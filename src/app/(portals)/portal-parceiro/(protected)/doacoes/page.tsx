'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Dog, History, QrCode, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ReceiptModal } from './components/receipt-modal';
import { WithdrawalModal } from './components/withdrawal-modal';

interface WithdrawalRecord {
  id: string;
  time: string;
  total: number;
  status: 'PENDENTE' | 'RETIRADO' | 'CANCELADO';
  details: { label: string; quantity: number }[];
}

export default function DoacoesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRecord | null>(null);
  
  const [stats, setStats] = useState({
    totalRecebido: 0,
    jaRetirados: 0,
    disponiveis: 0
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);

  const handleNewWithdrawal = (pickupTime: string, items: any[]) => {
    const totalQty = items.length;
    const groups = new Map<string, number>();
    
    items.forEach((item: any) => {
      const label = item.removedIngredients.length > 0 
        ? `Personalizado (Sem: ${item.removedIngredients.join(', ')})` 
        : 'Dogão Completo';
      groups.set(label, (groups.get(label) || 0) + 1);
    });

    const details = Array.from(groups.entries()).map(([label, quantity]) => ({ label, quantity }));

    const newRecord: WithdrawalRecord = {
      id: Math.random().toString(36).substring(2, 7).toUpperCase(),
      time: pickupTime,
      total: totalQty,
      status: 'PENDENTE',
      details
    };

    setWithdrawals([newRecord, ...withdrawals]);
    setStats(prev => ({
      ...prev,
      jaRetirados: prev.jaRetirados + totalQty,
      disponiveis: prev.disponiveis - totalQty
    }));

    toast.success(`Agendamento realizado para às ${pickupTime}!`);
  };

  const openReceipt = (withdrawal: WithdrawalRecord) => {
    setSelectedWithdrawal(withdrawal);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doações Recebidas</h1>
          <p className="text-muted-foreground font-medium">Gerencie o saldo e agende a retirada na IVC.</p>
        </div>
        <Button 
          size="lg" 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 shadow-lg gap-2 h-14 px-8 text-lg font-bold"
          disabled={stats.disponiveis <= 0}
        >
          <ShoppingBag className="w-6 h-6" /> Solicitar Retirada
        </Button>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="bg-white border-none shadow-sm">
          <CardHeader className="pb-2 text-center">
            <CardDescription className="uppercase font-bold text-[10px] tracking-widest">Total Recebido</CardDescription>
            <CardTitle className="text-3xl font-black">{stats.totalRecebido}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="pb-2 text-center">
            <CardDescription className="uppercase font-bold text-[10px] tracking-widest text-slate-400">Total Agendado</CardDescription>
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
          <History className="w-5 h-5 text-orange-600"/> Agenda de Retiradas
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
            {withdrawals.map((w) => (
              <Card key={w.id} className="overflow-hidden border-l-4 border-l-orange-500 shadow-sm flex flex-col">
                <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
                   <div className="flex items-center gap-2 text-orange-700 font-bold">
                      <Clock className="w-4 h-4" /> {w.time}
                   </div>
                   <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                      #{w.id}
                   </span>
                </div>
                <CardContent className="p-4 space-y-4 flex-1">
                   <div className="flex items-center gap-3 border-b pb-3">
                      <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                        <Dog className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 leading-none">Total de dogs</p>
                        <p className="text-2xl font-black text-slate-800">{w.total}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      {w.details.map((detail, idx) => (
                        <div key={idx} className="flex justify-between text-xs items-start gap-4">
                           <span className="text-slate-600 font-medium leading-tight">• {detail.label}</span>
                           <span className="font-black text-slate-800 whitespace-nowrap">{detail.quantity} un</span>
                        </div>
                      ))}
                   </div>
                </CardContent>
                <div className="p-3 bg-slate-50/50 border-t grid grid-cols-2 gap-2">
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] font-bold uppercase tracking-widest gap-2"
                    onClick={() => openReceipt(w)}
                   >
                      <QrCode className="w-3 h-3" /> Comprovante
                   </Button>
                   <Button variant="ghost" size="sm" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-600">
                      Cancelar
                   </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <WithdrawalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        availableBalance={stats.disponiveis}
        onConfirm={handleNewWithdrawal}
      />

      <ReceiptModal 
        isOpen={isReceiptOpen} 
        onClose={() => setIsReceiptOpen(false)} 
        withdrawal={selectedWithdrawal}
      />
    </div>
  );
}