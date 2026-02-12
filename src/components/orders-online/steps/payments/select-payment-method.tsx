"use client";

import { DefinePaymentMethodAction } from "@/actions/orders/define-payment-method.action";
import { OrderEntity } from "@/common/entities";
import { PaymentMethodEnum } from "@/common/enums";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { toast } from "sonner";

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
    <div className="flex flex-col gap-6 p-4 rounded-lg bg-white shadow-lg w-full">
      <h2 className="text-2xl font-bold text-center">Seu Pedido</h2>
      <div className=" p-4 bg-gray-100 rounded-md">
        <div className="flex justify-between items-center font-bold text-lg">
          <span>Total ({order.items?.length} Dogões):</span>
          <span>{NumbersHelper.formatCurrency(order.totalValue)}</span>
        </div>
      </div>
      <h2 className="text-xl lg:text-2xl font-bold text-center">Escolha o método de pagamento</h2>
      <div className="grid grid-cols-2 gap-6 w-full mx-auto max-w-md justify-center">
        
        {isLoading ? (<Label>Preparando metodo</Label>) : (<Fragment>
          <Button
            onClick={()=>{
              handleDefineMethod(PaymentMethodEnum.PIX);
            }}
            className="flex flex-col rounded-md min-h-22 items-center justify-center gap-2 py-6 bg-green-600 hover:bg-green-700"
          >
            <Image src="/assets/images/pix.svg" alt="PIX" width={40} height={40} />
            <span className="font-bold text-md">Pagar com PIX</span>
          </Button>

          <Button
            onClick={()=>{
              handleDefineMethod(PaymentMethodEnum.CARD);
            }}
            className="flex flex-col rounded-md min-h-22 items-center justify-center gap-2 py-6 bg-blue-600 hover:bg-blue-700"
          >
            <Image src="/assets/images/card.svg" alt="Cartão" width={40} height={40} />
            <span className="font-bold text-md">Cartão de Crédito</span>
          </Button>
        </Fragment>)}
      </div>
    </div>
  );
}
