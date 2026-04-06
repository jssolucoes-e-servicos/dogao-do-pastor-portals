"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function ListWithdrawalsAction(partnerId: string): Promise<IResponseObject<any[]>> {
  try {
    const res = await fetchApi(FetchCtx.PARTNER, `/donations/withdrawals/${partnerId}`, {
      cache: "no-store"
    });
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Falha ao carregar retiradas" };
  }
}
