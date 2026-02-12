"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeliveryDistanceLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPickupSelect: () => void;
  onSendToReview: () => void;
  churchName: string;
  churchAddress: string;
  distanceKm?: number;
}

export function DeliveryDistanceLimitModal({
  isOpen,
  onClose,
  onPickupSelect,
  onSendToReview,
  churchName,
  churchAddress,
  distanceKm,
}: DeliveryDistanceLimitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Limite de entrega excedido</DialogTitle>
          <DialogDescription>
            O endereço informado está a{" "}
            <strong>{distanceKm ? distanceKm.toFixed(2) : "mais de 5"}</strong> km da sede da igreja.
            <br />
            O limite máximo de entrega é de <strong>5 km</strong> da igreja.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>{churchName}</strong>
          </p>
          <p>{churchAddress}</p>
          <p className="mt-2">
            Deseja transformar este pedido em <strong>retirada no local</strong>?
          </p>
        </div>
        <DialogFooter className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onSendToReview}>
            Enviar para análise
          </Button>
          <Button onClick={onPickupSelect} className="bg-orange-600 hover:bg-orange-700">
            Retirada no local
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
