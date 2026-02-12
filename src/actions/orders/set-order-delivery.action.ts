// src/actions/orders/set-order-delivery.actions.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const SetOrderDeliveryAction = async (orderId: string, addressId: string): Promise<OrderEntity> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/set-delivery`, {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        addressId
      })
    });
    return data as OrderEntity;
  } catch (error: any) {
      if (error.message === 'NEXT_REDIRECT') throw error;
      console.error(`Falha ao definir pedido ${orderId} como para entrega: `, error);
      throw new Error('Falha ao definir pedido para ser entregue. Tente novamante.')
      
    }
};