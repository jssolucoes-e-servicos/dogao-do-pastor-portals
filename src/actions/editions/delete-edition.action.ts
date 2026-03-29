"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function DeleteEditionAction(id: string): Promise<IResponseObject<void>> {
  try {
    await fetchApi(FetchCtx.ERP, `/editions/${id}`, { method: 'DELETE', cache: "no-store" });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Falha ao remover edição" };
  }
}

export async function RestoreEditionAction(id: string): Promise<IResponseObject<void>> {
  try {
    await fetchApi(FetchCtx.ERP, `/editions/restore/${id}`, { method: 'POST', cache: "no-store" });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Falha ao restaurar edição" };
  }
}
