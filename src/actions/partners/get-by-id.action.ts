"use server";

import { PartnerEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const GetByIdAction = async (id: string): Promise<PartnerEntity> => {
  try {
    const partners = await fetchApi(FetchCtx.CUSTOMER, `/partners/find/${id}`, {
      cache: "no-store"
    })
    return partners as PartnerEntity;
  } catch (error) {
    console.error(error);
    throw new Error('Falha ao listar parceiros');
  }
};
