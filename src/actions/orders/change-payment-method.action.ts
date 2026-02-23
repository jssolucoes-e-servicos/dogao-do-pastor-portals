// src/actions/orders/change-payment.action.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const ChangePaymentMethodAction = async (orderId: string): Promise<IResponseObject<OrderEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.PUBLIC, `/orders/change-payment-method`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId:orderId, 
      }),
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao redefinir metodo de pagamento: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao redefinir metodo de pagamento.",
    };
  }
};