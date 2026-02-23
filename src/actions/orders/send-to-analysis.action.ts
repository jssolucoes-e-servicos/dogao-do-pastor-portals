// src/actions/orders/send-to-analysis.action.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const SendToAnalysisAction = async (orderId: string, customerAddressId: string, distance: number): Promise<IResponseObject<OrderEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/send-to-analysis`, {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        customerAddressId,
        distance
      })
    });
    return {
      success: true,
      data: data
    };
  } catch (error) {
      console.error(`Falha ao enviar pedido ${orderId} para analise: `, error);
      return{
        success: false,
        error: error instanceof Error ? error.message : 'Falha ao enviar pedido para analise. Tente novamante.',
      }
    }
};