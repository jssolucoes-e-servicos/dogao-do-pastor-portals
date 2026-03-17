"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function RoleDeleteAction(id: string): Promise<IResponseObject<void>> {
  try {
    await fetchApi(FetchCtx.ERP, `/roles/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Falha ao remover perfil: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao remover perfil",
    };
  }
}
