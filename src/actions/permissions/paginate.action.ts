"use server"

import { PermissionEntity } from "@/common/entities";
import { IPaginatedData, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function PermissionsPaginateAction(
  page = 1, 
  search = ""
): Promise<IResponseObject<IPaginatedData<PermissionEntity>>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: "10"
    });

    if (search) params.append("search", search);
    const data = await fetchApi(FetchCtx.ERP, `/permissions?${params.toString()}`, {
      cache: "no-store"
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar permissões: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperar lista de permissões",
    };
  }
}
