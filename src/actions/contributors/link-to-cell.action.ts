"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function ContributorLinkToCellAction(contributorId: string, cellId: string): Promise<IResponseObject<void>> {
  try {
    await fetchApi(FetchCtx.ERP, `/contributors/${contributorId}/cells/${cellId}`, {
      method: "POST",
      cache: "no-store",
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Falha ao vincular colaborador à célula: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao vincular colaborador à célula",
    };
  }
}
