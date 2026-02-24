// src/actions/partners/list-partners-all.action.ts
"use server";

import { PartnerEntity } from "@/common/entities";
import { IPaginatedData, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const ListPartnersAllAction = async (page = 1): Promise<IResponseObject<IPaginatedData<PartnerEntity>>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/partners/all?page=${page}`, {
      method: 'GET',
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