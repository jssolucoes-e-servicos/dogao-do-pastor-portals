"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function GetPartnerStatsAction(partnerId: string): Promise<IResponseObject<any>> {
  try {
    const data = await fetchApi(FetchCtx.PARTNER, `/partners/${partnerId}/stats`, {
      cache: "no-store"
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar estatísticas do parceiro: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperar estatísticas",
    };
  }
}
