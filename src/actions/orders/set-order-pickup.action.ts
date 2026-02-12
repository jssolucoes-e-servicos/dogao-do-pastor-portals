// src/actions/orders/set-order-pickup.actions.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const SetOrderPickupAction = async (orderId: string): Promise<OrderEntity> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/set-pickup`, {
      method: 'POST',
      body: JSON.stringify({
        orderId,
      })
    });
    return data as OrderEntity;
  } catch (error: any) {
      if (error.message === 'NEXT_REDIRECT') throw error;
      console.error(`Falha ao definir pedido ${orderId} como para retirada: `, error);
      throw new Error('Falha ao definir pedido para ser retirada. Tente novamante.')
      
    }
};