// src/actions/commands/check-in.action.ts
"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export type CheckInItemDto = {
  itemId: string;
  removedIngredients?: string[];
}

export async function CommandsCheckInAction(
  orderId: string,
  items?: CheckInItemDto[]
): Promise<IResponseObject<any>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/commands/check-in/${orderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: items ? JSON.stringify({ items }) : undefined,
      cache: "no-store"
    })
    
    return { success: true, data };
  } catch (error) {
    console.error(`Falha ao realizar check-in: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao enviar para produção",
    };
  }
}
