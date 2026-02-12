"use server";

import { OrderEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const ChangePaymentMethodAction = async (orderId: string): Promise<OrderEntity> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/change-payment-method`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId:orderId, 
      }),
    });

    return data as OrderEntity;
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    throw new Error('Falha ao redefinir metodo de pagamento.');
  }
};