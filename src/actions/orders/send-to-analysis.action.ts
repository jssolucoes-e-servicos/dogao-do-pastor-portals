// src/actions/orders/send-to-analysis.actions.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const SendToAnalysisAction = async (orderId: string, customerAddressId: string, distance: number): Promise<OrderEntity> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/send-to-analysis`, {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        customerAddressId,
        distance
      })
    });
    return data as OrderEntity;
  } catch (error: any) {
      if (error.message === 'NEXT_REDIRECT') throw error;
      console.error(`Falha ao enviar pedido ${orderId} para analise: `, error);
      throw new Error('Falha ao enviar pedido para analise. Tente novamante.')
      
    }
};