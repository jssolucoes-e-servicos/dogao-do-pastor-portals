"use server"

import { OrderEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function CreatePdvAction(dto: any): Promise<IResponseObject<OrderEntity>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/orders/create-pdv`, {
      method: "POST",
      body: JSON.stringify(dto),
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao criar pedido PDV: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao registrar venda no PDV",
    };
  }
}
