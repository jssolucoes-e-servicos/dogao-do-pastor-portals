// src/actions/orders/downstep-order.action.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const DownstepOrderAction = async (orderId: string): Promise<IResponseObject<OrderEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/downstep`, {
      method: 'POST',
      body: JSON.stringify({ orderId })
    });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao voltar etapa: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Não foi possível voltar a etapa",
    };
  }
};