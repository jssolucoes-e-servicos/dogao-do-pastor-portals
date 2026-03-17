"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function ContributorSetPermissionAction(
  contributorId: string, 
  moduleId: string, 
  permissions: any
): Promise<IResponseObject<void>> {
  try {
    await fetchApi(FetchCtx.ERP, `/contributors/${contributorId}/permissions/${moduleId}`, {
      method: "POST",
      body: JSON.stringify(permissions),
      cache: "no-store",
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Falha ao definir permissão: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao definir permissão",
    };
  }
}
