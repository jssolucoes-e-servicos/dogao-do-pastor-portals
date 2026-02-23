// src/actions/partners/list-partners-for-orders.action.ts
"use server";

import { PartnerEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const ListPartnersForOrdersAction = async (): Promise<IResponseObject<PartnerEntity[]>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/partners/for-orders`, {
      cache: "no-store"
    })
    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error(`Falha ao listar parceiros para doacoes${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao listar parceiros para doações',
    }
  }
};
