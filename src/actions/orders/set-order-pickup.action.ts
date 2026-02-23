// src/actions/orders/set-order-pickup.action.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const SetOrderPickupAction = async (orderId: string): Promise<IResponseObject<OrderEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/set-pickup`, {
      method: 'POST',
      body: JSON.stringify({
        orderId,
      })
    });
    return {
      success: true,
      data: data
    }
  } catch (error) {
      console.error(`Falha ao definir pedido ${orderId} como para retirada: `, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Falha ao definir pedido para ser retirada. Tente novamante.',
      }
      
    }
};