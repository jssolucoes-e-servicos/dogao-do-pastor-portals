"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function GetActiveEditionAction(): Promise<IResponseObject<Record<string, unknown>>> {
  try {
    const res = await fetchApi(FetchCtx.ERP, `/editions/active`, {
      cache: "no-store"
    });

    return {
      success: true,
      data: res
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao carregar edição ativa",
    };
  }
}
