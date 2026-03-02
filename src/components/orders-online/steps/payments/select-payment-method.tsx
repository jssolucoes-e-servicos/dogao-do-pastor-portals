"use client";

import { DefinePaymentMethodAction } from "@/actions/orders/define-payment-method.action";
import { OrderEntity } from "@/common/entities";
import { PaymentMethodEnum } from "@/common/enums";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { CardTotal } from "../../card-total";
import { OrderOnlineContentsBase } from "../../content-base";

interface PaymentSelect {
  order: OrderEntity;
}

export function SelectPaymentMethod({ order }: PaymentSelect) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const STEP_ROUTES: Record<string, string> = {
    [PaymentMethodEnum.PIX]:      "/pix",
    [PaymentMethodEnum.CARD]:     "/cartao",
  };

  const handleDefineMethod = async (method: PaymentMethodEnum) => {
    try {
      setIsLoading(true);
      await DefinePaymentMethodAction({
        orderId: order.id,
        method: method,
      });
      
      const toStep = STEP_ROUTES[method]; 
      router.push(`/comprar/${order.id}/pagamento/${toStep}`);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast.error('Ocorreu um erro ao defiir opção pagamento. Tente novamente.');
      setIsLoading(false);
    }
  }

  return (
    <OrderOnlineContentsBase 
      title="Seu pedido"
      orderId={order.id}
    >
      {
        order.items && order.items?.length > 0 && (<CardTotal count={order.items.length} value={order.totalValue}/>)
      }
      <h2 className="text-xl lg:text-2xl font-bold text-center">Escolha o método de pagamento</h2>
      <div className="grid grid-cols-2 gap-6 w-full mx-auto max-w-md justify-center">
        
        {isLoading ? (<Label>Preparando metodo</Label>) : (<Fragment>
          <Button
            onClick={()=>{
              handleDefineMethod(PaymentMethodEnum.PIX);
            }}
            className="flex flex-col rounded-md min-h-22 items-center justify-center gap-2 py-6 bg-amber-600 hover:bg-amber-700"
          >
            <Image src="/assets/images/pix.svg" alt="PIX" width={40} height={40} />
            <span className="font-bold text-md">Pagar com PIX</span>
          </Button>

          <Button
            onClick={()=>{
              handleDefineMethod(PaymentMethodEnum.CARD);
            }}
            className="flex flex-col rounded-md min-h-22 items-center justify-center gap-2 py-6 bg-cyan-600 hover:bg-cyan-700"
          >
            <Image src="/assets/images/card.svg" alt="Cartão" width={40} height={40} />
            <span className="font-bold text-md">Cartão de Crédito</span>
          </Button>
        </Fragment>)}
      </div>
    </OrderOnlineContentsBase>
  );
}
