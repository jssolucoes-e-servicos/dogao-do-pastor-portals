"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, MapPin, Navigation, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function AnalysisModal({ order, isOpen, onClose, onConfirm, isProcessing }: any) {
  const [obs, setObs] = useState<string>("");

  useEffect(() => {
    if (isOpen) setObs("");
  }, [order?.id, isOpen]);

  if (!order) return null;

  // Direto ao ponto: quantos itens tem na lista
  const totalItems = order.items?.length || 0;

  const distanceMatch = order.observations?.match(/distância ([\d.]+)KM/);
  const distance = distanceMatch ? distanceMatch[1] : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-orange-500/20 shadow-2xl p-0 bg-background overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="uppercase font-black tracking-widest text-xl flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Navigation className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            Analisar Pedido
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-5">
          {/* DASHBOARD DE DECISÃO */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20 text-center">
              <p className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 mb-1">Total</p>
              <p className="font-black text-sm text-emerald-700 dark:text-emerald-300">R$ {order.totalValue?.toFixed(2)}</p>
            </div>
            <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/20 text-center">
              <p className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 mb-1">Dogs</p>
              <p className="font-black text-sm text-blue-700 dark:text-blue-300">{totalItems} un.</p>
            </div>
            <div className="bg-orange-500/5 p-3 rounded-xl border border-orange-500/20 text-center">
              <p className="text-[9px] font-black uppercase text-orange-600 dark:text-orange-400 mb-1">KM</p>
              <p className="font-black text-sm text-orange-700 dark:text-orange-300">{distance || 'N/D'}</p>
            </div>
          </div>

          {/* ENDEREÇO */}
          {order.address && (
            <div className="bg-accent/30 p-4 rounded-2xl border border-border flex gap-4">
              <div className="p-2 bg-background rounded-full shadow-sm border border-border h-fit">
                <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Entrega em:</p>
                <p className="font-bold text-sm text-foreground leading-tight">{order.address.street}, {order.address.number}</p>
                <p className="text-xs text-muted-foreground">{order.address.neighborhood} — {order.address.city}/{order.address.state}</p>
              </div>
            </div>
          )}

          {/* ALERTA DE SISTEMA */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-[11px] text-foreground/80 font-medium italic leading-tight">{order.observations}</p>
          </div>

          {/* RESPOSTA */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Resposta da análise</Label>
            <Textarea 
              placeholder="Digite aqui o que o cliente lerá..."
              className="min-h-[80px] text-sm bg-background border-border focus-visible:ring-orange-500 rounded-xl"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/20 border-t border-border flex flex-row gap-3">
          <Button variant="ghost" className="flex-1 text-destructive font-black uppercase text-[10px] h-12 rounded-xl" onClick={() => onConfirm(false, obs)} disabled={isProcessing}>
            <XCircle className="h-4 w-4 mr-2" /> Recusar
          </Button>
          <Button className="flex-[1.5] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] h-12 rounded-xl" onClick={() => onConfirm(true, obs)} disabled={isProcessing}>
            <CheckCircle className="h-4 w-4" /> {isProcessing ? "Gravando..." : "Aprovar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}