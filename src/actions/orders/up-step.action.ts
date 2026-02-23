// src/actions/orders/up-step.action.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const OrderUpStepAction = async (order: OrderEntity): Promise<IResponseObject<OrderEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/up-step/${order.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error(`Erro avançar etapa: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao avançar para a próxima etapa',
    }
  }
};