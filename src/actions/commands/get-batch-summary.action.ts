"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function GetBatchSummaryAction(): Promise<IResponseObject<any[]>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, '/commands/batch/summary', { cache: "no-store" });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro" };
  }
}

export async function PullBatchAction(hour: number, slot: 'first' | 'second'): Promise<IResponseObject<{ pulled: number }>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, '/commands/batch/pull', {
      method: 'POST',
      body: JSON.stringify({ hour, slot }),
      cache: "no-store",
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro" };
  }
}
