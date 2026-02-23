// src/components/order-online/items-form.tsx
'use client';

import { InsertsManyAction } from '@/actions/orders-items/inserts-many.action';
import { OrderEntity } from '@/common/entities';
import { NumbersHelper } from '@/common/helpers/numbers-helper';
import { IOrderItemSend } from '@/common/interfaces';
import HotDogModal from '@/components/modals/hotdog-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Minus, Plus, PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from "sonner";

interface IGroupedItem extends IOrderItemSend {
  quantity: number;
  groupId: string;
}

const groupItems = (items: IOrderItemSend[]): IGroupedItem[] => {
  const groups = new Map<string, IGroupedItem>();
  items.forEach((item) => {
    const key = [...item.removedIngredients].sort().join('|') || 'completo';

    if (groups.has(key)) {
      const group = groups.get(key)!;
      group.quantity += 1;
    } else {
      groups.set(key, {
        ...item,
        quantity: 1,
        groupId: key,
      });
    }
  });
  return Array.from(groups.values());
};

export function ItemsForm({ order }: { order: OrderEntity }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<IOrderItemSend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const totalValue = useMemo(() => {
    return orderItems.length * (order.edition?.dogPrice || 0);
  }, [orderItems.length, order.edition?.dogPrice]);

  const groupedItems = useMemo(() => groupItems(orderItems), [orderItems]);

  const handleSaveCustomization = (removedIngredients: string[]) => {
    const newId = orderItems.length > 0 ? Math.max(...orderItems.map(item => item.id)) + 1 : 1;
    const newItem: IOrderItemSend = {
      id: newId,
      removedIngredients,
    };
    setOrderItems(prev => [...prev, newItem]);
    setIsModalOpen(false);
  };

  const handleIncrement = (groupId: string) => {
    const groupToCopy = groupedItems.find(g => g.groupId === groupId);
    if (!groupToCopy) return;

    const newId = orderItems.length > 0 ? Math.max(...orderItems.map(item => item.id)) + 1 : 1;
    const newItem: IOrderItemSend = {
      id: newId,
      removedIngredients: [...groupToCopy.removedIngredients],
    };
    setOrderItems(prev => [...prev, newItem]);
  };

  const handleDecrement = (groupId: string) => {
    setOrderItems(prev => {
      const indexToRemove = prev.findLastIndex(item => {
        const key = [...item.removedIngredients].sort().join('|') || 'completo';
        return key === groupId;
      });
      if (indexToRemove === -1) return prev;
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleRemoveGroup = (groupId: string) => {
    setOrderItems(prev => prev.filter(item => {
      const itemKey = [...item.removedIngredients].sort().join('|') || 'completo';
      return itemKey !== groupId;
    }));
  };

  const handleProccessItems = async () => {
    setIsLoading(true);
    try {
      await InsertsManyAction(order.id,orderItems);
      toast.success('Itens salvos com sucesso!');
      router.push(`/comprar/${order.id}/tipo-pedido`);
    } catch (error: any) {
      console.error('Erro na requisição:', error);
      toast.error(error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 rounded-lg bg-white shadow-lg w-full max-w-2xl mx-auto">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold">Meus Dogões</h2>
        <p className="text-xs text-gray-500">Edição: {order.edition.name}</p>
      </div>

      <div className="space-y-4">
        {groupedItems.length === 0 ? (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="ghost"
            className={cn(
              "w-full h-auto py-12 flex flex-col items-center justify-center gap-3",
              "border-2 border-dashed border-orange-200 hover:border-orange-400",
              "bg-orange-50/30 hover:bg-orange-50 transition-all duration-300",
              "rounded-xl group"
            )}
          >
          <div className="bg-orange-100 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
            <PlusCircle className="size-8 text-orange-600" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-slate-900 font-bold text-lg">
              Seu carrinho está vazio
            </span>
            <span className="text-slate-500 text-sm flex items-center justify-center gap-1">
              Clique aqui para montar seu <strong className="text-orange-600">Dogão</strong>
            </span>
          </div>
        </Button>
        ) : (
          groupedItems.map(item => (
            <div key={item.groupId} className="flex items-center justify-between p-4 border rounded-md shadow-sm">
              <div className="flex items-center space-x-4">
                <Image src="/assets/images/hot-dog.svg" alt="Hot Dog" width={50} height={50} />
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">
                    {item.removedIngredients.length > 0 ? "Dogão Personalizado" : "Dogão Completo"}
                  </h4>
                  {item.removedIngredients.length > 0 && (
                    <p className="text-[10px] text-red-500 font-bold uppercase">
                      Sem: {item.removedIngredients.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="font-semibold hidden md:inline text-gray-600">
                    {NumbersHelper.formatCurrency(order.edition.dogPrice)}
                </span>

                <div className="flex items-center border rounded-md bg-gray-50">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDecrement(item.groupId)}
                    disabled={isLoading}
                  >
                    <Minus className="size-3" />
                  </Button>

                  <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600"
                    onClick={() => handleIncrement(item.groupId)}
                    disabled={isLoading}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveGroup(item.groupId)} 
                    disabled={isLoading}
                    className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="size-5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {groupedItems.length > 0 && (
        <div className="flex justify-center">
          <Button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-green-300 w-full border-dashed border-2 py-6 text-gray-600 hover:bg-green-800 hover:text-gray-300" 
              disabled={isLoading}
          >
            <PlusCircle className="mr-2 size-5" />
            {orderItems.length === 0 ? 'Adicionar Dogão' : 'Adicionar outro Dogão'}
          </Button>
        </div>
      )}
      

      <div className="mt-4 p-4 bg-slate-900 rounded-md text-white shadow-inner">
        <div className="flex justify-between items-center font-bold text-lg">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase">Total ({orderItems.length} itens)</span>
            <span className="text-orange-400">{NumbersHelper.formatCurrency(totalValue)}</span>
          </div>
        </div>
      </div>

      <Button
        className="w-full bg-orange-600 hover:bg-orange-700 h-12 font-bold"
        onClick={handleProccessItems}
        disabled={orderItems.length === 0 || isLoading}
      >
        {isLoading ? 'Salvando Itens...' : 'Avançar para tipo de pedido'}
      </Button>

      <HotDogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomization}
      />
    </div>
  );
}