"use server";

import { OrderEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const OrderUpStepAction = async (order: OrderEntity): Promise<OrderEntity|null> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/up-step/${order.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data as OrderEntity;
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    console.error("Erro ao buscar CPF:", error);
    return null
  }
};