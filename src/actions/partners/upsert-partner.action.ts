"use server";

import { PartnerEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const UpsertPartnerAction = async (
  isEdit: boolean,
  partnerId: string,
  payload: unknown): Promise<PartnerEntity> => {
  try {
    const endpoint = isEdit ? `/partners/${partnerId}` : `/partners/register/${partnerId}`;
    const data = await fetchApi(FetchCtx.CUSTOMER, endpoint, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    return data as PartnerEntity;
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    console.error("Falha ao gravar parceiro: ", error);
    throw new Error('Falha ao gravar parceiro. Tente novamante.')
    
  }
};