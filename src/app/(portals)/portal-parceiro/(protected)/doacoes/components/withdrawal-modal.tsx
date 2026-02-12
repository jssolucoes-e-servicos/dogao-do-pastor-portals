'use client';

import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Clock, Dog, Loader2 } from 'lucide-react';
import HotDogModal from '@/components/modals/hotdog-modal';
import { toast } from 'sonner';

interface IOrderItem {
  id: number;
  removedIngredients: string[];
}

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onConfirm: (pickupTime: string, items: IOrderItem[]) => void;
}

export function WithdrawalModal({ isOpen, onClose, availableBalance, onConfirm }: WithdrawalModalProps) {
  const [pickupTime, setPickupTime] = useState('');
  const [orderItems, setOrderItems] = useState<IOrderItem[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reseta ou inicializa o modal ao abrir
  useEffect(() => {
    if (isOpen) {
      setPickupTime('');
      // Inicia com todos os dogs como "Completos" por padrão
      const initialItems = Array.from({ length: availableBalance }, (_, i) => ({
        id: Date.now() + i,
        removedIngredients: [],
      }));
      setOrderItems(initialItems);
    }
  }, [isOpen, availableBalance]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, { quantity: number; removed: string[]; key: string }>();
    orderItems.forEach((item) => {
      const key = item.removedIngredients.sort().join('|') || 'completo';
      if (groups.has(key)) {
        groups.get(key)!.quantity += 1;
      } else {
        groups.set(key, { quantity: 1, removed: item.removedIngredients, key });
      }
    });
    return Array.from(groups.values());
  }, [orderItems]);

  const currentTotal = orderItems.length;

  const handleUpdateQuantity = (key: string, delta: number) => {
    if (delta > 0 && currentTotal >= availableBalance) {
      toast.error("Limite do saldo atingido.");
      return;
    }

    setOrderItems(prev => {
      if (delta > 0) {
        const itemToCopy = prev.find(i => (i.removedIngredients.sort().join('|') || 'completo') === key);
        return [...prev, { id: Date.now() + Math.random(), removedIngredients: itemToCopy?.removedIngredients || [] }];
      } else {
        const index = prev.findLastIndex(i => (i.removedIngredients.sort().join('|') || 'completo') === key);
        return prev.filter((_, i) => i !== index);
      }
    });
  };

  const handleAddCustom = (removedIngredients: string[]) => {
    if (currentTotal >= availableBalance) {
      toast.error("Saldo insuficiente.");
      return;
    }
    setOrderItems(prev => [...prev, { id: Date.now(), removedIngredients }]);
  };

  const handleConfirm = async () => {
    if (!pickupTime) return toast.error("Informe o horário.");
    if (currentTotal === 0) return toast.error("Quantidade inválida.");

    setIsSubmitting(true);
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onConfirm(pickupTime, orderItems);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dog className="text-orange-600" /> Agendar Retirada na IVC
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-2 text-center bg-slate-50 p-4 rounded-xl border border-dashed">
            <Label className="text-xs font-bold uppercase text-slate-500">Saldo que será utilizado</Label>
            <p className="text-3xl font-black text-slate-800">{currentTotal} / {availableBalance}</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-600"/> Horário de retirada</Label>
            <Input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="h-12 text-lg font-bold text-center"/>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {groupedItems.map(group => (
              <div key={group.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-bold text-sm">{group.removed.length > 0 ? "Personalizado" : "Dogão Completo"}</p>
                  {group.removed.length > 0 && <p className="text-[10px] text-red-500 font-bold uppercase">Sem: {group.removed.join(', ')}</p>}
                </div>
                <div className="flex items-center border rounded-md bg-white">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(group.key, -1)}>-</Button>
                  <span className="w-8 text-center font-bold text-sm">{group.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleUpdateQuantity(group.key, 1)}>+</Button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full border-dashed" onClick={() => setIsCustomizing(true)} disabled={currentTotal >= availableBalance}>
            <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Personalizado
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm} className="w-full bg-orange-600 hover:bg-orange-700 h-12" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirmar Agendamento"}
          </Button>
        </DialogFooter>

        <HotDogModal isOpen={isCustomizing} onClose={() => setIsCustomizing(false)} onSave={handleAddCustom} />
      </DialogContent>
    </Dialog>
  );
}