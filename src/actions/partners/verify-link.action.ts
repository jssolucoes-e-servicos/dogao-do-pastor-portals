"use server";

import { IPartnerVerifyLinkResponse } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const VerifyLinkAction = async (id: string): Promise<IPartnerVerifyLinkResponse> => {
  try {
    const partners = await fetchApi(FetchCtx.CUSTOMER, `/partners/verify-link/${id}`, {
      cache: "no-store"
    })
    return partners as IPartnerVerifyLinkResponse
  } catch (error) {
    console.error(error);
    throw new Error('Falha ao vrificar link');
  }
};
