"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function UpdateCommandStatusAction(
  id: string,
  status: string
): Promise<IResponseObject<any>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/commands/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao atualizar status da comanda: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao atualizar status",
    };
  }
}
