"use server";

import { PaymentEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const GenerateOrderPixAction = async (orderId: string): Promise<PaymentEntity> => {
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

    return data as PaymentEntity;
  } catch (error: any) {
    console.error(error);
    if (error.message === 'NEXT_REDIRECT') throw error;
    throw new Error('Falha ao gerar o QrCode para pagamento.');
  }
};