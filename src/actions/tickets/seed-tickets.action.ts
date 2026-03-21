"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function GetTicketsStatusAction(): Promise<IResponseObject<Record<string, unknown>>> {
  try {
    const res = await fetchApi(FetchCtx.ERP, `/admin/seed-tickets/status`, {
      method: "POST",
      cache: "no-store",
    });
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao verificar tickets" };
  }
}

export async function SeedTicketsAction(): Promise<IResponseObject<Record<string, unknown>>> {
  try {
    const res = await fetchApi(FetchCtx.ERP, `/admin/seed-tickets`, {
      method: "POST",
      cache: "no-store",
    });
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao criar tickets" };
  }
}
