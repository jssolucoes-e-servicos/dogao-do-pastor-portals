'use server'

import { OrderEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

interface ResultAnalysisActionProps {
  orderId: string;
  approved: boolean;
  observations: string;
}

export const ResultAnalysisAction = async (values : ResultAnalysisActionProps): Promise<IResponseObject<OrderEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/orders/result-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
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