"use server";

import { OrderEntity } from "@/common/entities";
import { PaymentMethodEnum } from "@/common/enums";
import { fetchApi, FetchCtx } from "@/lib/api";

interface DefinePaymentMethodProps {
  orderId: string;
  method: PaymentMethodEnum;
}

export const DefinePaymentMethodAction = async (values: DefinePaymentMethodProps): Promise<OrderEntity> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/define-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: values.orderId, 
        method: values.method,
      }),
    });

    return data as OrderEntity;
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    throw new Error('Falha ao definir metodo de pagamento.');
  }
};