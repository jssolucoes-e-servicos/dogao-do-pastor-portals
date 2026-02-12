"use server";

import { fetchApi, FetchCtx } from "@/lib/api";

export const UpdateOrderCustomerAction = async (orderId: string, data: { name: string, phone: string }) => {
  return await fetchApi(FetchCtx.CUSTOMER, `/orders/${orderId}/sync-customer`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};