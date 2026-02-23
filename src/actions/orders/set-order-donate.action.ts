// src/actions/orders/set-order-donate.action.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const SetOrderDonateAction = async (
  orderId: string, 
  partnerId: string, 
  observations?: string // Novo parâmetro opcional
): Promise<IResponseObject<OrderEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/set-donation`, {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        partnerId,
        observations, // Enviando para o backend
      })
    });
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error(`Falha ao definir pedido ${orderId} como para doação: `, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao definir pedido para ser doado. Tente novamente.',
    }
  }
};