// src/actions/commands/check-in.action.ts
"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function CommandsCheckInAction(orderId: string): Promise<IResponseObject<any>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/commands/check-in/${orderId}`, {
      method: 'POST',
      cache: "no-store"
    })
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao realizar check-in: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao enviar para produção",
    };
  }
}
