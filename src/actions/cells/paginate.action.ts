// src/actions/sellers/list.action.ts
"use server"

import { CellEntity } from "@/common/entities";
import { IPaginatedData, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function CellsPaginateAction(page = 1, search = ""): Promise<IResponseObject<IPaginatedData<CellEntity>>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: "10"
    });

    if (search) params.append("search", search);
    const data = await fetchApi(FetchCtx.ERP, `/cells?${params.toString()}`, {
      cache: "no-store"
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar paginação de células: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperar paginação de células",
    };
  }
}