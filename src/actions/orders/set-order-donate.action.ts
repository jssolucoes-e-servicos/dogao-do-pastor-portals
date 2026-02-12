// src/actions/orders/set-order-donate.actions.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const SetOrderDonateAction = async (orderId: string, partnerId: string): Promise<OrderEntity> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/set-donation`, {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        partnerId,
      })
    });
    return data as OrderEntity;
  } catch (error: any) {
      if (error.message === 'NEXT_REDIRECT') throw error;
      console.error(`Falha ao definir pedido ${orderId} como para doacao para instituicao ${partnerId}: `, error);
      throw new Error('Falha ao definir pedido para ser doado. Tente novamante.')
      
    }
};