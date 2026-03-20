"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function GetPaymentStatusAction(orderId: string): Promise<IResponseObject<any>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/payments/order/${orderId}`, {
      method: "GET",
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao consultar status do pagamento",
    };
  }
}
