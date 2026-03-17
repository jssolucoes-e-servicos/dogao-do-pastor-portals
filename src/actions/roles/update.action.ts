"use server"

import { RoleEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function RoleUpdateAction(id: string, data: Partial<RoleEntity>): Promise<IResponseObject<RoleEntity>> {
  try {
    const response = await fetchApi(FetchCtx.ERP, `/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      cache: "no-store",
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error(`Falha ao atualizar perfil: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao atualizar perfil",
    };
  }
}
