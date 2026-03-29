"use client"

import { CommandsCheckInAction, CheckInItemDto } from "@/actions/commands/check-in.action";
import { INGREDIENTS } from "@/common/configs/indredients";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChefHat, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OrderItemRow {
  id: string;
  removedIngredients: string[];
  unitPrice: number;
}

interface CheckInModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  order: {
    id: string;
    customerName: string;
    items: OrderItemRow[];
  } | null;
}

interface ItemState {
  id: string;
  selected: boolean;
  removedIngredients: string[];
}

export function CheckInModal({ open, onClose, onSuccess, order }: CheckInModalProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ItemState[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (order?.items) {
      setItems(order.items.map((item) => ({
        id: item.id,
        selected: true,
        removedIngredients: [...item.removedIngredients],
      })));
      setEditingItemId(null);
    }
  }, [order]);

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, selected: !i.selected } : i));
  };

  const toggleIngredient = (itemId: string, ingredient: string) => {
    setItems((prev) => prev.map((i) => {
      if (i.id !== itemId) return i;
      const has = i.removedIngredients.includes(ingredient);
      return {
        ...i,
        removedIngredients: has
          ? i.removedIngredients.filter((x) => x !== ingredient)
          : [...i.removedIngredients, ingredient],
      };
    }));
  };

  const selectedCount = items.filter((i) => i.selected).length;

  const handleConfirm = async () => {
    if (!order) return;
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      toast.error("Selecione ao menos 1 item para a comanda");
      return;
    }

    setLoading(true);
    try {
      const dto: CheckInItemDto[] = selectedItems.map((i) => ({
        itemId: i.id,
        removedIngredients: i.removedIngredients,
      }));

      const res = await CommandsCheckInAction(order.id, dto);
      if (res.success) {
        toast.success(`Comanda gerada com ${selectedItems.length} dog${selectedItems.length > 1 ? 's' : ''}!`);
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Erro ao gerar comanda");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="font-black uppercase text-sm">Check-in para Produção</DialogTitle>
              <DialogDescription className="text-[10px] uppercase font-bold text-muted-foreground">
                {order.customerName} • {order.items.length} dog{order.items.length > 1 ? 's' : ''} no pedido
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
            Selecione os dogs para esta comanda
          </p>

          {items.map((item, index) => {
            const isEditing = editingItemId === item.id;
            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border-2 transition-all overflow-hidden",
                  item.selected
                    ? "border-orange-400 bg-orange-50/50 dark:bg-orange-950/10"
                    : "border-slate-100 dark:border-slate-800 opacity-50"
                )}
              >
                <div className="flex items-center gap-3 p-4">
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xs uppercase">Dog #{index + 1}</p>
                    {item.removedIngredients.length > 0 ? (
                      <p className="text-[9px] font-bold text-red-500 uppercase truncate">
                        Sem: {item.removedIngredients.join(", ")}
                      </p>
                    ) : (
                      <p className="text-[9px] text-muted-foreground uppercase">Completo</p>
                    )}
                  </div>
                  {item.selected && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingItemId(isEditing ? null : item.id)}
                      className="h-7 px-3 text-[9px] font-black uppercase rounded-xl hover:bg-orange-100 hover:text-orange-700"
                    >
                      {isEditing ? "Fechar" : "Editar"}
                    </Button>
                  )}
                </div>

                {isEditing && (
                  <div className="px-4 pb-4 border-t border-orange-100 dark:border-orange-900/30 pt-3">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-2 tracking-widest">
                      Remover ingredientes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {INGREDIENTS.map((ing) => {
                        const removed = item.removedIngredients.includes(ing);
                        return (
                          <button
                            key={ing}
                            type="button"
                            onClick={() => toggleIngredient(item.id, ing)}
                            className={cn(
                              "px-3 py-1 rounded-xl text-[9px] font-black uppercase border-2 transition-all",
                              removed
                                ? "bg-red-100 border-red-400 text-red-700"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-orange-300"
                            )}
                          >
                            {removed ? <X className="h-2.5 w-2.5 inline mr-1" /> : null}
                            {ing}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-6 pt-4 border-t flex items-center justify-between gap-4">
          <div className="text-[10px] font-black uppercase text-muted-foreground">
            <span className="text-orange-600 text-sm font-black">{selectedCount}</span> de {items.length} selecionados
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl font-black uppercase text-[10px]">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || selectedCount === 0}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 font-black uppercase text-[10px] gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChefHat className="h-4 w-4" />}
              Enviar para Produção
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
