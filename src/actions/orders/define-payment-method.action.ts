// arc/actions/orders/define-payment-method.action.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { PaymentMethodEnum } from "@/common/enums";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

interface DefinePaymentMethodProps {
  orderId: string;
  method: PaymentMethodEnum;
}

export const DefinePaymentMethodAction = async (values: DefinePaymentMethodProps): Promise<IResponseObject<OrderEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.PUBLIC, `/orders/define-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: values.orderId, 
        method: values.method,
      }),
    });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao definir metodo de pagamento: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao definir metodo de pagamento",
    };
  }
};