// src/actions/orders/find-by-id.action.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const findOrdersByIdAction = async (id: string): Promise<IResponseObject<OrderEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/${id}`, {
      cache: "no-store"
    })
    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error(`Falha ao recuperar dados do pedido: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao recuperar dados do pedido',
    }
  }
};
