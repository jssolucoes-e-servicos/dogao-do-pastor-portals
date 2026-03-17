"use server"

import { OrderEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function DeliverOrderAction(orderId: string): Promise<IResponseObject<OrderEntity>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify({
        status: "DELIVERED"
      }),
      cache: "no-store"
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao entregar pedido: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao entregar pedido",
    };
  }
}
