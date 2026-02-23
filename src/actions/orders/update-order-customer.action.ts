// src/actions/orders/update-order-customer.action.ts
"use server";

import { IResponse } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const UpdateOrderCustomerAction = async (orderId: string, values: { name: string, phone: string }) : Promise<IResponse> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/${orderId}/sync-customer`, {
      method: 'PATCH',
      body: JSON.stringify(values)
    });
    return {
      success: true,
      message: JSON.stringify(data),
    }
  } catch (error) {
    console.error(`Falha ao sincronizar dados do cliente: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao sincronizar dados do cliente',
    }
  }
};