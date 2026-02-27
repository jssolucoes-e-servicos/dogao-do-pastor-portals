// src/actions/partners/list-partners-all.action.ts
"use server";

import { PartnerEntity } from "@/common/entities";
import { IPaginatedData, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const PartnersPaginateAction = async (page = 1, search = ""): Promise<IResponseObject<IPaginatedData<PartnerEntity>>> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: "10"
    });

    if (search) params.append("search", search);
    const data = await fetchApi(FetchCtx.ERP, `/partners/all?${params.toString()}`, {
      cache: "no-store"
    });

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error(`Falha ao buscar lista administrativa de parceiros: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao listar parceiros",
    };
  }
};