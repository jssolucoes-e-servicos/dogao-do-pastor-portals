// src/actions/partners/generate-invite.action.ts
"use server";

import { PartnerEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const GenerateInviteAction = async (): Promise<IResponseObject<PartnerEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/partners/invite/generate`, {
      method: 'POST',
    });
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error(`Falha ao gerar convite de parceiro: ${error}`)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao gerar convite de parceiro.",
    }
  }
};