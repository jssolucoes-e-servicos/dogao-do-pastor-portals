"use server";

import { PartnerEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const ListPartnersAction = async (): Promise<PartnerEntity[]> => {
  try {
    const partners = await fetchApi(FetchCtx.CUSTOMER, `/partners/for-orders`, {
      cache: "no-store"
    })
    return partners
  } catch (error) {
    console.error(error);
    throw new Error('Falha ao listar parceiros');
  }
};
