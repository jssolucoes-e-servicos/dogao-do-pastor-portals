// src/actions/orders/update-order-customer.action.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const UpdateOrderObservationsAction = async (orderId: string, observations: string) : Promise<IResponseObject<OrderEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({observations: observations})
    });
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error(`Falha ao sincronizar dados do cliente: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao sincronizar dados do cliente',
    }
  }
};