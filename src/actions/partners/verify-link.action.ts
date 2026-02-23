// src/actions/partners/verify-link.action.ts
"use server";

import { IPartnerVerifyLinkResponse, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const VerifyLinkAction = async (id: string): Promise<IResponseObject<IPartnerVerifyLinkResponse>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/partners/verify-link/${id}`, {
      cache: "no-store"
    })
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error(`Falha ao validar link de convite: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao vrificar link de convite',
    }
  }
};
