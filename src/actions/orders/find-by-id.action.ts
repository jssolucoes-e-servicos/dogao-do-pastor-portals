"use server";

import { OrderEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const findOrdersByIdAction = async (id: string): Promise<OrderEntity | null> => {
  try {
    const order = await fetchApi(FetchCtx.CUSTOMER, `/orders/${id}`, {
      cache: "no-store"
    })
    return order
  } catch (error) {
    console.error(error);
    return null
  }
};
