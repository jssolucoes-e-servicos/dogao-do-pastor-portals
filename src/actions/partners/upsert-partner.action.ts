// src/actions/partners/upsert-partner.action.ts
"use server";

import { PartnerEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const UpsertPartnerAction = async (
  isEdit: boolean,
  partnerId: string,
  payload: unknown): Promise<IResponseObject<PartnerEntity>> => {
  try {
    const endpoint = isEdit ? `/partners/${partnerId}` : `/partners/register/${partnerId}`;
    const data = await fetchApi(FetchCtx.CUSTOMER, endpoint, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error(`Falha ao gravar parceiro: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao gravar parceiro. Tente novamante.',
    }    
  }
};