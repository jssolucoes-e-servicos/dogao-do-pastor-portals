"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function RoleSetPermissionAction(
  roleId: string, 
  moduleId: string, 
  permissions: any
): Promise<IResponseObject<void>> {
  try {
    await fetchApi(FetchCtx.ERP, `/roles/${roleId}/permissions/${moduleId}`, {
      method: "POST",
      body: JSON.stringify(permissions),
      cache: "no-store",
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Falha ao definir permissão do perfil: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao definir permissão do perfil",
    };
  }
}
