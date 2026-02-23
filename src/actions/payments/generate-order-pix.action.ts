// src/actions/payments/generate-order-pix.action.ts
"use server";

import { PaymentEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const GenerateOrderPixAction = async (orderId: string): Promise<IResponseObject<PaymentEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/payments/create-order-pix`, {
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
      data: data,
    };
  } catch (error) {
    console.error(`Falha ao gerar o QrCode para pagamento: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao gerar o QrCode para pagamento.'
    }
  }
};