// src/actions/partners/generate-invite.action.ts
"use server";

import { PartnerEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const GenerateInviteAction = async (): Promise<PartnerEntity> => {
  try {
    // Chama o backend para criar um registro "seed-like" de um único parceiro
    const data = await fetchApi(FetchCtx.CUSTOMER, `/partners/invite/generate`, {
      method: 'POST',
    });
    return data as PartnerEntity;
  } catch (error: any) {
    throw new Error("Falha ao gerar convite de parceiro.");
  }
};