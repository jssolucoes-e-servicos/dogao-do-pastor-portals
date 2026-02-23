// components/order-online/order-step-header.tsx
'use client';

import { DownstepOrderAction } from "@/actions/orders/downstep-order.action";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface OrderStepHeaderProps {
  orderId?: string;
  title: string;
  subtitle: string;
}

export function OrderStepHeader({ orderId, title, subtitle }: OrderStepHeaderProps) {
  const [isGoingBack, setIsGoingBack] = useState(false);

  const handleBack = async () => {
    try {
      setIsGoingBack(true);
      await DownstepOrderAction(orderId!);
      
      // Como seu roteador envia o usuário para a step do banco, 
      // o refresh vai disparar o redirecionamento automático.
      window.location.reload(); 
    } catch (error: any) {
      toast.error(error.message);
      setIsGoingBack(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center mb-8 pt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        disabled={isGoingBack}
        className="absolute left-0 top-4 text-slate-500 hover:text-orange-600 transition-all hover:bg-orange-50"
      >
        {isGoingBack ? (
          <Loader2 className="size-4 animate-spin mr-1" />
        ) : (
          <ChevronLeft className="size-4 mr-1" />
        )}
        <span className="text-xs font-bold uppercase tracking-wider">Voltar</span>
      </Button>

      <h2 className="text-2xl font-bold text-center text-slate-900 leading-tight">
        {title}
      </h2>
      <p className="text-slate-500 text-center text-sm mt-1">
        {subtitle}
      </p>
    </div>
  );
}