// src/actions/partners/get-by-id.action.ts
"use server";

import { PartnerEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const PartnerByIdAction = async (id: string): Promise<IResponseObject<PartnerEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/partners/find/${id}`, {
      cache: "no-store"
    })
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar parceiro: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperaar dados do parceiro",
    };
  }
};
