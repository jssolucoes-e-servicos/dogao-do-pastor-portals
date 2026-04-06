"use client"

import { CommandsCheckInAction, CheckInItemDto } from "@/actions/commands/check-in.action";
import { INGREDIENTS } from "@/common/configs/indredients";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChefHat, Clock, ExternalLink, Loader2, MapPin, Pencil, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OrderItemRow {
  id: string;
  removedIngredients: string[];
  unitPrice: number;
  commanded?: boolean;
}

interface CheckInModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  order: {
    id: string;
    customerName: string;
    customerPhone?: string;
    paymentType?: string;
    deliveryOption?: string;
    deliveryTime?: string;
    observations?: string;
    // todos os items do pedido (commanded + disponíveis)
    allItems?: OrderItemRow[];
    items: OrderItemRow[]; // apenas os disponíveis (commanded=false)
    commands?: { id: string }[];
  } | null;
}

interface ItemState {
  id: string;
  selected: boolean;
  removedIngredients: string[];
  editing: boolean;
}

export function CheckInModal({ open, onClose, onSuccess, order }: CheckInModalProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ItemState[]>([]);

  useEffect(() => {
    if (order?.items && open) {
      setItems(order.items.map((item) => ({
        id: item.id,
        selected: true,
        removedIngredients: [...item.removedIngredients],
        editing: false,
      })));
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: string) =>
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, selected: !i.selected, editing: false } : i));

  const toggleEdit = (id: string) =>
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, editing: !i.editing } : { ...i, editing: false }));

  const toggleIngredient = (id: string, ing: string) =>
    setItems((prev) => prev.map((i) => {
      if (i.id !== id) return i;
      const has = i.removedIngredients.includes(ing);
      return { ...i, removedIngredients: has ? i.removedIngredients.filter((x) => x !== ing) : [...i.removedIngredients, ing] };
    }));

  const selectAll = () => setItems((prev) => prev.map((i) => ({ ...i, selected: true, editing: false })));
  const selectNone = () => setItems((prev) => prev.map((i) => ({ ...i, selected: false, editing: false })));

  const selectedCount = items.filter((i) => i.selected).length;
  const commandedItems = order?.allItems?.filter((i) => i.commanded) || [];
  const hasCommands = (order?.commands?.length || 0) > 0;

  const handleConfirm = async () => {
    if (!order) return;
    const selected = items.filter((i) => i.selected);
    if (selected.length === 0) { toast.error("Selecione ao menos 1 dog"); return; }
    setLoading(true);
    try {
      const dto: CheckInItemDto[] = selected.map((i) => ({
        itemId: i.id,
        removedIngredients: i.removedIngredients,
      }));
      const res = await CommandsCheckInAction(order.id, dto);
      if (res.success) {
        toast.success(`Comanda gerada com ${selected.length} dog${selected.length > 1 ? 's' : ''}!`);
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
      <DialogContent className="max-w-xl w-full rounded-3xl p-0 overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b bg-slate-50 dark:bg-slate-900 shrink-0">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <ChefHat className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="font-black uppercase text-sm truncate">{order.customerName}</DialogTitle>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {order.customerPhone && <span className="text-[10px] font-bold text-muted-foreground">{order.customerPhone}</span>}
                {order.paymentType && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-none text-[8px] font-black uppercase h-4 px-1.5">{order.paymentType}</Badge>
                )}
                {order.deliveryOption && (
                  <Badge variant="outline" className="text-[8px] font-black uppercase h-4 px-1.5 gap-1">
                    <MapPin className="h-2.5 w-2.5" />
                    {order.deliveryOption === 'PICKUP' ? 'BALCÃO' : order.deliveryOption}
                  </Badge>
                )}
                {order.deliveryTime && (
                  <Badge variant="outline" className="text-[8px] font-black uppercase h-4 px-1.5 gap-1">
                    <Clock className="h-2.5 w-2.5" />{order.deliveryTime}
                  </Badge>
                )}
              </div>
              {/* Links para pedido e comandas */}
              <div className="flex items-center gap-3 mt-2">
                <Link
                  href={`/erp/pedidos/${order.id}`}
                  target="_blank"
                  className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Ver Pedido
                </Link>
                {hasCommands && (
                  <Link
                    href={`/erp/comandas?search=${order.id}`}
                    target="_blank"
                    className="flex items-center gap-1 text-[9px] font-black uppercase text-orange-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> Ver Comandas
                  </Link>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">

          {order.observations && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-2xl px-3 py-2 mb-3">
              <p className="text-[9px] font-black uppercase text-amber-600 mb-0.5">Obs</p>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-300 italic">&ldquo;{order.observations}&rdquo;</p>
            </div>
          )}

          {/* Controles rápidos — só se tiver disponíveis */}
          {items.length > 0 && (
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                {selectedCount} de {items.length} disponíveis selecionados
              </p>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[9px] font-black uppercase text-orange-600 hover:underline">Todos</button>
                <span className="text-muted-foreground text-[9px]">•</span>
                <button onClick={selectNone} className="text-[9px] font-black uppercase text-slate-400 hover:underline">Nenhum</button>
              </div>
            </div>
          )}

          {/* Dogs disponíveis (commanded=false) */}
          {items.map((item, index) => (
            <div key={item.id} className={cn(
              "rounded-2xl border-2 transition-all overflow-hidden",
              item.selected
                ? "border-orange-400 bg-orange-50/40 dark:bg-orange-950/10"
                : "border-slate-100 dark:border-slate-800 opacity-60"
            )}>
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => toggle(item.id)}
                  className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-black text-xs uppercase text-slate-700 dark:text-slate-200">
                    Dog #{index + 1}
                  </span>
                  {item.removedIngredients.length > 0 ? (
                    <span className="ml-2 text-[9px] font-bold text-red-500 uppercase">
                      sem: {item.removedIngredients.join(', ')}
                    </span>
                  ) : (
                    <span className="ml-2 text-[9px] text-muted-foreground uppercase">completo</span>
                  )}
                </div>
                {item.selected && (
                  <button
                    type="button"
                    onClick={() => toggleEdit(item.id)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all",
                      item.editing ? "bg-orange-100 text-orange-700" : "text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                    )}
                  >
                    <Pencil className="h-3 w-3" />
                    {item.editing ? 'ok' : 'editar'}
                  </button>
                )}
              </div>
              {item.editing && (
                <div className="px-3 pb-3 pt-1 border-t border-orange-100 dark:border-orange-900/20">
                  <div className="flex flex-wrap gap-1.5">
                    {INGREDIENTS.map((ing) => {
                      const removed = item.removedIngredients.includes(ing);
                      return (
                        <button
                          key={ing}
                          type="button"
                          onClick={() => toggleIngredient(item.id, ing)}
                          className={cn(
                            "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border transition-all",
                            removed
                              ? "bg-red-100 border-red-400 text-red-700"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-orange-300"
                          )}
                        >
                          {removed && <X className="h-2.5 w-2.5 inline mr-0.5" />}
                          {ing}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Separador se tiver comandados */}
          {commandedItems.length > 0 && (
            <>
              {items.length > 0 && <div className="border-t border-dashed border-slate-200 dark:border-slate-700 my-2" />}
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">
                {commandedItems.length} dog{commandedItems.length > 1 ? 's' : ''} já enviados para produção
              </p>
              {commandedItems.map((item, index) => (
                <div key={item.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-40 px-3 py-2.5 flex items-center gap-2.5">
                  <div className="h-4 w-4 rounded border border-slate-300 dark:border-slate-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-black text-xs uppercase text-slate-500">
                      Dog #{items.length + index + 1}
                    </span>
                    {item.removedIngredients.length > 0 ? (
                      <span className="ml-2 text-[9px] font-bold text-slate-400 uppercase">
                        sem: {item.removedIngredients.join(', ')}
                      </span>
                    ) : (
                      <span className="ml-2 text-[9px] text-slate-400 uppercase">completo</span>
                    )}
                  </div>
                  <span className="text-[8px] font-black uppercase text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                    produção
                  </span>
                </div>
              ))}
            </>
          )}

          {items.length === 0 && commandedItems.length === 0 && (
            <p className="text-center text-slate-400 text-xs font-bold uppercase py-8">Nenhum item encontrado</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 dark:bg-slate-900 shrink-0 flex gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl font-black uppercase text-[10px] h-12">
            Fechar
          </Button>
          {items.length > 0 && (
            <Button
              onClick={handleConfirm}
              disabled={loading || selectedCount === 0}
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] gap-2 h-12"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChefHat className="h-4 w-4" />}
              Enviar {selectedCount} dog{selectedCount !== 1 ? 's' : ''} para Produção
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
