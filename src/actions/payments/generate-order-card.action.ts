// src/actions/payments/generate-order-pix.action.ts
"use server";

import { PaymentEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

type GenerateOrderCardActionProps = {
  orderId: string;
  token: string;
  installments: number;
  payer: {
    name: string;
    email: string | undefined,
  },
}

export const GenerateOrderCardAction = async (payload: GenerateOrderCardActionProps
): Promise<IResponseObject<PaymentEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.PUBLIC, `/payments/create-order-card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error(`Falha ao processar o pagamento via cartão: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao processr o pagamento via cartão.'
    }
  }
};