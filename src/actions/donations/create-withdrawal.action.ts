"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function CreateWithdrawalAction(dto: {
  partnerId: string;
  scheduledAt: string;
  items: Array<{
    quantity: number;
    removedIngredients: string[];
  }>;
}): Promise<IResponseObject<any>> {
  try {
    const res = await fetchApi(FetchCtx.ERP, `/donations/create-withdrawal`, {
      method: "POST",
      body: JSON.stringify(dto),
      cache: "no-store"
    });

    return {
      success: true,
      data: res
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao criar solicitação de retirada",
    };
  }
}
