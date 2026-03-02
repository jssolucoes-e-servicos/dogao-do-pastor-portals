"use client"
import { DownstepOrderAction } from "@/actions/orders/downstep-order.action";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface OrderOnlineContentsBaseProps {
  title: string;
  subtitle?: string;
  orderId: string;
  noBack?: boolean;
  children: React.ReactNode;
}
export function OrderOnlineContentsBase({ title, subtitle, children, orderId, noBack = false }: OrderOnlineContentsBaseProps) {
  const [isGoingBack, setIsGoingBack] = useState(false);
  const handleBack = async () => {
    try {
      setIsGoingBack(true);
      await DownstepOrderAction(orderId!);
      window.location.reload(); 
    } catch (error: any) {
      toast.error(error.message);
      setIsGoingBack(false);
    }
  };

  return (

    <div className="relative flex flex-col mb-8 pt-4 gap-6 p-4 rounded-lg bg-white shadow-lg w-full  border-l-orange-500 border-l-5">
      {!noBack && (
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
      )}
      

      <h2 className="text-2xl font-bold text-center text-slate-900 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-slate-500 text-center text-sm mt-1">
        {subtitle}
      </p>
      )}
      
      
      
      {/* <h2 className="text-2xl font-bold text-center">{title}</h2> */}
      {children}
    </div>
  )
}