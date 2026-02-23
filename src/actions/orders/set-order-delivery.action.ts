// src/actions/orders/set-order-delivery.action.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const SetOrderDeliveryAction = async (orderId: string, addressId: string): Promise<IResponseObject<OrderEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/set-delivery`, {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        addressId
      })
    });
    return {
      success: true,
      data: data,
    }
  } catch (error) {
      console.error(`Falha ao definir pedido ${orderId} como para entrega: `, error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Falha ao definir pedido para ser entregue. Tente novamante.',
      }
      
    }
};