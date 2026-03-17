"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function ContributorLinkRoleAction(contributorId: string, roleId: string): Promise<IResponseObject<void>> {
  try {
    await fetchApi(FetchCtx.ERP, `/contributors/${contributorId}/roles/${roleId}`, {
      method: "POST",
      cache: "no-store",
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Falha ao vincular perfil: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao vincular perfil",
    };
  }
}
